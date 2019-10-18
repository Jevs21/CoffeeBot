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
 * @return Response  A JSON object listing coffee and shop preferences
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

router.post('/preference/save', async (req, res) => {
    try {
        // TODO move this somewhere else
        const userId = req.body.user_id;
        const newPreferences = req.body.text.split(' ');
        const size = newPreferences[0];
        const type = newPreferences[1];
        const details = newPreferences[2];

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

        if (!name || !location) {
            throw new Error("INVALID INPUT. Usage: /coffee/savecoffeeshop [name], [location]");
        }

        const coffeeShopPreference = new CoffeeShopPreference(userId)
        await coffeeShopPreference.saveCoffeeShopPreference(name, location);

        res.status(200).send(`Saved coffee shop preference:\n ${await coffeeShopPreference.printSavedCoffeeShopPreference()}`);

    } catch(err) {
        res.status(400).send(err.message);
    }
})

module.exports = router;