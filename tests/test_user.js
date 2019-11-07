// Import the dependencies for testing
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const sinon = require('sinon');


const app = require('..');
const slack = require('../slack');
const User = require('../models/User');

chai.use(chaiAsPromised);
chai.should();

// Stub out slack
const realUserName = 'Bobby';
fakeGetUserName = sinon.fake.resolves(realUserName);
sinon.replace(slack, 'getUserName', fakeGetUserName);

describe('User', () => {
  describe('Gets username', () => {
    // Test to get all students record
    it('should get the name of the user from slack', (done) => {
      const userId = '123ABC';
      const user = new User(userId);

      user.id.should.equal(userId, 'should set the id internally');

      const preCallCount = fakeGetUserName.callCount;
      const userNameResult = user.getUserName();
      const postCallCount = fakeGetUserName.callCount;

      chai.assert((postCallCount - preCallCount == 1), 'should call slack once');

      chai.assert.include(slack.getUserName.getCall(preCallCount).args[1], userId, 'should pass the userId to slack');

      chai.assert.becomes(userNameResult, realUserName, 'the getUserName promise resolves to the expected username');

      done();
    });
  });
});
