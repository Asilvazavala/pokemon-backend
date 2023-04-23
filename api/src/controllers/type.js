const axios = require('axios');
const API_URL_TYPES = 'https://pokeapi.co/api/v2/type';
const { Type } = require('../db');
const { Router } = require('express');
const router = Router();


// Obtener todos los tipos de Pokemon
router.get('/', async (req, res) => {
  const apiType = await axios.get(API_URL_TYPES)
  const createType = await apiType.data.results.map(el => el.name[0].toUpperCase() + el.name.slice(1))

  createType.map(el => Type.findOrCreate({
    where: {name: el}
  })) 

   const allPokemonTypes = await Type.findAll();
   res.send(allPokemonTypes);
});

module.exports = router;