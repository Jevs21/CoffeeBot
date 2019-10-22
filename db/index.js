const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('database.db');

/**
 * @param  dbName, Name of the database to connect to
 */
exports.connect = (dbName) => {
    db.close();
    db = new sqlite3.Database(dbName)
}

/**
 * Runs an SQL query on the database, and doesn't return any result from query.
 * @param  sql, SQL for query to execute
 * @return Promise 
 *
 */
exports.run = (sql) => {
    return new Promise((resolve, reject) => {
        db.run(sql, (err) => {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
}

/**
 * Runs an SQL query on the database, and returns the result from the query.
 * @param sql SQL query to execute
 * @return Promise 
 */
exports.runQuery = (sql) => {
    return new Promise((resolve, reject) => {
        db.run(sql, function (err) {
            if (err) {
                reject(err)
            } else {
                resolve(this)
            }
        });
    });
}

/**
 * Execute an SQL query on the database, and returns the first row.
 * @param  sql, SQL for query to execute
 * @return Result of query
 *
 */
exports.get = (sql) => {
    return new Promise((resolve, reject) => {
        db.get(sql, (err, row) => {
            if (err) {
                reject(err);
            }
            resolve(row);
        });
    });
}

/**
 * Execute an SQL query on the database, and returns all rows.
 * @param  sql, SQL for query to execute
 * @return Result of query
 *
 */
exports.all = (sql) => {
    return new Promise ((resolve, reject) => {
        db.all(sql, (err, rows) => {
            if (err) {
                reject(err);
            }
            resolve(rows);
        });
    });
}

/**
 * 
 */
exports.savePreferences = (userId, size, type, details) => {
    return this.run(`
        INSERT INTO drink_preference (user_id, size, type, details)
        VALUES ("${userId}", "${size}", "${type}", "${details}")
    `);
}


/**
 * 
 */
exports.getPreferences = (userId) => {
    return this.get(`
        SELECT *
        FROM drink_preference
        WHERE user_id="${userId}"
        ORDER BY created_at DESC
    `);
}


/**
 * Save coffee shop preference
 * @param userId
 * @param {string} name
 * @param {string} location
 */
exports.saveCoffeeShopPreference = (userId, name, location) => {
    const shopLocation = location ? `"${location}"` : null;

    return this.runQuery(`
        INSERT INTO shop_preference (user_id, name, location)
        VALUES ("${userId}", "${name}", ${shopLocation})
    `);
}


/**
 * SQL Query to get all responses to a specific order id
 */
exports.getUserResponsesToOrder = (orderId) => {
    return this.all(`
        SELECT *
        FROM user_order
        WHERE order_id="${orderId}"
    `);
}


/**
 * SQL Query to get the most recent order from the order table
 */
exports.getMostRecentOrder = () => {
    return this.get(`
        SELECT *
        FROM 'order'
        ORDER BY id DESC
        LIMIT 1
    `);
}


/**
 * Get coffee shop preference by id
 * @param id
 */
exports.getCoffeeShopPreferenceById = (id) => {
    return this.get(`
        SELECT *
        FROM shop_preference
        WHERE id="${id}"
    `);
}


/**
 * Get order by id
 * @param id
 */
exports.getOrderById = (id) => {
    return this.get(`
        SELECT *
        FROM 'order'
        WHERE id=${id}
    `);
}