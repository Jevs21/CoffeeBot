/**
 * CoffeePreference 
 *
 * Responsible for communication with the database
 */

const db = require('../db');

class CoffeePreference {
    constructor(userId) {
        this.userId = userId;
    }

    /**
     * Gets a user's preferences
     * @param {string} userId
     */
    getPreferences() {
        return db.getDrinkPreferences(this.userId);
    }

    /**
     * Loads a users preferences onto the object
     */
    async loadPreferences() {
        const preferences = await this.getPreferences();
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
    async savePreferences(size, type, details) {
        await db.saveDrinkPreferences(this.userId, size, type, details);

        // Refresh object preferences
        await this.loadPreferences();
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
        if (this.hasPreferencesSet()) {
            return `Size: ${this.size}\nType: ${this.type}\nDetails: ${this.details}`;
        }

        return "No preferences saved."
    }
}

module.exports = CoffeePreference;