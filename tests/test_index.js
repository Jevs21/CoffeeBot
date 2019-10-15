// Import the dependencies for testing
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('..');
// Configure chai
chai.use(chaiHttp);
chai.should();
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
                    done();
                });
        });
    });
});