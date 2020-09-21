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
  serializeDna(dnaInfo) {
    const { user } = dnaInfo;
    return {
      id: dnaInfo.id,
      user_id: dnaInfo.user_id,
      dnaStrand: dnaInfo.dna,
      name: xss(dnaInfo.name), // sanitize name
      comment: xss(dnaInfo.comment), // sanitize comment
    };
  },
};

module.exports = DnaService;
