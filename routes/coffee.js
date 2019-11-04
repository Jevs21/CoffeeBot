const express = require('express');

const db = require('../db');

const router = express.Router();
const CoffeePreference = require('../models/CoffeePreference');
const CoffeeShopPreference = require('../models/CoffeeShopPreference');
const CoffeeOrder = require('../models/CoffeeOrder');
const User = require('../models/User');
const Slack = require('../slack/index');

// coffee API routes
router.get('/', (req, res) => {
    res.send('INDEX OF COFFEE API');
});

/**
 * POST to /preference/get that retrieves coffee and shop preferences for a given user
 */
router.post('/preference/get', async (req, res) => {
    try {
        // parses the @ and spaces out to identify a username in the message
        const targetName = req.body.text.split(/(?:@| )+/)[1];
        if (!targetName) {
            res.send('I need a username to get preferences for! Try @<username>.');
        } else {
            const targetUser = new User(null, targetName);
            await targetUser.lookupIdByUserName();

            targetId = targetUser.getId();
            if (!targetId) {
                res.send('I couldn\'t find a user with that name!');
            } else {
                var outputString = '';
                const targetDrinkPreferences = new CoffeePreference(targetId);
                await targetDrinkPreferences.loadPreferences();
                const hasDrink = targetDrinkPreferences.hasPreferencesSet();

                const targetShopPreferences = new CoffeeShopPreference(targetId);
                await targetShopPreferences.loadPreferences();
                const hasShop = targetShopPreferences.hasPreferencesSet();

                if (hasDrink || hasShop) {
                    outputString = `<@${targetName}>`;

                    if (hasDrink) {
                        outputString += ` prefers a ${targetDrinkPreferences.size} ${targetDrinkPreferences.type} ${targetDrinkPreferences.details}`;
                        if (hasShop) {
                            outputString += ` and their `;
                        }
                    }

                    if (hasShop) {
                        if (!hasDrink) {
                            outputString += '\'s ';
                        }
                        outputString += `favourite cafe is ${targetShopPreferences.name}`;

                        if (targetShopPreferences.location) {
                            outputString += `, ${targetShopPreferences.location}`;
                        }
                    }
                } else {
                    outputString = `<@${targetName}> has no preferences, maybe ask them`;
                }

                res.send(`${outputString}!`);
            }
        }
    } catch (err) {
        console.warn(err);
        res.status(422).send("INVALID");
    }
});

router.get('/order-:order_id', (req, res) => {
    res.send('COFFEE ORDER BY ID - SEND TO USER');
});

router.post('/order/create', async (req, res) => {
    try {
        const userId = req.body.user_id;

        const data = {
            form: {
              token: process.env.SLACK_AUTH_TOKEN,
              channel: "#bot_madness",
              text: `Hi Kubotic! Who wants coffee? Let <@${req.body.user_name}> know by replying to this message.`
            }
        }

        const message = await Slack.postMessage(data);
        const messageJSON = JSON.parse(message);
        const order = new CoffeeOrder(userId)
        await order.createOrder(messageJSON.ts, messageJSON.channel);

        res.status(200).send('New order created.');

    } catch(err) {
        console.warn(err);
        res.status(400).send('INVALID INPUT');
    }
});

router.post('/order-:order_id/respond', (req, res) => {
    res.send('RESPOND AS A USER TO COFFEE ORDER');
});

router.get('/order/history', (req, res) => {
    res.send('DISPLAY ORDER HISTORY');
});

router.get('/order/history/:user_id', (req, res) => {
    res.send('DISPLAY ORDER HISTORY OF A SPECIFIC COFFEE GETTER');
});

/**
 * Gets the most recent order, the users who responded to the order
 * and the preferences for each of those users. Puts all this information
 * into a string (including who is picking up the order) and outputs it
 * @param URI '/orders/display'
 * @param Request, Response (req, res Request and response objects)
 */
// TODO - change user's ids to names
router.post('/orders/display', async (req, res) => {
    const arg = req.body.text;

    try {
        let isArg = arg != "" ? true : false;

        let botOutput = "";
        let getterString = ""; // A string to add to the end of the bot's output to say who is getting the order
        let error = false;

        let recentOrderRow = {};

        if(isArg) { // Regex to test if arg matches a single digit (order id)
            if(/^(\d)+$/.test(arg)){
                recentOrderRow = await db.getOrderById(arg);
            } else {
                error = true;
                botOutput = `'${arg}' is an invalid argument! You must enter the id number of the desired order, or no id for the most recent order.`
            }
        } else {
            recentOrderRow = await db.getMostRecentOrder();
        }
        
        // Get most recent order id
        let recentOrderId = 0;
        let recentOrderGetter = 0;
        let recentOrderDate = '';
        if (!recentOrderRow && !error){
            error = true;
            botOutput = isArg ? `There is no order with id: ${arg}` : "There are no orders in the database."
        } else {
            recentOrderId = recentOrderRow.id;
            recentOrderGetter = recentOrderRow.coffee_getter;

            // Add user responses from a coffee order
            const data = {
                qs: {
                    token: process.env.SLACK_OAUTH_ACCESS_TOKEN,
                    channel: recentOrderRow.channel_id,
                    ts: recentOrderRow.thread_id
                }
            }

            const messages = await Slack.getConversationReplies(data);
            const messagesJSON = JSON.parse(messages);
            let replyUsers;

            if (messagesJSON && messagesJSON.messages && messagesJSON.messages[0]) {
                replyUsers = messagesJSON.messages[0].reply_users;
            }

            if (replyUsers) {
                for (let i in replyUsers) {
                    let userOrder = await db.getUserOrder(recentOrderId, replyUsers[i]);

                    // Create new user order if one has not already been made
                    if (!userOrder) {
                        const coffeeOrder = new CoffeeOrder(replyUsers[i]);
                        coffeeOrder.createUserOrder(recentOrderId);
                    }
                }
            }
            recentOrderDate = recentOrderRow.date;
        }

        // Get all responses to order id
        let responsesRows = [];
        if(!error) {
            responsesRows = await db.getUserResponsesToOrder(recentOrderId);
            
            if(responsesRows.length == 0){
                error = true;
                botOutput = "There are no users associated with this order!";
            }
        }
        
        // Get preferences for all users opted-in to most recent order
        if(!error) {
            botOutput += `Coffee Order for ${recentOrderDate}\n\n`;

            for(row of responsesRows) {
                const user = new User(row.user_id)
                let curPrefRow = await db.getDrinkPreferences(row.user_id);

                if (!curPrefRow) {
                    botOutput += `<@${await user.getUserName()}> does not have any preferences\n`;

                } else {
                    // Get preference into output string
                    if(row.response == 1) {
                        botOutput += `<@${await user.getUserName()}> would like a ${curPrefRow.size} ${curPrefRow.type} (${curPrefRow.details})\n`;
                    } else {
                        botOutput += `<@${await user.getUserName()}> doesn't want anything.\n`;
                    }
                }

                // Check to see if user is the getter
                if(row.user_id == recentOrderGetter) {
                    getterString = `\n<@${await user.getUserName()}> is getting the coffee!\n`;
                }
            }

            botOutput += getterString;
        }

        // Check then send string.
        if(botOutput == "") {
            botOutput = "Something went wrong when I tried to get everyone's preferences!";
        }

        res.send(botOutput);
    } catch (err) {
        console.warn(err);
        res.status(422).send('Error in /orders/display route.');
    }
});

router.post('/preference/save', async (req, res) => {
    try {
        // TODO move this somewhere else
        const userId = req.body.user_id;
        const newPreferences = req.body.text.split(' ');
        const size = newPreferences[0];
        const type = newPreferences[1];
        const details = newPreferences.splice(2).join(' ');

        const preference = new CoffeePreference(userId)
        await preference.savePreferences(size, type, details);

        res.send(`Saved preference:\n ${preference.toSlackStr()}`);
    } catch (err) {
        console.warn(err);
        res.status(422).send('INVALID INPUT');
    }
});

/**
 * Delete a shop preference by name and location
 * Potentially will delete more than one
 */
router.post('/shop/delete', async (req, res) => {
    try {
        const userId = req.body.user_id;
        console.log(req.body.text);
        if (!req.body.text) {
            return res.send('Usage: /delete-shop [name] OR [name], [location]');
        }

        const shop = CoffeeShopPreference.parseNewFromStr(req.body.text);
        if (!shop.name) {
            return res.send('Usage: /delete-shop [name] OR [name], [location]');
        }

        const coffeeShopPreference = new CoffeeShopPreference(userId, shop);

        // delete from the database
        const result = await coffeeShopPreference.delete();
        // return a friendly response
        res.status(200).send(result);
    } catch(err) {
        res.status(400).send(err.message);
    }
});

router.post('/shop/save', async (req, res) => {
    try {
        const userId = req.body.user_id;
        const newCoffeeShopPreference = req.body.text;
        const name = newCoffeeShopPreference.split(',')[0].trim();
        const location = newCoffeeShopPreference.slice(name.length).replace(/[, ]+/g, " ").trim();

        if (!name) {
            throw new Error("INVALID INPUT. Coffee shop name required.");
        }

        const coffeeShopPreference = new CoffeeShopPreference(userId)
        await coffeeShopPreference.saveCoffeeShopPreference(name, location);

        res.status(200).send(`Saved coffee shop preference:\n ${await coffeeShopPreference.printSavedCoffeeShopPreference()}`);

    } catch(err) {
        res.status(400).send(err.message);
    }
});

module.exports = router;