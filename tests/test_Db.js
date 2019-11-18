// Import the dependencies for testing
const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');

const app = require('..');
const db = require('../db');

// Configure chai
chai.use(chaiHttp);
chai.should();

const sandbox = sinon.createSandbox();

describe('Database', () => {
  // Reset the database on each run
  beforeEach(() => {
    db.connect('testdatabase.db');
    sandbox.spy(db, 'run');
    sandbox.spy(db, 'runQuery');
    sandbox.spy(db, 'get');
    sandbox.spy(db, 'all');
    return db.clear();
  });

  afterEach(() => {
    sandbox.restore()
  });

  // Test core db functions
  describe("Core database functions", () => {
    // Test db connection funciton
    describe("db.connect()", () => {
        it("should connect to a test database", (done) => {
            const dbName = 'testdatabase.db';
            db.connect(dbName);

            db.dbName.should.equal(dbName, "should set the db name internally");

            done();
        });
    });

    // Test db run funciton
    describe("db.run()", () => {
        it("should run a query and return no result", async () => {
            const query = `INSERT INTO user_order (user_id, order_id, response) VALUES ('UID123', 'OID123', 1)`;
            
            let insertRes = await db.run(query);
            let getRes = await db.all(`SELECT * FROM user_order`);

            chai.assert(!insertRes, 'run should not return anything');

            chai.assert(
                db.run.calledWith(sandbox.match(query)),
                'should run an insert command on the user_order table'
            );

            chai.assert(
                getRes.length.should.equal(1),
                'should have inserted one line to the database'
            );
        });

        it("should resolve an error for an incorrect query", async () => {
            // Typo in query below
            const query = `INSET INTO user_order (user_id, order_id, response) VALUES ('UID123', 'OID123', 1)`;
            
            try {
                await db.run(query);
            } catch(err) {
                chai.assert(
                    err.errno.should.equal(1), 
                    'run should resolve an sqlite syntax error 1'
                );
                chai.assert(
                    err.code.should.equal('SQLITE_ERROR'), 
                    'run should resolve an sqlite syntax error code \'SQLITE_ERROR\''
                );
            }

            let getRes = await db.all(`SELECT * FROM user_order`);

            chai.assert(
                db.run.calledWith(sandbox.match(query)),
                'should run an insert command on the user_order table'
            );

            chai.assert(
                getRes.length.should.equal(0),
                'should have inserted one line to the database'
            );
        });
    });

    // Test db runQuery funciton
    describe("db.runQuery()", () => {
        it("should run a query and return the result", async () => {
            const query = `INSERT INTO user_order (user_id, order_id, response) VALUES ('UID123', 'OID123', 1)`;
            
            let insertRes = await db.runQuery(query);
            let getRes = await db.all(`SELECT * FROM user_order`);

            chai.assert(
                insertRes.sql.should.equal(query), 
                'should return the statement used'
            );
            chai.assert(
                insertRes.changes.should.equal(1), 
                'should only make changes to 1 line'
            );

            chai.assert(
                db.runQuery.calledWith(sandbox.match(query)),
                'should run an insert command on the user_order table'
            );

            chai.assert(
                getRes.length.should.equal(1),
                'should have inserted one line to the database'
            );
        });

        it("should resolve an error for an incorrect query", async () => {
            // Typo in query below
            const query = `INSET INTO user_order (user_id, order_id, response) VALUES ('UID123', 'OID123', 1)`;
            
            try {
                await db.runQuery(query);
            } catch(err) {
                chai.assert(
                    err.errno.should.equal(1), 
                    'run should resolve an sqlite syntax error 1'
                );
                chai.assert(
                    err.code.should.equal('SQLITE_ERROR'), 
                    'run should resolve an sqlite syntax error code \'SQLITE_ERROR\''
                );
            }

            let getRes = await db.all(`SELECT * FROM user_order`);

            chai.assert(
                db.runQuery.calledWith(sandbox.match(query)),
                'should run an insert command on the user_order table'
            );

            chai.assert(
                getRes.length.should.equal(0),
                'should have inserted one line to the database'
            );
        });
    });

    // Test db get funciton
    describe("db.get()", () => {
        it("should run a query and return one result", async () => {
            await db.run(`INSERT INTO user_order (user_id, order_id, response) VALUES ('UID123', 'OID123', 1)`);
            await db.run(`INSERT INTO user_order (user_id, order_id, response) VALUES ('UID456', 'OID456', 0)`);
            await db.run(`INSERT INTO user_order (user_id, order_id, response) VALUES ('UID789', 'OID789', 1)`);
            
            const query = `SELECT * FROM user_order`;

            let getRes = await db.get(query);
            
            chai.assert(
                getRes.user_id.should.equal('UID123'), 
                'should return the first result in the database'
            );
            chai.assert(
                getRes.order_id.should.equal('OID123'), 
                'should return the first result in the database'
            );
            chai.assert(
                getRes.response.should.equal(1), 
                'should return the first result in the database'
            );

            chai.assert(
                db.get.calledWith(sandbox.match(query)),
                'should run a SELECT command on the user_order table'
            );

        });

        it("should resolve an error for an incorrect query", async () => {
            // Typo in query below
            const query = `SEECT * FROM user_order`;
            
            try {
                await db.get(query);
            } catch(err) {
                chai.assert(
                    err.errno.should.equal(1), 
                    'run should resolve an sqlite syntax error 1'
                );
                chai.assert(
                    err.code.should.equal('SQLITE_ERROR'), 
                    'run should resolve an sqlite syntax error code \'SQLITE_ERROR\''
                );
            }

            let getRes = await db.all(`SELECT * FROM user_order`);

            chai.assert(
                db.get.calledWith(sandbox.match(query)),
                'should run an insert command on the user_order table'
            );

            chai.assert(
                getRes.length.should.equal(0),
                'should have inserted one line to the database'
            );
        });
    });

    // Test db all funciton
    describe("db.all()", () => {
        it("should run a query and return all results", async () => {
            await db.run(`INSERT INTO user_order (user_id, order_id, response) VALUES ('UID123', 'OID123', 1)`);
            await db.run(`INSERT INTO user_order (user_id, order_id, response) VALUES ('UID456', 'OID456', 0)`);
            await db.run(`INSERT INTO user_order (user_id, order_id, response) VALUES ('UID789', 'OID789', 1)`);
            
            const query = `SELECT * FROM user_order`;

            let allRes = await db.all(query);
            
            chai.assert(
                allRes.length.should.equal(3), 
                'should return all 3 results'
            );

            allRes[0].user_id.should.equal('UID123', 'should return results in correct order');
            allRes[0].order_id.should.equal('OID123', 'should return results in correct order');
            allRes[0].response.should.equal(1, 'should return results in correct order');

            allRes[1].user_id.should.equal('UID456', 'should return results in correct order');
            allRes[1].order_id.should.equal('OID456', 'should return results in correct order');
            allRes[1].response.should.equal(0, 'should return results in correct order');

            allRes[2].user_id.should.equal('UID789', 'should return results in correct order');
            allRes[2].order_id.should.equal('OID789', 'should return results in correct order');
            allRes[2].response.should.equal(1, 'should return results in correct order');

            chai.assert(
                db.all.calledWith(sandbox.match(query)),
                'should run a SELECT command on the user_order table'
            );

        });

        it("should resolve an error for an incorrect query", async () => {
            // Typo in query below
            const query = `SEECT * FROM user_order`;
            
            try {
                await db.all(query);
            } catch(err) {
                chai.assert(
                    err.errno.should.equal(1), 
                    'run should resolve an sqlite syntax error 1'
                );
                chai.assert(
                    err.code.should.equal('SQLITE_ERROR'), 
                    'run should resolve an sqlite syntax error code \'SQLITE_ERROR\''
                );
            }

            let getRes = await db.all(`SELECT * FROM user_order`);

            chai.assert(
                db.all.calledWith(sandbox.match(query)),
                'should run an insert command on the user_order table'
            );

            chai.assert(
                getRes.length.should.equal(0),
                'should have inserted one line to the database'
            );
        });
    });

    // Test db clear funciton
    describe("db.clear()", () => {
        it("should clear the databse", async () => {
            await db.run(`INSERT INTO user_order (user_id, order_id, response) VALUES ('UID123', 'OID123', 1)`);
            await db.run(`INSERT INTO user_order (user_id, order_id, response) VALUES ('UID456', 'OID456', 0)`);
            await db.run(`INSERT INTO user_order (user_id, order_id, response) VALUES ('UID789', 'OID789', 1)`);

            await db.clear();

            let allRes = await db.all(`SELECT * FROM user_order`);
            
            chai.assert(
                allRes.length.should.equal(0), 
                'should return 0 results'
            );

            chai.assert(
                db.run.getCall(0).calledWith(sandbox.match('DELETE FROM drink_preference;')),
                'should run a DELETE query on drink_preference'
            );
            chai.assert(
                db.run.getCall(1).calledWith(sandbox.match('DELETE FROM shop_preference;')),
                'should run a DELETE query on shop_preference'
            );
            chai.assert(
                db.run.getCall(2).calledWith(sandbox.match('DELETE FROM user_order;')),
                'should run a DELETE query on user_order'
            );
            chai.assert(
                db.run.getCall(3).calledWith(sandbox.match('DELETE FROM \'order\';')),
                'should run a DELETE query on order'
            );
            chai.assert(
                db.run.getCall(4).calledWith(sandbox.match('DELETE FROM test_user;')),
                'should run a DELETE query on test_user'
            );
        });
        // Attemt to clear prod db
        it("should not allow you to delete production databse", async () => {
            // Stub out console.warn
            const fakeConsoleWarn = sinon.fake.resolves(true);
            sinon.replace(console, 'warn', fakeConsoleWarn);

            db.connect('database.db');

            db.clear();

            chai.assert(
                console.warn.calledWith(sandbox.match("I don't think you really want to do that.")),
                'should give you a warning message'
            );
        });
    });
  });
    

  // Test specific db funcitons
  describe("Specific database functions", () => {
    describe("Getters", () => {
        // Test getTestUserId
        describe("db.getTestUserId()", () => {
            it("should get a test user's id by username", async () => {
                const uID = 'UID123';
                const uName = 'Johnny';

                await db.run(`INSERT INTO test_user (user_name, user_id) VALUES ('${uName}', '${uID}')`);
                
                let userId = await db.getTestUserId(uName);

                chai.assert(
                    userId.user_id.should.equal(uID),
                    'should return the correct user id'
                );
            });
        });

        // Test getDrinkPreference
        describe("db.getDrinkPreference()", () => {
            it("should get a user's drink preference by id", async () => {
                const uID = 'UID123';
                const size = 'small';
                const type = 'coffee';
                const details = 'black';

                await db.run(`INSERT INTO drink_preference (user_id, size, type, details) VALUES ('${uID}', '${size}', '${type}', '${details}')`);
                
                let drinkPref = await db.getDrinkPreferences(uID);

                drinkPref.user_id.should.equal(uID);
                drinkPref.size.should.equal(size);
                drinkPref.type.should.equal(type);
                drinkPref.details.should.equal(details);
            });
        });

        // Test getCoffeeShopPreference
        describe("db.getCoffeeShopPreference()", () => {
            it("should get a user's coffee shop preference by user_id", async () => {
                const uID = 'UID123';
                const name = 'Starbucks';
                const location = 'Library';

                await db.run(`INSERT INTO shop_preference (user_id, name, location) VALUES ('${uID}', '${name}', '${location}')`);

                let shopPref = await db.getCoffeeShopPreference(uID);

                shopPref.user_id.should.equal(uID);
                shopPref.name.should.equal(name);
                shopPref.location.should.equal(location);
            });
        });

        // Test getCoffeeShopPreferenceById
        describe("db.getCoffeeShopPreferenceById()", () => {
            it("should get a user's coffee shop preference by database id", async () => {
                const uID = 'UID123';
                const name = 'Starbucks';
                const location = 'Library';

                await db.run(`INSERT INTO shop_preference (user_id, name, location) VALUES ('nope', 'nope', 'nope')`);
                await db.run(`INSERT INTO shop_preference (user_id, name, location) VALUES ('${uID}', '${name}', '${location}')`);
                await db.run(`INSERT INTO shop_preference (user_id, name, location) VALUES ('nope', 'nope', 'nope')`);

                let shopPref = await db.getCoffeeShopPreferenceById(2);

                shopPref.user_id.should.equal(uID);
                shopPref.name.should.equal(name);
                shopPref.location.should.equal(location);
            });
        });

        // Test getUserResponsesToOrder
        describe("db.getUserResponsesToOrder()", () => {
            it("should get a user responses to a specific order", async () => {
                const uID = 'UID123';
                const oID = 'OID123';
                const resp = 1;

                await db.run(`INSERT INTO user_order (user_id, order_id, response) VALUES ('${uID}', 'OID000', ${resp})`);
                await db.run(`INSERT INTO user_order (user_id, order_id, response) VALUES ('${uID}', 'OID000', ${resp})`);
                await db.run(`INSERT INTO user_order (user_id, order_id, response) VALUES ('${uID}', 'OID000', ${resp})`);
                await db.run(`INSERT INTO user_order (user_id, order_id, response) VALUES ('${uID}', '${oID}', ${resp})`);
                await db.run(`INSERT INTO user_order (user_id, order_id, response) VALUES ('${uID}', '${oID}', 0)`);
                await db.run(`INSERT INTO user_order (user_id, order_id, response) VALUES ('${uID}', '${oID}', ${resp})`);
                await db.run(`INSERT INTO user_order (user_id, order_id, response) VALUES ('${uID}', 'OID111', ${resp})`);
                await db.run(`INSERT INTO user_order (user_id, order_id, response) VALUES ('${uID}', 'OID111', ${resp})`);
                await db.run(`INSERT INTO user_order (user_id, order_id, response) VALUES ('${uID}', 'OID111', ${resp})`);

                let orderResp = await db.getUserResponsesToOrder(oID);

                chai.assert(
                    orderResp.length.should.equal(3),
                    'should return the 3 correct results'
                );

                orderResp[0].user_id.should.equal(uID);
                orderResp[0].order_id.should.equal(oID);
                orderResp[0].response.should.equal(resp);

                orderResp[1].user_id.should.equal(uID);
                orderResp[1].order_id.should.equal(oID);
                orderResp[1].response.should.equal(0);

                orderResp[2].user_id.should.equal(uID);
                orderResp[2].order_id.should.equal(oID);
                orderResp[2].response.should.equal(resp);
            });
        });
        
        // Test getUserOrderResponse
        describe("db.getUserOrder()", () => {
            it("should get a single user's response to a specific order", async () => {
                const uID = 'UID123';
                const oID = 'OID123';
                const resp = 1;

                await db.run(`INSERT INTO user_order (user_id, order_id, response) VALUES ('UID111', 'OID000', ${resp})`);
                await db.run(`INSERT INTO user_order (user_id, order_id, response) VALUES ('${uID}', 'OID000', 0)`);
                await db.run(`INSERT INTO user_order (user_id, order_id, response) VALUES ('${uID}', '${oID}', ${resp})`);
                await db.run(`INSERT INTO user_order (user_id, order_id, response) VALUES ('UID000', '${oID}', ${resp})`);
                await db.run(`INSERT INTO user_order (user_id, order_id, response) VALUES ('${uID}', 'OID444', 0)`);
                
                let orderResp = await db.getUserOrder(oID, uID);

                orderResp.user_id.should.equal(uID);
                orderResp.order_id.should.equal(oID);
                orderResp.response.should.equal(resp);

            });
        });

        // Test getOrderByThreadId
        describe("db.getOrderByThreadId()", () => {
            it("should get a single order by thread id", async () => {
                const tID = 'TID456';
                const cID = 'CID456';
                const cGetter = 'UID456';

                await db.run(`INSERT INTO 'order' (thread_id, channel_id, coffee_getter) VALUES ('TID123', 'CID123', 'UID123')`);
                await db.run(`INSERT INTO 'order' (thread_id, channel_id, coffee_getter) VALUES ('${tID}', '${cID}', '${cGetter}')`);
                await db.run(`INSERT INTO 'order' (thread_id, channel_id, coffee_getter) VALUES ('TID789', 'CID789', 'UID789')`);
                
                let orderResp = await db.getOrderByThreadId(tID);

                orderResp.thread_id.should.equal(tID);
                orderResp.channel_id.should.equal(cID);
                orderResp.coffee_getter.should.equal(cGetter);
            });
        });

        // Test getOrderByDate
        describe("db.getOrderByDate()", () => {
            it("should get a single order by date", async () => {
                const tID = 'TID456';
                const cID = 'CID456';
                const cGetter = 'UID456';
                const date = '2018-11-16 18:07:29'

                await db.run(`INSERT INTO 'order' (thread_id, channel_id, coffee_getter) VALUES ('TID123', 'CID123', 'UID123')`);
                await db.run(`INSERT INTO 'order' (thread_id, channel_id, coffee_getter, date) VALUES ('${tID}', '${cID}', '${cGetter}', '${date}')`);
                await db.run(`INSERT INTO 'order' (thread_id, channel_id, coffee_getter) VALUES ('TID789', 'CID789', 'UID789')`);
                
                let orderResp = await db.getOrderByDate('2018-11-16');

                orderResp.thread_id.should.equal(tID);
                orderResp.channel_id.should.equal(cID);
                orderResp.coffee_getter.should.equal(cGetter);
                orderResp.date.should.equal(date);
            });
        });

        // Test getAllShopPreferences
        describe("db.getAllShopPreferences()", () => {
            it("should get all coffee shop preferences sorted by user_id", async () => {
                const uID = 'UID123';
                const name = 'Starbucks';
                const location = 'Library';

                await db.run(`INSERT INTO shop_preference (user_id, name, location) VALUES ('UID123', 'Starbucks', 'Library')`);
                await db.run(`INSERT INTO shop_preference (user_id, name, location) VALUES ('UID789', 'Starbucks', 'Library')`);
                await db.run(`INSERT INTO shop_preference (user_id, name, location) VALUES ('UID456', 'Starbucks', 'Library')`);

                let shopPref = await db.getAllShopPreferences();

                chai.assert(
                    shopPref.length.should.equal(3),
                    'should return all 3 results'
                );

                shopPref[0].user_id.should.equal('UID123');
                shopPref[1].user_id.should.equal('UID456');
                shopPref[2].user_id.should.equal('UID789');
            });
        });
    });
    
    describe("Setters", () => {
        // Test saveDrinkPreferences
        describe("db.saveDrinkPreferences()", () => {
            it("should save a user's drink preferences", async () => {
                const uID = 'UID123';
                const size = 'small';
                const type = 'coffee';
                const details = 'black';

                await db.saveDrinkPreferences(uID, size, type, details);

                let getPref = await db.get(`SELECT * FROM drink_preference WHERE user_id='${uID}'`);

                getPref.user_id.should.equal(uID);
                getPref.size.should.equal(size);
                getPref.type.should.equal(type);
                getPref.details.should.equal(details);

                const expectedQuery = `("${uID}", "${size}", "${type}", "${details}")`;
                
                // Call 6 because of the 5 delete statements called by clear()
                chai.assert(
                    db.run.getCall(5).args[0].should.include(expectedQuery),
                    'should run an insert command on the drink_preference table'
                );
            });
        });

        // Test saveCoffeeShopPreference
        describe("db.saveCoffeeShopPreference()", () => {
            it("should save a user's coffee shop preference", async () => {
                const uID = 'UID123';
                const name = 'Starbucks';
                const location = 'Library';

                await db.saveCoffeeShopPreference(uID, name, location);

                let getPref = await db.get(`SELECT * FROM shop_preference WHERE user_id='${uID}'`);

                getPref.user_id.should.equal(uID);
                getPref.name.should.equal(name);
                getPref.location.should.equal(location);

                const expectedQuery = `("${uID}", "${name}", "${location}")`;
                
                chai.assert(
                    db.runQuery.getCall(0).args[0].should.include(expectedQuery),
                    'should run an insert command on the shop_preference table'
                );
            });
            it("should save a user's coffee shop preference with no location", async () => {
                const uID = 'UID123';
                const name = 'Starbucks';

                await db.saveCoffeeShopPreference(uID, name);

                let getPref = await db.get(`SELECT * FROM shop_preference WHERE user_id='${uID}'`);

                getPref.user_id.should.equal(uID);
                getPref.name.should.equal(name);
                chai.assert(!getPref.location, 'should set location as null');

                const expectedQuery = `("${uID}", "${name}", null)`;
                
                chai.assert(
                    db.runQuery.getCall(0).args[0].should.include(expectedQuery),
                    'should run an insert command on the shop_preference table'
                );
            });
        });

        // Test deleteCoffeeShopPreference
        describe("db.deleteCoffeeShopPreference()", () => {
            it("should delete a user's coffee shop preference", async () => {
                const uID = 'UID123';
                const name = 'Starbucks';
                const location = 'Library';

                await db.runQuery(`INSERT INTO shop_preference (user_id, name, location) VALUES ('${uID}', '${name}', '${location}')`);

                await db.deleteCoffeeShopPreference(uID, name, location);

                let getPref = await db.all(`SELECT * FROM shop_preference WHERE user_id='${uID}'`);

                chai.assert(
                    getPref.length.should.equal(0),
                    'should be no results in table'
                );

                const expQuery1 = `WHERE user_id="${uID}"`
                const expQuery2 = `AND name="${name}"`
                const expQuery3 = `AND location ="${location}"`;
                
                chai.assert(
                    db.runQuery.getCall(1).args[0].should.include(expQuery1),
                    'should run an delete command on the specified row of shop_preference'
                );
                chai.assert(
                    db.runQuery.getCall(1).args[0].should.include(expQuery2),
                    'should run an delete command on the specified row of shop_preference'
                );
                chai.assert(
                    db.runQuery.getCall(1).args[0].should.include(expQuery3),
                    'should run an delete command on the specified row of shop_preference'
                );
            });

            it("should delete a user's coffee shop preference with a null location", async () => {
                const uID = 'UID123';
                const name = 'Starbucks';

                await db.runQuery(`INSERT INTO shop_preference (user_id, name, location) VALUES ('${uID}', '${name}', null)`);

                await db.deleteCoffeeShopPreference(uID, name);

                let getPref = await db.all(`SELECT * FROM shop_preference WHERE user_id='${uID}'`);

                chai.assert(
                    getPref.length.should.equal(0),
                    'should be no results in table'
                );

                const expQuery1 = `WHERE user_id="${uID}"`
                const expQuery2 = `AND name="${name}"`
                
                chai.assert(
                    db.runQuery.getCall(1).args[0].should.include(expQuery1),
                    'should run an delete command on the specified row of shop_preference'
                );
                chai.assert(
                    db.runQuery.getCall(1).args[0].should.include(expQuery2),
                    'should run an delete command on the specified row of shop_preference'
                );
            });

            it("should delete a user's coffee shop preference 'null' as the location", async () => {
                const uID = 'UID123';
                const name = 'Starbucks';
                const location = 'null';

                await db.runQuery(`INSERT INTO shop_preference (user_id, name, location) VALUES ('${uID}', '${name}', null)`);

                await db.deleteCoffeeShopPreference(uID, name, location);

                let getPref = await db.all(`SELECT * FROM shop_preference WHERE user_id='${uID}'`);

                chai.assert(
                    getPref.length.should.equal(0),
                    'should be no results in table'
                );

                const expQuery1 = `WHERE user_id="${uID}"`;
                const expQuery2 = `AND name="${name}"`;
                const expQuery3 = `AND location IS NULL`;
                
                chai.assert(
                    db.runQuery.getCall(1).args[0].should.include(expQuery1),
                    'should run an delete command on the specified row of shop_preference'
                );
                chai.assert(
                    db.runQuery.getCall(1).args[0].should.include(expQuery2),
                    'should run an delete command on the specified row of shop_preference'
                );
                chai.assert(
                    db.runQuery.getCall(1).args[0].should.include(expQuery3),
                    'should run an delete command on the specified row of shop_preference'
                );
            });
        });

        // Test createNewOrder
        describe("db.createNewOrder()", () => {
            it("should add a new order to the database", async () => {
                const uID = 'UID123';
                const date = '2019-11-16 18:07:29';
                const tID = 'TID123';
                const cID = 'CID123';

                await db.createNewOrder(uID, date, tID, cID);

                let orderRes = await db.all(`SELECT * FROM 'order'`);

                chai.assert(
                    orderRes.length.should.equal(1),
                    'should only be one result'
                );

                chai.assert(
                    orderRes[0].date.should.equal(date),
                    'should have inserted the correct order information'
                );
                chai.assert(
                    orderRes[0].coffee_getter.should.equal(uID),
                    'should have inserted the correct order information'
                );
                chai.assert(
                    orderRes[0].thread_id.should.equal(tID),
                    'should have inserted the correct order information'
                );
                chai.assert(
                    orderRes[0].channel_id.should.equal(cID),
                    'should have inserted the correct order information'
                );
            });
        });

        // Test createUserOrderResponse
        describe("db.createUserOrderResponse()", () => {
            it("should add a new order to the database", async () => {
                const uID = 'UID123';
                const oID = 'OID123';

                await db.createUserOrderResponse(uID, oID);

                let orderRes = await db.all(`SELECT * FROM user_order`);

                chai.assert(
                    orderRes.length.should.equal(1),
                    'should only be one result'
                );

                chai.assert(
                    orderRes[0].user_id.should.equal(uID),
                    'should have inserted the correct order information'
                );
                chai.assert(
                    orderRes[0].order_id.should.equal(oID),
                    'should have inserted the correct order information'
                );
                chai.assert(
                    orderRes[0].response.should.equal(1),
                    'should have inserted the correct order information'
                );
            });
        });

    });
  });
  
});
