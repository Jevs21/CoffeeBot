/**
 * CoffeeShopPreference
 *
 * Responsible for communication with the database regarding coffee shop preference
 */

const db = require('../db');
const User = require('./User');

class CoffeeShopPreference {
  constructor(userId, details = null) {
    this.user = new User(userId);
    if (details) {
      this.location = details.location;
      this.name = details.name;
    }
  }

  /**
     * Gets a user's preferences
     */
  getPreferences() {
    return db.getCoffeeShopPreference(this.user.id);
  }

  /**
     * Loads a users preferences onto the object
     */
  async loadPreferences() {
    const preferences = await this.getPreferences();
    if (preferences) {
      this.name = preferences.name;
      this.location = preferences.location ? preferences.location : '';
    } else {
      this.name = '';
      this.location = '';
    }
  }

  /**
     * Saves a user's coffee shop preference
     * @param {string} name
     * @param {string} location
     */
  async saveCoffeeShopPreference(name, location) {
    this.savedCoffeeShop = await db.saveCoffeeShopPreference(this.user.id, name, location);

    await this.loadPreferences();
  }

  /**
     * Returns true if any of the shop preferences have been saved
     * @returns {boolean} If the shop preferences have been set
     */
  hasPreferencesSet() {
    return this.name || this.location;
  }

  /**
     * Prints details of the saved coffee shop preference
     * @return {string} Formatted details of coffee shop preference
     */
  async printSavedCoffeeShopPreference() {
    if (this.savedCoffeeShop) {
      const shop = await db.getCoffeeShopPreferenceById(this.savedCoffeeShop.lastID);

      return shop.location ? `${shop.name}, ${shop.location}` : `${shop.name}`;
    }

    return 'No coffee shop preferences saved.';
  }

  async delete() {
    const result = await db.deleteCoffeeShopPreference(this.user.id, this.name, this.location);
    return result.changes ?
      `${result.changes} coffee shop${(result.changes > 1 ? 's' : '')} deleted` :
      'No coffee shops found';
  }

  async getAllShopPreferences() {
    return await db.getAllShopPreferences();
  }

  static parseNewFromStr(str) {
    str = str.toLowerCase();
    const name = str.split(',')[0].trim();
    return {
      name,
      location: str.slice(name.length).replace(/[, ]+/g, ' ').trim(),
    };
  }
}

module.exports = CoffeeShopPreference;
