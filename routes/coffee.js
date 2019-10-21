const express = require('express');

const db = require('../db');

const router = express.Router();
const CoffeePreference = require('../models/CoffeePreference');
const CoffeeShopPreference = require('../models/CoffeeShopPreference');
const slack = require('../slack');

// coffee API routes
router.get('/', (req, res) => {
    res.send('INDEX OF COFFEE API');
});

router.post('/preference/get', async (req, res) => {
    try {
        const targetName = req.body.text.split(/(?:@| )+/)[1];
        if (!targetName) {
            throw new Error("INVALID INPUT. User name required.");
        }

        const data = {
            token: process.env.SLACK_AUTH_TOKEN
        };

        // there's no way to get a user by their username, so we have to get a list of users and find them
        const response = await slack.list(data, res);
        const userList = JSON.parse(response);
        //res.send(`userList: ${JSON.stringify(userList)}`);
        var targetId;

        // looping through the list of users to find the first coordinating name (names SHOULD be unique)
        userList.members.forEach(member => {
            if (member.name == targetName) {
                targetId = member.id;
            }
        });

        if (!targetName) {
            throw new Error("INVALID INPUT. User not found.");
        }

        const targetPreferences = await db.getPreferences(targetId);

        res.send(`${targetName} prefers a ${targetPreferences.size} ${targetPreferences.type} ${targetPreferences.details} from Starbucks.`);
    } catch (err) {
        console.warn(err);
        res.status(422).send("INVALID");
    }
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