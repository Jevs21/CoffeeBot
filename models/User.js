const Slack = require('./../slack');
const db = require('../db');

class User {
    constructor(id, ...username) {
        this.id = id;

        if (username) {
            this.username = username[0];
        }
    }

    /**
     * Gets the user's id based on their username
     */
    async lookupIdByUserName() {
        const data = {
            token: process.env.SLACK_AUTH_TOKEN
        };
        const response = await Slack.list(data);
        const userList = JSON.parse(response);

        var targetId;

        // looping through the list of users to find the first coordinating name (names SHOULD be unique)
        if (userList.members) {
            userList.members.forEach(member => {
                if (member.name == this.username) {
                    targetId = member.id;
                }
            });
        } else {
            targetId = null;
        }

        if (!targetId) {
            targetId = await db.getTestUserId(this.username);

            if (targetId) {
                this.id = targetId.user_id;
            } else {
                this.id = null;
            }

            return this.id;
        } else {
            this.id = targetId;

            return targetId;
        }

    }

    /**
     * reports the id of the user
     */
    getId() {
        return this.id;
    }

    /**
     * Gets the user's username
     */
    getUserName() {
        const token = process.env.SLACK_AUTH_TOKEN
        this.username = Slack.getUserName(token, this.id);
        return this.username;
    }

    /**
     * Respond to a CoffeeOrder
     * @param  CoffeeOrder order    A valid CoffeeOrder object
     * @param  String response      A valid response to the order
     * @return Boolean              True on success, False on failure
     */
    respond(order, response) {

    }
}

module.exports = User;