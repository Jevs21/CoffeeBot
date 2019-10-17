// Import the dependencies for testing
const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');

const app = require('..');
const slack = require('../slack');

// Configure chai
chai.use(chaiHttp);
chai.should();

// Spy on our slack interactions
sinon.spy(slack);

describe("App", () => {
    describe("POST /", () => {
        // Test to get all students record
        it("should get a hello message", (done) => {
            chai.request(app)
                .post('/')
                .end((err, res) => {
                    // there should be no errors
                    chai.expect(err).to.be.null;
                    // there should be a 200 status code
                    res.status.should.equal(200);
                    // Should have sent slack a request to post a message
                    chai.assert(slack.postMessage.calledOnce)
                    // The message says "Hi!"
                    chai.assert.include(slack.postMessage.getCall(0).args[0].form.text, "Hi!");
                    done();
                });
        });
    });
});