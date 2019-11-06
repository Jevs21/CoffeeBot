// Import the dependencies for testing
const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');

const app = require('..');
const db = require('../db');
const CoffeeShopPreference = require('../models/CoffeeShopPreference');

// Configure chai
chai.use(chaiHttp);
chai.should();

// Use a test database for testing
db.connect('testdatabase.db');

const sandbox = sinon.createSandbox();

describe('CoffeeShopPreference', () => {
  // Reset the database on each run
  beforeEach(() => {
    sandbox.spy(db, 'run');
    return db.clear();
  });

  afterEach(() => {
    sandbox.restore()
  });

  // Test CoffeeShopPreference constructor
  describe("new CoffeeShopPreference", () => {
    it("should return a new CoffeeShopPreference object", (done) => {
      const userId = 'User1';
      const coffeeShopPreference = new CoffeeShopPreference(userId);

      coffeeShopPreference.user.id.should.equal(userId, "should set the id internally");

      done();
    });
  });

  // Test CoffeeShopPreference.getAllShopPreferences
  describe('getAllShopPreferences', () => {
    it('should get a list of shop preferences have been saved', (done) => {
      // Stub for db
      const getAllShopPrefsRes = [{
        id: 1,
        user_id: 'User1',
        name: 'Starbucks',
        location: '20 Stone Rd',
        created_at: '2020-01-10 16:20:00'
      }];
      const fakeGetAllShopPreferences = sinon.fake.resolves(getAllShopPrefsRes);
      sinon.replace(db, 'getAllShopPreferences', fakeGetAllShopPreferences);

      const userId = 'User1';
      const coffeeShopPreference = new CoffeeShopPreference(userId);
      coffeeShopPreference.user.id.should.equal(userId, 'should set the id internally');

      const allShopPrefsResult = coffeeShopPreference.getAllShopPreferences();
      chai.assert(fakeGetAllShopPreferences.calledOnce, 'should call database once');

      chai.assert.becomes(allShopPrefsResult, getAllShopPrefsRes, 'the getAllShopPreferences promise resolves to the expected list of shop preferences');
      done();
    });
  });
});
