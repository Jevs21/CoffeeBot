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
db.connect('testdatabase.db');

const sandbox = sinon.createSandbox();

describe('CoffeeOrder', () => {
  beforeEach(() => {
    sandbox.spy(slack, 'postMessage');
    sandbox.spy(db, 'run');
    // reset the database on each run
    return db.clear();
  });

  afterEach(() => {
    sandbox.restore();
  });

  // Test CoffeeOrder constructor
  describe("new CoffeeOrder", () => {
    it("should return a new CoffeOrder object", (done) => {
      const userId = '123ABC';
      const order = new CoffeeOrder(userId);

      order.userId.should.equal(userId, "should set the id internally");

      done();
    });
  });

  // Test CoffeeOrder.createDateStr
  describe("createDateStr", () => {
    it("should reject any string not 10 characters long", (done) => {
      const userId = '123ABC';
      const order = new CoffeeOrder(userId);

      const str = '2019-1-10';

      const result = order.createDateStr(str);

      (result == null).should.be.true;

      done();
    });

    it("should return identical string if valid", (done) => {
      const userId = '123ABC';
      const order = new CoffeeOrder(userId);

      const str = '2019-01-10';

      const result = order.createDateStr(str);

      result.should.equal(str, "should return identical string if valid");

      done();
    });

    it("should change a string from YYYY/MM/DD format to YYYY-MM-DD format", (done) => {
      const userId = '123ABC';
      const order = new CoffeeOrder(userId);

      const str = '2019/01/10';
      const correctRet = '2019-01-10';

      const result = order.createDateStr(str);

      result.should.equal(correctRet, "should return the same date in a valid string format");

      done();
    });

    it("should change a string from YYYY MM DD format to YYYY-MM-DD format", (done) => {
      const userId = '123ABC';
      const order = new CoffeeOrder(userId);

      const str = '2019 01 10';
      const correctRet = '2019-01-10';

      const result = order.createDateStr(str);

      result.should.equal(correctRet, "should return the same date in a valid string format");

      done();
    });
  });

  // Test CoffeeOrder.getOrder with and without argument
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
      sinon.stub(db, 'getMostRecentOrder').callsFake(fakeGetRecentOrder);

      const userId = '123ABC';
      const order = new CoffeeOrder(userId);

      order.userId.should.equal(userId, 'should set the id internally');

      const orderResult = order.getOrder();
      chai.assert(fakeGetRecentOrder.calledOnce, 'should call database once');

      chai.assert.becomes(orderResult, getMostRecentOrderRes, 'the getRecentOrder promise resolves to the expected order');

      db.getMostRecentOrder.restore(); 
      
      done();
    });

    it('should get the most recent order, when an argument is provided', (done) => {
      const anyDate = '2020-01-10 16:20:00';

      // Stub for db
      const getOrderByDateRes = {
        id: 123,
        date: anyDate,
        thread_id: 'TID123',
        channel_id: 'CID123',
        coffee_getter: 3,
      };
      fakeGetOrderByDate = sinon.fake.resolves(getOrderByDateRes);
      sinon.stub(db, 'getOrderByDate').callsFake(fakeGetOrderByDate);

      const userId = '123ABC';
      const order = new CoffeeOrder(userId);

      order.userId.should.equal(userId, 'should set the id internally');

      const orderResult = order.getOrder(anyDate);
      chai.assert(fakeGetOrderByDate.calledOnce, 'should call database once');

      chai.assert.becomes(orderResult, getOrderByDateRes, "the getOrderByDate promise resolves to the expected order");
      
      db.getOrderByDate.restore();
      
      done();
    });
  });

  // Test CoffeeOrder.getUserOrder
  describe("getUserOrder", () => {
    it("should return a user's order response", async () => {
      const uID = 'UID123';
      const oID = 'OID123';
      const resp = 1;

      const order = new CoffeeOrder(uID);

      await db.run(`INSERT INTO user_order (user_id, order_id, response) VALUES ('UID111', 'OID000', ${resp})`);
      await db.run(`INSERT INTO user_order (user_id, order_id, response) VALUES ('${uID}', 'OID000', 0)`);
      await db.run(`INSERT INTO user_order (user_id, order_id, response) VALUES ('${uID}', '${oID}', ${resp})`);
      await db.run(`INSERT INTO user_order (user_id, order_id, response) VALUES ('UID000', '${oID}', ${resp})`);
      await db.run(`INSERT INTO user_order (user_id, order_id, response) VALUES ('${uID}', 'OID444', 0)`);
      
      let orderResp = await order.getUserOrder(oID, uID);

      orderResp.user_id.should.equal(uID);
      orderResp.order_id.should.equal(oID);
      orderResp.response.should.equal(resp);
    });
  });

  // Test CoffeeOrder.toSlackStr
  describe("toSlackStr", () => {
    it("should return an empty string (feature not in use)", (done) => {
      const uId = '123ABC';
      const order = new CoffeeOrder(uId);

      order.userId.should.equal(uId, "should set the id internally");

      const str = order.toSlackStr();

      str.should.equal("", "should return an empty string");
      done();
    });
  });
});