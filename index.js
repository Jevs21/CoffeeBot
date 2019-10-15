require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const slack = require('./slack');
const {
  logger
} = require('./logger');

// Creates express app
const app = express();
// The port used for Express server
const PORT = 3000;
// Starts server
app.listen(process.env.PORT || PORT, function () {
  console.log('Bot is listening on port ' + PORT);
});

// Log request information
app.use(logger);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.post('/', (req, res) => {
  const data = {
    form: {
      token: process.env.SLACK_AUTH_TOKEN,
      channel: "#general",
      text: "Hi! :wave: \n I'm your new bot."
    }
  };

  slack.postMessage(data, res);
});

module.exports = app;
