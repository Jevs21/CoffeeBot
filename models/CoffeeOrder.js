/**
 * CoffeeOrder
 *
 * Responsible for communication with the database regarding coffee orders
 */

const db = require('../db');
const moment = require('moment')

class CoffeeOrder {
    constructor(userId) {
        this.userId = userId;
    }

    /**
     * Creates a new coffee order
     * @param threadId Slack thread ID
     * @param channelId Slack channel ID
     */
    async createOrder(threadId, channelId) {
        await db.createNewOrder(this.userId, moment().format('YYYY-MM-DD H:mm:ss'), threadId, channelId);
    }

    /**
     * Creates a new user order
     * @param orderId order ID
     */
    async createUserOrder(orderId) {
        await db.createUserOrder(this.userId, orderId);
    }

    toSlackStr() {

    }
}

module.exports = CoffeeOrder;