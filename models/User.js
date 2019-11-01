const slack = require('./../slack');

class User {
    constructor(id) {
        this.id = id;
    }

    /**
     * Gets the user's username
     */
    getUserName() {
        const token = process.env.SLACK_AUTH_TOKEN

        return slack.getUserName(token, this.id);
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