/**
 * CoffeePreference
 *
 * Responsible for communication with the database
 */

const db = require('../db');
const User = require('./User');

class CoffeePreference {
  constructor(userId) {
    this.user = new User(userId);
  }

  /**
     * Gets a user's preferences by their id
     * @param {integer} id
     */
  static async get(id) {
    const preference = new CoffeePreference(id);
    await preference.load();
    return preference;
  }


  /**
     * Loads a users preferences onto the object
     */
  async load() {
    const preferences = await db.getDrinkPreferences(this.user.id);
    if (preferences) {
      this.size = preferences.size;
      this.type = preferences.type;
      this.details = preferences.details;
    } else {
      this.size = '';
      this.type = '';
      this.details = '';
    }
  }

  /**
     * Saves a users preferences
     * @param {string} size
     * @param {string} type
     * @param {string} details
     */
  async save(size, type, details) {
    await db.saveDrinkPreferences(this.user.id, size, type, details);

    // Refresh object preferences
    await this.load();
  }

  /**
     * Returns true if any of the preferences have been saved
     * @returns {boolean} If the preferences have been set
     */
  hasPreferencesSet() {
    return this.size || this.type || this.details;
  }

  /**
     * Writes the preferences in a pretty slack format
     */
  toSlackStr() {
    let str = '';
    if (this.hasPreferencesSet()) {
      str = `Size: ${this.size}\nType: ${this.type}\nDetails: ${this.details}`;
    } else {
      str = 'No preferences saved.'
    }
    return str;
  }
}

module.exports = CoffeePreference;
