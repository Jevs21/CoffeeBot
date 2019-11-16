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

    it("should return a new CoffeeShopPreference object", (done) => {
      const userId = 'User1';
      const details = {
        location: 'Library',
        name: 'Starbux'
      }

      const coffeeShopPreference = new CoffeeShopPreference(userId, details);

      coffeeShopPreference.user.id.should.equal(userId, "should set the id internally");
      coffeeShopPreference.location.should.equal(details.location, "should set the location");
      coffeeShopPreference.name.should.equal(details.name, "should set the name");
      
      done();
    });
  });

  // Test CoffeeShopPreference.getAllShopPreferences
  describe('getAllShopPreferences', () => {
    it('should get a list of all shop preferences that have been saved', (done) => {
      // Stub for db
      const getAllShopPrefsRes = [{
        id: 1,
        user_id: 'User1',
        name: 'Starbucks',
        location: '20 Stone Rd',
        created_at: '2020-01-10 16:20:00'
      }];
      const fakeGetAllShopPreferences = sinon.fake.resolves(getAllShopPrefsRes);
      sinon.stub(db, 'getAllShopPreferences').callsFake(fakeGetAllShopPreferences);

      const userId = 'User1';
      const coffeeShopPreference = new CoffeeShopPreference(userId);
      coffeeShopPreference.user.id.should.equal(userId, 'should set the id internally');

      const allShopPrefsResult = coffeeShopPreference.getAllShopPreferences();
      chai.assert(fakeGetAllShopPreferences.calledOnce, 'should call database once');

      chai.assert.becomes(allShopPrefsResult, getAllShopPrefsRes, 'the getAllShopPreferences promise resolves to the expected list of shop preferences');
      
      db.getAllShopPreferences.restore();
      
      done();
    });
  });

  // Test CoffeeShopPreference.getPreferences
  describe("getPreferences", () => {
    it("should get a coffee shop preference saved by a user", (done) => {
      const getShopPrefsRes = {
        id: 1,
        user_id: 'User2',
        name: 'Second Cup',
        location: '213 Sesame St',
        created_at: '2020-01-10 16:20:00'
      };
      const fakeGetPreferences = sinon.fake.resolves(getShopPrefsRes);
      sinon.stub(db, 'getCoffeeShopPreference').callsFake(fakeGetPreferences);

      const userId = 'User2';
      const coffeeShopPreference = new CoffeeShopPreference(userId);
      coffeeShopPreference.user.id.should.equal(userId, 'should set the id internally');

      const shopPrefResult = coffeeShopPreference.getPreferences();
      chai.assert(fakeGetPreferences.calledOnce, 'should call database once');

      chai.assert.becomes(shopPrefResult, getShopPrefsRes, 'the getPreferences promise resolves to the expected shop preference');
      
      db.getCoffeeShopPreference.restore();

      done();
    });
  });

  // Test CoffeeShopPreference.printSavedCoffeeShopPreference
  describe("printSavedCoffeeShopPreference", () => {
    it("should inform the user that no coffee shop preference has been saved", (done) => {
      const userId = 'User1';
      const coffeeShopPreference = new CoffeeShopPreference(userId);
      coffeeShopPreference.user.id.should.equal(userId, 'should set the id internally');

      const savedCoffeeShopPreference = coffeeShopPreference.printSavedCoffeeShopPreference();
      chai.assert.becomes(savedCoffeeShopPreference, "No coffee shop preferences saved.", 'should return a message indicating no coffee shop preference saved');

      done();
    });

    it("should return a string of the coffeeshop preference", async () => {
      const userId = 'User1';
      const name = 'Starbux';
      const loc = 'Library';
      const coffeeShopPreference = new CoffeeShopPreference(userId);
      coffeeShopPreference.user.id.should.equal(userId, 'should set the id internally');

      await coffeeShopPreference.saveCoffeeShopPreference(name, loc);

      let savedCoffeeShopPreference = await coffeeShopPreference.printSavedCoffeeShopPreference();
      chai.assert(
        savedCoffeeShopPreference.should.equal(`${name}, ${loc}`),
        'should a string representation of the shop preference'
      );
    });

    it("should return a string of the coffeeshop preference with null location", async () => {
      const userId = 'User1';
      const name = 'Starbux';
      const loc = null;
      const coffeeShopPreference = new CoffeeShopPreference(userId);
      coffeeShopPreference.user.id.should.equal(userId, 'should set the id internally');

      await coffeeShopPreference.saveCoffeeShopPreference(name, loc);

      let savedCoffeeShopPreference = await coffeeShopPreference.printSavedCoffeeShopPreference();
      chai.assert(
        savedCoffeeShopPreference.should.equal(`${name}`),
        'should a string representation of the shop preference'
      );
    });
  });

  // Test CoffeeShopPreference.parseNewFromStr
  describe("parseNewFromStr", () => {
    it("should parse coffee shop preference string correctly", (done) => {
      const shopPreference = {
        name: 'second cup',
        location: '213 sesame st'
      };

      const parsedShopPreference = CoffeeShopPreference.parseNewFromStr("Second Cup, 213 Sesame St");
      parsedShopPreference.name.should.equal(shopPreference.name, 'should correctly parse coffee shop name');
      parsedShopPreference.location.should.equal(shopPreference.location, 'should correctly parse coffee shop location');

      done();
    });
  });

  // Test CoffeeShopPreference.delete
  describe("delete", () => {
    it("should inform the user that the preference was deleted", async () => {
      const deleteShopPrefRes = {
        changes: 1
      };
      const fakeDeleteShopPreference = sinon.fake.resolves(deleteShopPrefRes);
      sinon.stub(db, 'deleteCoffeeShopPreference').callsFake(fakeDeleteShopPreference);

      const userId = 'User2';
      const coffeeShopPreference = new CoffeeShopPreference(userId);
      coffeeShopPreference.user.id.should.equal(userId, 'should set the id internally');

      let shopPrefResult = await coffeeShopPreference.delete();
      chai.assert(fakeDeleteShopPreference.calledOnce, 'should call database once');

      chai.assert(
        shopPrefResult.should.equal(`1 coffee shop deleted`),
        'should return a string representing how many preferences were deleted.'
      );
      
      db.deleteCoffeeShopPreference.restore();
    });

    it("should inform the user that the multiple preferences were deleted", async () => {
      const deleteShopPrefRes = {
        changes: 3
      };
      const fakeDeleteShopPreference = sinon.fake.resolves(deleteShopPrefRes);
      sinon.stub(db, 'deleteCoffeeShopPreference').callsFake(fakeDeleteShopPreference);

      const userId = 'User2';
      const coffeeShopPreference = new CoffeeShopPreference(userId);
      coffeeShopPreference.user.id.should.equal(userId, 'should set the id internally');

      let shopPrefResult = await coffeeShopPreference.delete();
      chai.assert(fakeDeleteShopPreference.calledOnce, 'should call database once');

      chai.assert(
        shopPrefResult.should.equal(`3 coffee shops deleted`),
        'should return a string representing how many preferences were deleted.'
      );
      
      db.deleteCoffeeShopPreference.restore();

    });

    it("should inform the user that no coffee shop preferences were found", async () => {
      const deleteShopPrefRes = {
        user_id: 'User2',
        name: 'Second Cup',
        location: '213 Sesame St'
      };
      const fakeDeleteShopPreference = sinon.fake.resolves(deleteShopPrefRes);
      sinon.stub(db, 'deleteCoffeeShopPreference').callsFake(fakeDeleteShopPreference);

      const userId = 'User2';
      const coffeeShopPreference = new CoffeeShopPreference(userId);
      coffeeShopPreference.user.id.should.equal(userId, 'should set the id internally');

      let shopPrefResult = await coffeeShopPreference.delete();
      chai.assert(fakeDeleteShopPreference.calledOnce, 'should call database once');

      chai.assert(
        shopPrefResult.should.equal('No coffee shops found'), 
        'the getPreferences promise resolves to the expected shop preference'
      );
      
      db.deleteCoffeeShopPreference.restore();
    });
  });

  // Test CoffeeShopPreference.hasPreferencesSet
  describe("hasPreferencesSet", () => {
    it("should return undefined indicating a coffee shop preference was not set", (done) => {
      const userId = 'User1';
      const coffeeShopPreference = new CoffeeShopPreference(userId);
      coffeeShopPreference.user.id.should.equal(userId, 'should set the id internally');

      const isShopPrefSet = coffeeShopPreference.hasPreferencesSet();
      chai.expect(isShopPrefSet).to.be.undefined;
      
      done();
    });
  });

  // Test CoffeeShopPreference.saveCoffeeShopPreference
  describe("saveCoffeeShopPreference", () => {
    it('should save the coffee shop preference to the database', async () => {
      const userId = 'User1';
      const name = 'Starbux';
      const loc = 'Library';
      const coffeeShopPreference = new CoffeeShopPreference(userId);

      await coffeeShopPreference.saveCoffeeShopPreference(name, loc);

      let prefRes = await db.get(`SELECT * FROM shop_preference`);

      prefRes.user_id.should.equal(userId);
      prefRes.name.should.equal(name);
      prefRes.location.should.equal(loc);
    });
  });

  describe("loadPreferences", () => {
    it('should load the preferences into the object', async () => {
      const userId = 'User1';
      const name = 'Starbux';
      const loc = 'Library';
      const coffeeShopPreference = new CoffeeShopPreference(userId);

      await db.run(`INSERT INTO shop_preference (user_id, name, location) VALUES ('${userId}', '${name}', '${loc}')`);

      await coffeeShopPreference.loadPreferences();

      coffeeShopPreference.user.id.should.equal(userId);
      coffeeShopPreference.name.should.equal(name);
      coffeeShopPreference.location.should.equal(loc);
    });

    it('should load empty preferences into the object', async () => {
      const userId = 'User1';
      const coffeeShopPreference = new CoffeeShopPreference(userId);

      await coffeeShopPreference.loadPreferences();

      coffeeShopPreference.user.id.should.equal(userId);
      coffeeShopPreference.name.should.equal('');
      coffeeShopPreference.location.should.equal('');
    });
  });
});
