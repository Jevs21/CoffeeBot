require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const request = require("request");

const {
  logger
} = require('./logger')

const coffeeRouter = require('./routes/coffee');

// Creates express app
const app = express();
// The port used for Express server
const PORT = 3000;
// Starts server
app.listen(process.env.PORT || PORT, function() {
  console.log('Bot is listening on port ' + PORT);
});

// Log request information
app.use(logger);

// coffee API controller
// All requuests will be forwarded to this router
app.use('/coffee', coffeeRouter);

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.post('/', (req, res) => {
var data = {form: {
      token: process.env.SLACK_AUTH_TOKEN,
      channel: "#general",
      text: "Hi! :wave: \n I'm your new bot."
    }};
request.post('https://slack.com/api/chat.postMessage', data, function (error, response, body) {
      // Sends welcome message
      res.json();
    });
});
