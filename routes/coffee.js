const express = require('express');
const router = express.Router();
const coffeePreference = require('../models/CoffeePreference');


// coffee API routes
router.get('/', (req, res) => {
    res.send('INDEX OF COFFEE API');
});

/**
 * Gets a list of coffee preferences and shop
 * preferences for a single user by id
 * @param  URI '/preferences/:id' id of user
 * @param  Request, Response (req,res  Request and response objects
 * @return Response  Slack response to the request user
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

router.post('/preference/save', (req, res) => {
    res.send('SAVE COFFEE PREFERENCES');
});

router.post('/shop/save', (req, res) =>{
    res.send('SAVE COFFEE SHOP PREFERENCE');
})

module.exports = router;