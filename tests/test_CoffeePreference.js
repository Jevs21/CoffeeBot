// Import the dependencies for testing
const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');

const app = require('..');
const db = require('../db');

// Configure chai
chai.use(chaiHttp);
chai.should();

// Use a test database for testing
db.connect('testdatabase.db')

const sandbox = sinon.createSandbox()

describe("CoffeePreference", () => {
    describe("POST /coffee/preference/save", () => {
        beforeEach(function () {
            // Spy on our slack interactions
            sandbox.spy(db, 'run');

            // reset the database on each run
            return db.clear();
        });

        afterEach(function () {
            sandbox.restore()
        });

        // Test to get all students record
        it("should tell the user it saved the coffee preference", (done) => {
            chai.request(app)
                .post('/coffee/preference/save')
                .send({
                    user_id: 1,
                    text: 'small tea with milk'
                })
                .end((err, res) => {
                    // there should be no errors
                    chai.expect(err).to.be.null;
                    // there should be a 200 status code
                    res.status.should.equal(200);

                    // Should tell the user that the preference was saved
                    chai.assert.include(res.text, 'Saved preference:')
                    chai.assert.include(res.text, 'Size: small')
                    chai.assert.include(res.text, 'Type: tea')
                    chai.assert.include(res.text, 'Details: with milk')

                    done();
                });
        });

        it("should save the preference in the database", (done) => {
            chai.request(app)
                .post('/coffee/preference/save')
                .send({
                    user_id: 1,
                    text: 'small tea with milk'
                })
                .end((err, res) => {
                    // there should be no errors
                    chai.expect(err).to.be.null;
                    // there should be a 200 status code
                    res.status.should.equal(200);

                    // A query was run to save the drink preference in the database
                    chai.assert(db.run.calledWith(sandbox.match('INSERT INTO drink_preference')),
                        "should run an insert command on the drink preference table");

                    done();
                });
        });
    });
});
