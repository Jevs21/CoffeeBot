/**
 * CoffeeShopPreference 
 *
 * Responsible for communication with the database regarding coffee shop preference
 */

const db = require('../db');

class CoffeeShopPreference {
    constructor(userId) {
        this.userId = userId;
    }

    /**
     * Gets a user's preferences
     * @param {string} userId
     */
    getPreferences() {
        return db.getCoffeeShopPreference(this.userId);
    }

    /**
     * Loads a users preferences onto the object
     */
    async loadPreferences() {
        const preferences = await this.getPreferences();
        this.name = preferences.name;
        this.location = preferences.location;
    }

    /**
     * Saves a user's coffee shop preference
     * @param {string} name
     * @param {string} location
     */
    async saveCoffeeShopPreference(name, location) {
        this.savedCoffeeShop = await db.saveCoffeeShopPreference(this.userId, name, location);
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

        return "No coffee shop preferences saved."
    }
}

module.exports = CoffeeShopPreference;