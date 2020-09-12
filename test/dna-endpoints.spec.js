const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');

describe.only('Dna Endpoints', function () {
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('clean the table', () => db('gaea_dna').truncate());
  context('Given there is dna in the database', () => {
    const testDna = [
      {
        id: 1,
        user_id: 1,
        name: 'Test 1',
        dna: 'aabbccddeeffkkllmmnnoopp',
        comment: 'Test 1 comment',
      },
      {
        id: 2,
        user_id: 1,
        name: 'Test 1',
        dna: 'aabbccddeeffkkllmmnnoopp',
        comment: 'Test 1 comment',
      },
    ];

    beforeEach('insert dna', () => {
      return db.into('gaea_dna').insert(testDna);
    });

    it('GET /dna responds with 200 and all of the dna', () => {
      return supertest(app).get('/dna').expect(200);
      // TODO: add more assertions about the body
    });
  });
});
