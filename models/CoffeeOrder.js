/**
 * CoffeeOrder
 *
 * Responsible for communication with the database regarding coffee orders
 */

const db = require('../db');
const moment = require('moment');

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
     * Retrieve an order by date
     * @param dateStr [Optional] A date string (should be validated with createDateStr()) to query the database with
     *                If null, return the most recent order.
     */
  async getOrder(dateStr = null) {
    if (dateStr) {
      console.log('getting by date.');
      return db.getOrderByDate(dateStr);
    }
    console.log('getting by recent.');
    return db.getMostRecentOrder();
  }

  /**
     * Function to turn the user's date input, into a proper string to query the 'order' table by date
     * @param str the user's input
     * @returns null if string is invalid
     *          formatted string if valid
     */
  createDateStr(str) {
    if (str.length == 10) {
      if (/^(\d{4})(-)(\d{2})(-)(\d{2})$/.test(str)) { // Test for 'YYYY-MM-DD'
        return str;
      } else if (/^(\d{4})(\/)(\d{2})(\/)(\d{2})$/.test(str)) { // TEST for 'YYYY/MM/DD'
        return str.replace(/\//g, '-');
      } else if (/^(\d{4})(\s)(\d{2})(\s)(\d{2})$/.test(str)) { // Test for 'YYYY MM DD'
        return str.replace(/\s/g, '-');
      }
    } else {
      return null;
    }
  }

  /**
     * Get a user's order for user_order table
     * @param orderId the id of the order in db
     * @param userId the user you want the response of
     */
  async getUserOrder(orderId, userId) {
    await db.getUserOrder(orderId, userId);
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
