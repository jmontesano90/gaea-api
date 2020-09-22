const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const {
  makeUserArray,
  makeMaliciousUser,
  cleanTables,
} = require('./user.fixtures');

describe.only('User Endpoints', function () {
  let db;
  const testUsers = makeUserArray();
  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('clean the table', () => cleanTables(db));
  afterEach('cleanup', () => cleanTables(db));

  // before -> insert some test users whose id's will match your testDNA

  describe(`Get /api/auth/:user_name`, () => {
    context('Given this user is in the database', () => {
      beforeEach('insert users', () => {
        return db.into('gaea_users').insert(testUsers[0]);
      });

      it('GET /api/auth responds with 200 and the users id number', () => {
        return supertest(app)
          .get(`/api/auth/${testUsers[0].user_name}`)
          .expect(200, `{"id":${testUsers[0].id}}`);
      });
    });
  });
  describe.only(`POST /api/auth/users`, () => {
    it(`creates a user, responding with 201 and the new user`, function () {
      const newUser = testUsers[0];
      return supertest(app)
        .post('/api/auth/users')
        .send(newUser)
        .expect(201)
        .expect((res) => {
          expect(res.body.user_name).to.eql(newUser.user_name);
          //expect(res.body.password).to.eql(newUser.password);
          expect(res.body).to.have.property('id');
        });
    });
    const requiredFields = ['user_name', 'password'];

    requiredFields.forEach((field) => {
      const newUser = { user_name: 'Test1', password: 'testPassword' };
      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newUser[field];
        return supertest(app)
          .post('/api/auth/users')
          .send(newUser)
          .expect(400, {
            error: `Missing '${field}' in request body`,
          });
      });
    });
  });
});
