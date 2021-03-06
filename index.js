require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const slack = require('./slack');
const {
	logger,
} = require('./logger');

const coffeeRouter = require('./routes/coffee');

// Creates express app
const app = express();

// The port used for Express server
const PORT = process.env.PORT || 3000;
// Starts server
app.listen(PORT, () => {
	console.log(`Bot is listening on port ${PORT}`);
});

app.use(bodyParser.urlencoded({ extended: true }));

// Log request information
app.use(logger);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// coffee API controller
// All requuests will be forwarded to this router
app.use('/coffee', coffeeRouter);

// Print out all of the available routes
console.log(
	'Routes:\n',
	coffeeRouter.stack.map(x => x.route.path),
);

module.exports = app;
