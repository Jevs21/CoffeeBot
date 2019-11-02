// Import the dependencies for testing
const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');

const app = require('..');
const db = require('../db');
const slack = require('../slack');

// Configure chai
chai.use(chaiHttp);
chai.should();

// Spy on our slack and db interactions
sinon.spy(slack);
sinon.spy(db);

// Use a test database for testing
db.connect('testdatabase.db')

describe("CoffeeOrder", () => {
    beforeEach(function () {
        // reset the database on each run
        return db.clear();
    });

    describe("POST /coffee/order/create", () => {
        it("should tell the user it created a new coffee order", (done) => {
            chai.request(app)
                .post('/coffee/order/create')
                .send({
                    user_id: 1
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
                    user_id: 1
                })
                .end((err, res) => {
                    // There should be no errors
                    chai.expect(err).to.be.null;

                    // There should be a 200 status code
                    res.status.should.equal(200);
                    
                    // A query should run to save the new coffee order in the database
                    chai.assert(db.run.calledWith(sinon.match('INSERT INTO `order`')),
                        "should run an insert command on the order table");

                    done();
                });
        });
    });
});