// Import the dependencies for testing
const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');

const app = require('..');
const db = require('../db');
const slack = require('../slack');
const CoffeeOrder = require('../models/CoffeeOrder');

// Configure chai
chai.use(chaiHttp);
chai.should();

// Use a test database for testing
db.connect('testdatabase.db')

const sandbox = sinon.createSandbox()

describe("CoffeeOrder", () => {
    beforeEach(function () {
        sandbox.spy(slack, 'postMessage')
        sandbox.spy(db, 'run')
        // reset the database on each run
        return db.clear();
    });

    afterEach(function () {
        sandbox.restore()
    });

    describe("POST /coffee/order/create", () => {
        it("should tell the user it created a new coffee order", (done) => {
            chai.request(app)
                .post('/coffee/order/create')
                .send({
                    user_id: 1,
                    user_name: "FakeTester"
                })
                .end((err, res) => {
                    // There should be no errors
                    chai.expect(err).to.be.null;

                    // There should be a 200 status code
                    res.status.should.equal(200);

                    // Should have sent slack a request to post a message
                    chai.assert(slack.postMessage.calledOnce);

                    // Slack message should ask who wants coffee
                    chai.assert.include(slack.postMessage.getCall(0).args[0].form.text, "Who wants coffee?");

                    done();
                });
        });

        it("should save the new coffee order in the database", (done) => {
            chai.request(app)
                .post('/coffee/order/create')
                .send({
                    user_id: 1,
                    user_name: 'FakeTester'
                })
                .end((err, res) => {
                    // There should be no errors
                    chai.expect(err).to.be.null;

                    // There should be a 200 status code
                    res.status.should.equal(200);
                    
                    // A query should run to save the new coffee order in the database
                    chai.assert(db.run.calledWith(sandbox.match('INSERT INTO `order`')),
                        "should run an insert command on the order table");

                    done();
                });
        });
    });

    describe("getOrder", () => {
        it("should get the most recent order, when no argument is provided", (done) => {
            // Stub for db
            const getMostRecentOrderRes = {
                id: 123,
                date: '2020-01-10 16:20:00',
                thread_id: 'TID123',
                channel_id: 'CID123',
                coffee_getter: 3
            }
            fakeGetRecentOrder = sinon.fake.resolves(getMostRecentOrderRes);
            sinon.replace(db, 'getMostRecentOrder', fakeGetRecentOrder);

            const userId = "123ABC";
            const order  = new CoffeeOrder(userId);

            order.userId.should.equal(userId, "should set the id internally");

            const orderResult = order.getOrder();
            chai.assert(fakeGetRecentOrder.calledOnce, "should call database once");

            chai.assert.becomes(orderResult, getMostRecentOrderRes, "the getRecentOrder promise resolves to the expected order");

            done();
        });

        it ("should get the most recent order, when an argument is provided", (done) => {
            const anyDate = '2020-01-10 16:20:00'

            // Stub for db
            const getOrderByDateRes = {
                id: 123,
                date: anyDate,
                thread_id: 'TID123',
                channel_id: 'CID123',
                coffee_getter: 3
            }
            fakeGetOrderByDate = sinon.fake.resolves(getOrderByDateRes);
            sinon.replace(db, 'getOrderByDate', fakeGetOrderByDate);

            const userId = "123ABC";
            const order  = new CoffeeOrder(userId);

            order.userId.should.equal(userId, "should set the id internally");

            const orderResult = order.getOrder(anyDate);
            chai.assert(fakeGetOrderByDate.calledOnce, "should call database once");

            chai.assert.becomes(orderResult, getOrderByDateRes, "the getOrderByDate promise resolves to the expected order");
            done()
        });
    });
});