/**
 * Module containing slack interactions
 */

const request = require("request");

// Post a message to slack
exports.postMessage = (data, res) => {
    return request.post('https://slack.com/api/chat.postMessage', data, function (error, response, body) {
        // Sends welcome message
        res.json();
    });
} 

// retrieve slack users
exports.list = (data, res) => {
    return new Promise((resolve, reject) => {
        request.get('https://slack.com/api/users.list', data, function(error, response, body) {
            if (error) {
                PromiseRejectionEvent(error);
            } else {
                resolve(body);
            }
        });
    });
}