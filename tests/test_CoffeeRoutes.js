// Import the dependencies for testing
const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');

const app = require('..');
const db = require('../db');
const slack = require('../slack');
const User = require('../models/User');
const CoffeePreference = require('../models/CoffeePreference');

// Configure chai
chai.use(chaiHttp);
chai.should();

// Use a test database for testing
db.connect('testdatabase.db');

const sandbox = sinon.createSandbox();

describe('CoffeeBot Routes', () => {
  beforeEach(() => {
    sandbox.spy(slack, 'postMessage');
    sandbox.spy(db, 'run');
    // reset the database on each run
    return db.clear();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('Placeholder Routes', () => {
    describe('GET /coffee/', () => {
        it('should send back the name of the route', (done) => {
            chai.request(app)
            .get('/coffee/')
            .end((err, res) => {
                // Should be no errors
                chai.expect(err).to.be.null;

                // Status code should be 200
                res.status.should.equal(200);

                // Should send a string describing the endpoint
                res.text.should.equal('INDEX OF COFFEE API');

                done();
            });
        });
    });

    describe('GET /coffee/order-:order_id', () => {
        it('should send back the name of the route', (done) => {
            chai.request(app)
            .get('/coffee/order-1')
            .end((err, res) => {
                // Should be no errors
                chai.expect(err).to.be.null;

                // Status code should be 200
                res.status.should.equal(200);

                // Should send a string describing the endpoint
                res.text.should.equal('COFFEE ORDER BY ID - SEND TO USER');

                done();
            });
        });
    });

    describe('POST /coffee/order-:order_id/respond', () => {
        it('should send back the name of the route', (done) => {
            chai.request(app)
            .post('/coffee/order-1/respond')
            .end((err, res) => {
                // Should be no errors
                chai.expect(err).to.be.null;

                // Status code should be 200
                res.status.should.equal(200);

                // Should send a string describing the endpoint
                res.text.should.equal('RESPOND AS A USER TO COFFEE ORDER');

                done();
            });
        });
    });

    describe('GET /coffee/order/history', () => {
        it('should send back the name of the route', (done) => {
            chai.request(app)
            .get('/coffee/order/history')
            .end((err, res) => {
                // Should be no errors
                chai.expect(err).to.be.null;

                // Status code should be 200
                res.status.should.equal(200);

                // Should send a string describing the endpoint
                res.text.should.equal('DISPLAY ORDER HISTORY');

                done();
            });
        });
    });

    describe('GET /coffee/order/history/:user_id', () => {
        it('should send back the name of the route', (done) => {
            chai.request(app)
            .get('/coffee/order/history/1')
            .end((err, res) => {
                // Should be no errors
                chai.expect(err).to.be.null;

                // Status code should be 200
                res.status.should.equal(200);

                // Should send a string describing the endpoint
                res.text.should.equal('DISPLAY ORDER HISTORY OF A SPECIFIC COFFEE GETTER');

                done();
            });
        });
    });
  });

  describe('Working Routes', () => {
    describe('POST /coffee/order/create', () => {
        it('should tell the user it created a new coffee order', (done) => {
          chai.request(app)
            .post('/coffee/order/create')
            .send({
              user_id: 1,
              user_name: 'FakeTester',
            })
            .end((err, res) => {
              // There should be no errors
              chai.expect(err).to.be.null;
    
              // There should be a 200 status code
              res.status.should.equal(200);
    
              // Should have sent slack a request to post a message
              chai.assert(slack.postMessage.calledOnce);
    
              // Slack message should ask who wants coffee
              chai.assert.include(slack.postMessage.getCall(0).args[0].form.text, 'Who wants coffee?');
    
              done();
            });
        });
    
        it('should save the new coffee order in the database', (done) => {
          chai.request(app)
            .post('/coffee/order/create')
            .send({
              user_id: 1,
              user_name: 'FakeTester',
            })
            .end((err, res) => {
              // There should be no errors
              chai.expect(err).to.be.null;
    
              // There should be a 200 status code
              res.status.should.equal(200);
    
              // A query should run to save the new coffee order in the database
              chai.assert(
                db.run.calledWith(sandbox.match('INSERT INTO `order`')),
                'should run an insert command on the order table',
              );
    
              done();
            });
        });
    });

    describe('POST /coffee/orders/display', () => {
        // Stub out getConversationReplies
        const getConversationRepliesRes = `{"messages": [{"reply_users": ["123", "456", "789"]}]}`;
        const fakeGetConversationReplies = sinon.fake.resolves(getConversationRepliesRes);
        sinon.replace(slack, 'getConversationReplies', fakeGetConversationReplies);

        it('should display the most recent order', (done) => {
            // Insert preferences
            db.run(`INSERT INTO drink_preference (user_id, size, type, details) VALUES ('123', 'large', 'mocha', 'testing')`);
            db.run(`INSERT INTO drink_preference (user_id, size, type, details) VALUES ('456', 'large', 'mocha', 'testing')`);
            db.run(`INSERT INTO drink_preference (user_id, size, type, details) VALUES ('789', 'large', 'mocha', 'testing')`);

            const preCallCount = fakeGetConversationReplies.callCount;

            chai.request(app)
            .post('/coffee/orders/display')
            .send({
              user_id: 1,
              user_name: 'FakeTester',
            })
            .end((err, res) => {
                // There should be no errors
                chai.expect(err).to.be.null;
        
                // There should be a 200 status code
                res.status.should.equal(200);

                const postCallCount = fakeGetConversationReplies.callCount;

                chai.assert((postCallCount - preCallCount == 1), 'should call getConversationReplies once');
        
                chai.assert(slack.getConversationReplies.calledOnce, 'should call getConversationReplies once');

                // Slack message should display preferences of the order
                res.text.should.equal(`Coffee Order for 2020-01-10 16:20:00\n\n<@Bobby>: large mocha testing\n<@Bobby>: large mocha testing\n<@Bobby>: large mocha testing\n`);
        
                done();
            });
        });

        it('should display order with date = 2019-01-10', (done) => {
            // Stub out getConversationReplies
            // const getConversationRepliesRes = `{"messages": [{"reply_users": ["123", "456", "789"]}]}`;
            // const fakeGetConversationReplies = sinon.fake.resolves(getConversationRepliesRes);
            // sinon.replace(slack, 'getConversationReplies', fakeGetConversationReplies);

            // Insert preferences
            db.run(`INSERT INTO drink_preference (user_id, size, type, details) VALUES ('123', 'large', 'mocha', 'testing')`);
            db.run(`INSERT INTO drink_preference (user_id, size, type, details) VALUES ('456', 'large', 'mocha', 'testing')`);
            db.run(`INSERT INTO drink_preference (user_id, size, type, details) VALUES ('789', 'large', 'mocha', 'testing')`);

            const preCallCount = fakeGetConversationReplies.callCount;

            chai.request(app)
            .post('/coffee/orders/display')
            .send({
              user_id: 1,
              user_name: 'FakeTester',
              text: '2020-01-10'
            })
            .end((err, res) => {
                // There should be no errors
                chai.expect(err).to.be.null;
        
                // There should be a 200 status code
                res.status.should.equal(200);

                const postCallCount = fakeGetConversationReplies.callCount;

                chai.assert((postCallCount - preCallCount == 1), 'should call getConversationReplies once');

                // Slack message should display preferences of the order
                res.text.should.equal(`Coffee Order for 2020-01-10 16:20:00\n\n<@Bobby>: large mocha testing\n<@Bobby>: large mocha testing\n<@Bobby>: large mocha testing\n`);
        
                done();
            });
        });
    });
  });
});