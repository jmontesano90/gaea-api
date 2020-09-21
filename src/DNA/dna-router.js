const express = require('express');
const xss = require('xss');
const DnaService = require('./dna-service');

const dnaRouter = express.Router();
const jsonParser = express.json();

const serializeDna = (dnaInfo) => ({
  id: dnaInfo.id,
  user_id: dnaInfo.user_id,
  dna: dnaInfo.dna,
  name: xss(dnaInfo.name), // sanitize name
  comment: xss(dnaInfo.comment), // sanitize comment
});

dnaRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    DnaService.getAllDna(knexInstance)
      .then((dna) => {
        res.json(dna.map(serializeDna));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { user_id, name, dna, comment } = req.body;
    const newDna = { user_id, name, dna, comment };
    for (const [key, value] of Object.entries(newDna)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` },
        });
      }
    }
    DnaService.insertDna(req.app.get('db'), newDna)
      .then((dna) => {
        res.status(201).location(`/dna/${dna.id}`).json(serializeDna(dna));
      })
      .catch(next);
  });

dnaRouter
  .route('/:dna_id')
  .all((req, res, next) => {
    DnaService.getById(req.app.get('db'), req.params.dna_id)
      .then((dna) => {
        if (!dna) {
          return res.status(404).json({
            error: { message: `Dna doesn't exist` },
          });
        }
        res.dna = dna; // save the dna for the next middleware
        next(); // don't forget to call next so the next middleware happens!
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json({
      user_id: res.dna.user_id,
      id: res.dna.id,
      dna: res.dna.dna,
      name: xss(res.dna.name), // sanitize name
      comment: xss(res.dna.comment), // sanitize content
    });
  })
  .delete((req, res, next) => {
    DnaService.deleteDna(req.app.get('db'), req.params.dna_id)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  });

dnaRouter.route('/user/:user_id').get((req, res) => {
  DnaService.getByUserId(req.app.get('db'), req.params.user_id)
    .then((dna) => {
      console.log('Ran inside the .then');
      console.log(dna);
      console.log(dna.map(DnaService.serializeDna));
      res.json(dna.map(DnaService.serializeDna));
    })
    .catch(console.log('Dna user error'));
});

module.exports = dnaRouter;
