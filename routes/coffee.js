const express = require('express');

const db = require('../db');

const router = express.Router();
const CoffeePreference = require('../models/CoffeePreference');
const CoffeeShopPreference = require('../models/CoffeeShopPreference');

// coffee API routes
router.get('/', (req, res) => {
    res.send('INDEX OF COFFEE API');
});

/**
 * Gets a list of coffee preferences and shop
 * preferences for a single user by id
 * @param  URI '/preferences/:id' id of user
 * @param  Request, Response (req,res  Request and response objects
 * @return Response A JSON object listing shop preferences
 * 
 */
router.get('/preferences/:id', (req, res) => {
    res.send('PREFERENCES OF A SINGLE USER');
});

router.get('/order-:order_id', (req, res) => {
    res.send('COFFEE ORDER BY ID - SEND TO USER');
});

router.post('/new-order', (req, res) => {
    res.send('CREATE A NEW COFFEE ORDER FOR PEOPLE TO RESPOND TO');
});

router.post('/order-:order_id/respond', (req, res) => {
    res.send('RESPOND AS A USER TO COFFEE ORDER');
});

/**
 * Gets the most recent order, the users who responded to the order
 * and the preferences for each of those users. Puts all this information
 * into a string (including who is picking up the order) and outputs it
 * @param URI '/dorders/display'
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
                let curPrefRow = await db.getPreferences(row.user_id);
                // console.log(curPrefRow);
                
                // Get preference into output string
                if(row.response == 1) {
                    botOutput += `User ${row.user_id} would like a ${curPrefRow.size} ${curPrefRow.type} (${curPrefRow.details})\n`;
                } else {
                    botOutput += `User ${row.user_id} doesn't want anything.\n`;
                }

                // Check to see if user is the getter
                if(row.user_id == recentOrderGetter) {
                    getterString = `\nUser ${row.user_id} is getting the coffee!\n`;
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
})

module.exports = router;