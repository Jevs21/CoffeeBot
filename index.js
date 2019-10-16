require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const slack = require('./slack');
const {
  logger
} = require('./logger');

const coffeeRouter = require('./routes/coffee');

// Creates express app
const app = express();

// The port used for Express server
const PORT = process.env.PORT || 3000;
// Starts server
app.listen(PORT, function () {
  console.log('Bot is listening on port ' + PORT);
});

app.use(bodyParser.urlencoded({ extended: true }));

// Log request information
app.use(logger);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// coffee API controller
// All requuests will be forwarded to this router
app.use('/coffee', coffeeRouter);

app.post('/', (req, res) => {
  const data = {
    form: {
      token: process.env.SLACK_AUTH_TOKEN,
      channel: "#bot_madness",
      text: "Hi! :wave: \n I'm your new bot."
    }
  };

  slack.postMessage(data, res);
});

module.exports = app;
