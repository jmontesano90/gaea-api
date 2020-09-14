const xss = require('xss');
const knex = require('knex');

const DnaService = {
  getAllDna(knex) {
    return knex.select('*').from('gaea_dna');
  },

  insertDna(knex, newDna) {
    return knex
      .insert(newDna)
      .into('gaea_dna')
      .returning('*')
      .then(([Dna]) => Dna)
      .then((Dna) => {
        return DnaService.getById(knex, Dna.id);
      });
  },
  getByUserId(knex, userId) {
    return knex.from('gaea_dna').select('*').where('user_id', userId);
  },
  getById(knex, id) {
    return knex.from('gaea_dna').select('*').where('id', id).first();
  },
  deleteDna(knex, id) {
    return knex('gaea_dna').where({ id }).delete();
  },
  serializeDna(Dna) {
    const { user } = Dna;
    return {
      id: Dna.id,
      user_id: Dna.user_id,
      name: Dna.name,
      Dna: Dna.Dna,
      comment: Dna.comment,
    };
  },
};

module.exports = DnaService;
