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

    let dateStrArg = req.body.text;
    const channel_id = req.body.channel_id;
    const user_id = req.body.user_id;

    try {
        let error = false;

        let botOutput = "";
        let getterString = ""; // A string to add to the end of the bot's output to say who is getting the order
        
        const order = new CoffeeOrder(user_id);

        let recentOrderRow = {};

        if(dateStrArg) {
            dateStrArg = order.createDateStr(dateStrArg);
            
            if(dateStrArg == null) { // Invalid date string provided
                error = true;
                botOutput = `'${req.body.text}' is an invalid argument! You must enter the date of the desired order [YYYY-MM-DD].`;
            } else {
                recentOrderRow = await order.getOrder(dateStrArg); // dateStr is either valid (YYYY-MM-DD)
            }
        } else {
            recentOrderRow = await order.getOrder(); // getting most recent
        }
        
        // Get most recent order id
        let orderId = 0;
        let orderGetter = 0;
        let orderDate = '';
        if(!error) {
            if(!recentOrderRow) {
                // Checks to see if a date was provided for the error message
                error = true;
                botOutput = (req.body.text) ? `There was no order on ${dateStrArg}` : "There are no orders in the database.";
            } else {
                // Add user responses from a coffee order
                orderId = recentOrderRow.id;
                orderGetter = recentOrderRow.coffee_getter;
                orderDate = recentOrderRow.date;

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
                    // START FORMATTING THE OUTPUT STRING

                    botOutput += `Coffee Order for ${orderDate}\n\n`;

                    for (let curUserId of replyUsers) {
                        let curUser = new User(curUserId);
                        let curUserPref = new CoffeePreference(curUserId);
                        await curUserPref.loadPreferences();
                        const hasDrink = curUserPref.hasPreferencesSet();

                        if (hasDrink) {
                            botOutput += `<@${await curUser.getUserName()}>: ${curUserPref.size} ${curUserPref.type} ${curUserPref.details}\n`;
                        } else {
                            botOutput += `<@${await curUser.getUserName()}>: has no preferences!\n`;
                        }

                        // Users have responses to orders, we assign orders to the user in the db
                        curUser.respond(orderId);

                        // Check to see if user is the getter
                        if(curUserId == orderGetter) {
                            getterString = `\n<@${await curUser.getUserName()}> is getting the coffee!\n`;
                        }
                    }

                    botOutput += getterString
                }
                else {
                    botOutput = `There are no users in this order!`;
                }
            }
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

router.post('/shop/all', async (req, res) => {
    try {
        const userId = req.body.user_id;
        const coffeeShopPreferences = new CoffeeShopPreference(userId);
        const allShops = await coffeeShopPreferences.getAllShopPreferences();
        let printShops = "";

        if (allShops && allShops.length > 0) {
            let prevUser = allShops[0].user_id;
            printShops = printShops.concat(`All coffee shop preferences:`);

            // Get shop preference details
            for (let i in allShops) {
                let currentShopPref = allShops[i];
                let currentUser = currentShopPref.user_id;
                const nextShopPref = allShops[parseInt(i)+1];

                if (i == 0 || prevUser != currentUser) {
                    // Get username
                    const user = new User(currentUser)
                    printShops = printShops.concat(`\n<@${await user.getUserName()}> prefers`);

                } else {
                    printShops = printShops.concat((nextShopPref && nextShopPref.user_id != currentUser) || !nextShopPref ? ` and` : ``);
                }

                // Get shop name and location
                printShops = printShops.concat(` ${currentShopPref.name}`);
                printShops = printShops.concat(currentShopPref.location ? ` (${currentShopPref.location})` : "");
                printShops = printShops.concat(nextShopPref && nextShopPref.user_id == currentUser ? `,` : ``);

                prevUser = currentUser;
            }
        }

        res.status(200).send(printShops ? printShops : `No coffee shop preferences have been saved.`);

    } catch(err) {
        res.status(400).send("INVALID.");
    }
});

module.exports = router;