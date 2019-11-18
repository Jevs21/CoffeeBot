// Import the dependencies for testing
const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');

const app = require('..');
const db = require('../db');
const CoffeePreference = require('../models/CoffeePreference');

// Configure chai
chai.use(chaiHttp);
chai.should();

// Use a test database for testing
db.connect('testdatabase.db');

const sandbox = sinon.createSandbox();

describe('CoffeePreference', () => {
  describe('POST /coffee/preference/save', () => {
    beforeEach(() => {
      // Spy on our slack interactions
      sandbox.spy(db, 'run');

      // reset the database on each run
      return db.clear();
    });

    afterEach(() => {
      sandbox.restore();
    });

    // Test to get all students record
    it('should tell the user it saved the coffee preference', (done) => {
      chai.request(app)
        .post('/coffee/preference/save')
        .send({
          user_id: 1,
          text: 'small tea with milk',
        })
        .end((err, res) => {
          // there should be no errors
          chai.expect(err).to.be.null;
          // there should be a 200 status code
          res.status.should.equal(200);

          // Should tell the user that the preference was saved
          chai.assert.include(res.text, 'Saved preference:');
          chai.assert.include(res.text, 'Size: small');
          chai.assert.include(res.text, 'Type: tea');
          chai.assert.include(res.text, 'Details: with milk');

          done();
        });
    });

    it('should save the preference in the database', (done) => {
      chai.request(app)
        .post('/coffee/preference/save')
        .send({
          user_id: 1,
          text: 'small tea with milk',
        })
        .end((err, res) => {
          // there should be no errors
          chai.expect(err).to.be.null;
          // there should be a 200 status code
          res.status.should.equal(200);

          // A query was run to save the drink preference in the database
          chai.assert(
            db.run.calledWith(sandbox.match('INSERT INTO drink_preference')),
            'should run an insert command on the drink preference table',
          );

          done();
        });
    });
  });

  /**
     * Test cases for /preferences/get endpoint
     */
  describe('POST /coffee/preferences/get', () => {
    before((done) => {
      Promise.all([
        db.runQuery('INSERT INTO test_user (user_name, user_id) VALUES ("impartialuser", "1a1b1c")'),

        db.runQuery('INSERT INTO test_user (user_name, user_id) VALUES ("thirstyuser", "2a2b2c")'),
        db.saveDrinkPreferences('2a2b2c', 'Medium', 'Coffee', 'Black'),

        db.runQuery('INSERT INTO test_user (user_name, user_id) VALUES ("shoppyuser", "3a3b3c")'),
        db.saveCoffeeShopPreference('3a3b3c', 'Starbucks'),

        db.runQuery('INSERT INTO test_user (user_name, user_id) VALUES ("readinguser", "4a4b4c")'),
        db.saveCoffeeShopPreference('4a4b4c', 'Starbucks', 'McLaughlan Library'),

        db.runQuery('INSERT INTO test_user (user_name, user_id) VALUES ("thirstyshoppyuser", "5a5b5c")'),
        db.saveDrinkPreferences('5a5b5c', 'Medium', 'Coffee', 'Black'),
        db.saveCoffeeShopPreference('5a5b5c', 'Starbucks'),

        db.runQuery('INSERT INTO test_user (user_name, user_id) VALUES ("thirstyreadinguser", "6a6b6c")'),
        db.saveDrinkPreferences('6a6b6c', 'Medium', 'Coffee', 'Black'),
        db.saveCoffeeShopPreference('6a6b6c', 'Starbucks', 'McLaughlan Library'),
      ]);
      done();
    });

    after((done) => {
      db.clear();

      done();
    });

    // no input, error handling
    it('should be a usage message', (done) => {
      chai.request(app)
        .post('/coffee/preference/get')
        .send({
          text: '',
        })
        .end((err, res) => {
          chai.expect(err).to.be.null;
          res.status.should.equal(200);
          chai.assert.include(res.text, 'I need a username to get preferences for! Try @<username>.');
          done();
        });
    });

    // no user found, error handling
    it('should be informing the user does not exist', (done) => {
      chai.request(app)
        .post('/coffee/preference/get')
        .send({
          text: '@nonuser',
        })
        .end((err, res) => {
          chai.expect(err).to.be.null;
          res.status.should.equal(200);
          chai.assert.include(res.text, 'I couldn\'t find a user with that name!');
          done();
        });
    });

    // no preferences found, error handling
    it('should be informing the user that user has no preferences', (done) => {
      chai.request(app)
        .post('/coffee/preference/get')
        .send({
          text: '@impartialuser',
        })
        .end((err, res) => {
          chai.expect(err).to.be.null;
          res.status.should.equal(200);
          chai.assert.include(res.text, '<@impartialuser> has no preferences, maybe ask them!');
          done();
        });
    });

    // drink preferences found
    it('should be informing the user of the user\'s drink preferences', (done) => {
      chai.request(app)
        .post('/coffee/preference/get')
        .send({
          text: '@thirstyuser',
        })
        .end((err, res) => {
          chai.expect(err).to.be.null;
          res.status.should.equal(200);
          chai.assert.include(res.text, '<@thirstyuser> prefers a Medium Coffee Black!');
          done();
        });
    });

    // shop preferences found without location
    it('should be informing the user of the user\'s cafe preferences', (done) => {
      chai.request(app)
        .post('/coffee/preference/get')
        .send({
          text: '@shoppyuser',
        })
        .end((err, res) => {
          chai.expect(err).to.be.null;
          res.status.should.equal(200);
          chai.assert.include(res.text, '<@shoppyuser>\'s favourite cafe is Starbucks!');
          done();
        });
    });

    // shop preferences found with location
    it('should be informing the user of the user\'s cafe preferences', (done) => {
      chai.request(app)
        .post('/coffee/preference/get')
        .send({
          text: '@readinguser',
        })
        .end((err, res) => {
          chai.expect(err).to.be.null;
          res.status.should.equal(200);
          chai.assert.include(res.text, '<@readinguser>\'s favourite cafe is Starbucks, McLaughlan Library!');
          done();
        });
    });

    // drink preferences found with cafe name, no location
    it('should be informing the user of the user\'s drink and cafe preferences', (done) => {
      chai.request(app)
        .post('/coffee/preference/get')
        .send({
          text: '@thirstyshoppyuser',
        })
        .end((err, res) => {
          chai.expect(err).to.be.null;
          res.status.should.equal(200);
          chai.assert.include(res.text, '<@thirstyshoppyuser> prefers a Medium Coffee Black and their favourite cafe is Starbucks!');
          done();
        });
    });

    // drink preferences found with cafe name and location
    it('should be informing the user of the user\'s drink and cafe preferences', (done) => {
      chai.request(app)
        .post('/coffee/preference/get')
        .send({
          text: '@thirstyreadinguser',
        })
        .end((err, res) => {
          chai.expect(err).to.be.null;
          res.status.should.equal(200);
          chai.assert.include(res.text, '<@thirstyreadinguser> prefers a Medium Coffee Black and their favourite cafe is Starbucks, McLaughlan Library!');
          done();
        });
    });

    // invalid input, expected behaviour
    it('should be ignoring the nonsense and printing a valid response', (done) => {
      chai.request(app)
        .post('/coffee/preference/get')
        .send({
          text: '@thirstyreadinguser nonsense nonsense nonsense @thirstyuser',
        })
        .end((err, res) => {
          chai.expect(err).to.be.null;
          res.status.should.equal(200);
          chai.assert.include(res.text, '<@thirstyreadinguser> prefers a Medium Coffee Black and their favourite cafe is Starbucks, McLaughlan Library!');
          done();
        });
    });
  });

  describe('Model tests', () => {
    describe("toSlackStr()", () => {
      it("should return the correct string representation", () => {
        const uID = 'UID123';
        const cp = new CoffeePreference(uID);

        cp.size = 'small';
        cp.type = 'coffee';
        cp.details = 'black';

        const result = cp.toSlackStr();

        chai.assert(
          result.should.equal(`Size: small\nType: coffee\nDetails: black`),
          'should return the correct string representation of the object'
        );
      });

      it("should return the default string for no preferences set.", () => {
        const uID = 'UID123';
        const cp = new CoffeePreference(uID);

        const result = cp.toSlackStr();

        chai.assert(
          result.should.equal('No preferences saved.'),
          'should return the correct string representation of the object'
        );
      });
    });
  });
});
