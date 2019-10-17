/**
 * Module containing slack interactions
 */

const request = require("request");

// Post a message to slack
exports.postMessage = (data, res) => {
    return request.post('https://slack.com/api/chat.postMessage', data, function (error, response, body) {
        // Sends welcome message
        res.json()
    });
}