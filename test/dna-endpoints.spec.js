const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const { makeDnaArray } = require('./dna.fixtures');

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
  afterEach('cleanup', () => db('gaea_dna').truncate());
  context('Given there is dna in the database', () => {
    const testDna = makeDnaArray();

    beforeEach('insert dna', () => {
      return db.into('gaea_dna').insert(testDna);
    });

    it('GET /dna responds with 200 and all of the dna', () => {
      return supertest(app).get('/dna').expect(200).expect(200, testDna);
    });
    it('GET /dna/:dna_id responds with 200 and the specified dna item', () => {
      const dnaId = 2;
      const expectedDna = testDna[dnaId - 1];
      return supertest(app).get(`/dna/${dnaId}`).expect(200, expectedDna);
    });
  });
});
