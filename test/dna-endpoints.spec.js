const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const { makeDnaArray, makeMaliciousDna } = require('./dna.fixtures');

describe('Dna Endpoints', function () {
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

  describe(`Get /dna`, () => {
    context('Given there is dna in the database', () => {
      const testDna = makeDnaArray();

      beforeEach('insert dna', () => {
        return db.into('gaea_dna').insert(testDna);
      });

      it('GET /dna responds with 200 and all of the dna', () => {
        return supertest(app).get('/dna').expect(200).expect(200, testDna);
      });
    });
    context(`Given no dna`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app).get('/dna').expect(200, []);
      });
    });

    context(`Given an XSS attack dna strand`, () => {
      const { maliciousDna, expectedDna } = makeMaliciousDna();

      beforeEach('insert malicious Dna', () => {
        return db.into('gaea_dna').insert([maliciousDna]);
      });

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/dna`)
          .expect(200)
          .expect((res) => {
            expect(res.body[0].name).to.eql(expectedDna.name);
            expect(res.body[0].comment).to.eql(expectedDna.comment);
          });
      });
    });
  });
  describe(`Get /dna/:dna_id`, () => {
    context(`Given no dna`, () => {
      it(`responds with 404`, () => {
        const dnaId = 123456;
        return supertest(app)
          .get(`/dna/${dnaId}`)
          .expect(404, { error: { message: `Dna doesn't exist` } });
      });
    });
    context(`Given there is dna in the database`, () => {
      const testDna = makeDnaArray();

      beforeEach('insert dna', () => {
        return db.into('gaea_dna').insert(testDna);
      });
      it('GET /dna/:dna_id responds with 200 and the specified dna item', () => {
        const dnaId = 2;
        const expectedDna = testDna[dnaId - 1];
        return supertest(app).get(`/dna/${dnaId}`).expect(200, expectedDna);
      });
    });

    context(`Given an XSS attack dna strand`, () => {
      const maliciousDna = {
        id: 911,
        name: 'Naughty naughty very naughty <script>alert("xss");</script>',
        dna: 'How-to',
        comment: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
      };

      beforeEach('insert malicious dna', () => {
        return db.into('gaea_dna').insert([maliciousDna]);
      });

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/dna/${maliciousDna.id}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.name).to.eql(
              'Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;'
            );
            expect(res.body.comment).to.eql(
              `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
            );
          });
      });
    });
  });

  describe(`POST /dna`, () => {
    it(`creates a dna strand, responding with 201 and the new dna strand`, function () {
      const newDna = {
        name: 'Test new Dna',
        dna: 'AaBbCcDdEeFfKkLlMmNnOoPp',
        comment: 'Test new dna comment...',
      };
      return supertest(app)
        .post('/dna')
        .send(newDna)
        .expect(201)
        .expect((res) => {
          expect(res.body.name).to.eql(newDna.name);
          expect(res.body.dna).to.eql(newDna.dna);
          expect(res.body.comment).to.eql(newDna.comment);
          expect(res.body).to.have.property('id');
          expect(res.headers.location).to.eql(`/dna/${res.body.id}`);
        })
        .then((postRes) =>
          supertest(app).get(`/dna/${postRes.body.id}`).expect(postRes.body)
        );
    });
    const requiredFields = ['name', 'dna', 'comment'];

    requiredFields.forEach((field) => {
      const newDna = {
        name: 'Test new Dna',
        dna: 'AaBbCcDdEeFfKkLlMmNnOoPp',
        comment: 'Test new dna comment...',
      };

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newDna[field];

        return supertest(app)
          .post('/dna')
          .send(newDna)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` },
          });
      });
    });
    it('removes XSS attack content from response', () => {
      const { maliciousDna, expectedDna } = makeMaliciousDna();
      return supertest(app)
        .post(`/dna`)
        .send(maliciousDna)
        .expect(201)
        .expect((res) => {
          expect(res.body.name).to.eql(expectedDna.name);
          expect(res.body.comment).to.eql(expectedDna.comment);
        });
    });
  });

  describe(`DELETE /dna/:dna_id`, () => {
    context('Given there are dnas in the database', () => {
      const testDna = makeDnaArray();

      beforeEach('insert dna', () => {
        return db.into('gaea_dna').insert(testDna);
      });

      it('responds with 204 and removes the dna', () => {
        const idToRemove = 2;
        const expectedDna = testDna.filter((dna) => dna.id !== idToRemove);
        return supertest(app)
          .delete(`/Dna/${idToRemove}`)
          .expect(204)
          .then((res) => supertest(app).get(`/Dna`).expect(expectedDna));
      });
    });
  });
});
