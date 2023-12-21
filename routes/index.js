var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.status(200).send("Welcome to CoderSchool!")
});

const pokemonRouter= require('./pokemon_api.js')
router.use('/pokemons',pokemonRouter)

module.exports = router;
