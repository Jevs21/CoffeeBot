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
    `);
}
