const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('database.db');
exports.dbName = 'database.db';

/**
 * @param  dbName, Name of the database to connect to
 */
exports.connect = (dbName) => {
  db.close();
  db = new sqlite3.Database(dbName);
  this.dbName = dbName;
};

/**
 * Runs an SQL query on the database, and doesn't return any result from query.
 * @param  sql, SQL for query to execute
 * @return Promise
 *
 */
exports.run = sql => new Promise((resolve, reject) => {
  db.run(sql, (err) => {
    if (err) {
      reject(err);
    }
    resolve();
  });
});

/**
 * Runs an SQL query on the database, and returns the result from the query.
 * @param sql SQL query to execute
 * @return Promise
 */
exports.runQuery = sql => new Promise((resolve, reject) => {
  db.run(sql, function (err) {
    if (err) {
      reject(err);
    } else {
      resolve(this);
    }
  });
});

/**
 * Execute an SQL query on the database, and returns the first row.
 * @param  sql, SQL for query to execute
 * @return Result of query
 *
 */
exports.get = sql => new Promise((resolve, reject) => {
  db.get(sql, (err, row) => {
    if (err) {
      reject(err);
    }
    resolve(row);
  });
});

/**
 * Execute an SQL query on the database, and returns all rows.
 * @param  sql, SQL for query to execute
 * @return Result of query
 *
 */
exports.all = sql => new Promise((resolve, reject) => {
  db.all(sql, (err, rows) => {
    if (err) {
      reject(err);
    }
    resolve(rows);
  });
});


/**
 * Clears all data in the database
 */
exports.clear = () => {
  if (this.dbName === 'database.db') {
    console.warn("I don't think you really want to do that.");
    return;
  }

  return Promise.all([
    this.run('DELETE FROM drink_preference;'),
    this.run('DELETE FROM shop_preference;'),
    this.run('DELETE FROM user_order;'),
    this.run('DELETE FROM \'order\';'),
    this.run('DELETE FROM test_user;'),
  ]);
};

exports.getTestUserId = username => this.get(`
        SELECT user_id
        FROM test_user
        WHERE user_name="${username}"
    `);

/**
 * saves user drink preferences
 * @param userId the unique slack ID associated with the user
 * @param size the size associated with the user's drink preference
 * @param type the type of drink the user wants e.g. coffee, tea
 * @param details anything extra with the drink e.g. 1 milk
 */
exports.saveDrinkPreferences = (userId, size, type, details) => this.run(`
        INSERT INTO drink_preference (user_id, size, type, details)
        VALUES ("${userId}", "${size}", "${type}", "${details}")
    `);


/**
 * retrieves user drink preferences
 * @param userId the unique slack ID associated with the user
 */
exports.getDrinkPreferences = userId => this.get(`
        SELECT *
        FROM drink_preference
        WHERE user_id="${userId}"
        ORDER BY created_at DESC
    `);


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
};

/**
 * Delete coffee shop preference
 * @param  userId   [Slack user id]
 * @param  {string} name     [name of shop]
 * @param  {string} location [location of shop]
 * @return {Promise}          [db Promise result]
 */
exports.deleteCoffeeShopPreference = (userId, name, location) => {
  let shopLocation = location ? `="${location}"` : null;
  // if the user only wants to match on null
  if (location == 'null') shopLocation = 'IS NULL';

  return this.runQuery(`DELETE FROM shop_preference WHERE user_id="${userId}" 
        AND name="${name}"
        ${(shopLocation ? `AND location ${shopLocation}` : '')}`);
};

/**
 * retrieves user coffee shop preference
 * @param userId the unique slack ID associated with the user
 */
exports.getCoffeeShopPreference = userId => this.get(`
        SELECT *
        FROM shop_preference
        WHERE user_id="${userId}"
    `);


/**
 * Get coffee shop preference by id
 * @param id
 */
exports.getCoffeeShopPreferenceById = id => this.get(`
        SELECT *
        FROM shop_preference
        WHERE id="${id}"
    `);


/**
 * SQL Query to get all responses to a specific order id
 */
exports.getUserResponsesToOrder = orderId => this.all(`
        SELECT *
        FROM user_order
        WHERE order_id="${orderId}"
    `);


/**
 * SQL Query to get the most recent order from the order table
 */
exports.getMostRecentOrder = () => this.get(`
        SELECT *
        FROM 'order'
        ORDER BY id DESC
        LIMIT 1
    `);


/**
 * Get coffee shop preference by id
 * @param id
 */
exports.getCoffeeShopPreferenceById = id => this.get(`
        SELECT *
        FROM shop_preference
        WHERE id="${id}"
    `);


/**
 * Create new order
 * @param userId Coffee getter
 * @param date
 * @param threadID Slack thread ID
 * @param channelID Slack channel ID
 */
exports.createNewOrder = (userId, date, threadID, channelID) => this.run(`
        INSERT INTO \`order\` (date, coffee_getter, thread_id, channel_id)
        VALUES ("${date}", "${userId}", "${threadID}", "${channelID}")
    `);


/**
 * Get user order
 * @param userId user ID
 * @param orderId order ID
 */
exports.getUserOrder = (orderId, userId) => this.get(`
        SELECT *
        FROM user_order
        WHERE order_id="${orderId}" AND user_id="${userId}"
    `);


/**
 * Create new user order
 * @param userId Coffee getter
 * @param orderId order ID
 */
exports.createUserOrderResponse = (userId, orderId) => this.run(`
        INSERT INTO user_order (user_id, order_id, response)
        VALUES ("${userId}", "${orderId}", 1)
    `);


/**
 * Get order by thread id
 * @param threadId
 */
exports.getOrderByThreadId = threadId => this.get(`
        SELECT *
        FROM 'order'
        WHERE thread_id='${threadId}'
    `);

/**
 * Get order by date
 * @param date
 */
exports.getOrderByDate = date => this.get(`
        SELECT *
        FROM 'order'
        WHERE date > '${date} 00:00:01'
        AND date < '${date} 23:59:59'
    `);

/**
 * Get all shop preferences ordered by user id
 */
exports.getAllShopPreferences = () => this.all(`
        SELECT *
        FROM shop_preference
        ORDER BY user_id
    `);
