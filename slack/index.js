/**
 * Module containing slack interactions
 */

const request = require("request");

// Post a message to slack
exports.postMessage = (data, res) => {
    return new Promise((resolve, reject) => {
        request.post('https://slack.com/api/chat.postMessage', data, (err, response, body) => {
            if (err) {
                reject(err)
            } else {
                resolve(body)
            }
        });
    });
}

// Get messages from a Slack thread
exports.getConversationReplies = (data, res)  => {
    return new Promise((resolve, reject) => {
        request.get('https://slack.com/api/conversations.replies', data, (err, response, body) => {
            if (err) {
                reject(err)
            } else {
                resolve(body)
            }
        });
    });
}

// retrieve slack users
exports.list = (data, res) => {
    return new Promise((resolve, reject) => {
        request.get(`https://slack.com/api/users.list?token=${data.token}`, data, function(error, response, body) {
            if (error) {
                PromiseRejectionEvent(error);
            } else {
                resolve(body);
            }
        });
    });
}