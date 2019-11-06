/**
 * Module containing slack interactions
 */

const request = require('request');

// Post a message to slack
exports.postMessage = (data, res) => new Promise((resolve, reject) => {
  request.post('https://slack.com/api/chat.postMessage', data, (err, response, body) => {
    if (err) {
      reject(err);
    } else {
      resolve(body);
    }
  });
});

// Get messages from a Slack thread
exports.getConversationReplies = (data, res) => new Promise((resolve, reject) => {
  request.get('https://slack.com/api/conversations.replies', data, (err, response, body) => {
    if (err) {
      reject(err);
    } else {
      resolve(body);
    }
  });
});

// retrieve slack users
exports.list = (data, res) => new Promise((resolve, reject) => {
  request.get(`https://slack.com/api/users.list?token=${data.token}`, data, (error, response, body) => {
    if (error) {
      PromiseRejectionEvent(error);
    } else {
      resolve(body);
    }
  });
});


// Get information about a user
exports.getUserInformation = (token, userId) => new Promise((resolve, reject) => {
  request.get(`https://slack.com/api/users.info?token=${token}&user=${userId}`, (error, response, body) => {
    if (error) {
      reject(error);
    } else {
      resolve(JSON.parse(body));
    }
  });
});

// Gets a user's name
exports.getUserName = (token, userId) =>
  this.getUserInformation(token, userId)
    .then(resp => resp.user.name);
