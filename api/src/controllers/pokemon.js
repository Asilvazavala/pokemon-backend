const axios = require('axios');
const API_URL = 'https://pokeapi.co/api/v2/pokemon';
const { Pokemon, Type } = require('../db');
const { Router } = require('express');
const router = Router();


// Obtener info de la Api
const getApiInfo = async () => {
  // Crear array y pushearle la primer página con 20 pokemon 
  const fisrtPage = await axios.get(API_URL);
  const pokemon = [];
  pokemon.push(...fisrtPage.data.results);

  // Pushear en el array los otros 20 pokemon
  let apiUrl = await axios.get(`${API_URL}?offset=20&limit=20`)
  pokemon.push(...apiUrl.data.results);
  
  // Mostrar los datos necesarios 
  const apiInfo = pokemon.map(async (el) => {
    const data = await axios.get(`${API_URL}/${el.name}`);
    return {
      id: data.data.id,
      name: data.data.forms[0].name.charAt(0).toUpperCase() + data.data.forms[0].name.slice(1),
      image: data.data.sprites.other.home.front_default,
      types: data.data.types.map(el => el.type.name.charAt(0).toUpperCase() + el.type.name.slice(1)),
      hp: data.data.stats[0].base_stat,
      attack: data.data.stats[1].base_stat,
      defense: data.data.stats[2].base_stat,
      speed: data.data.stats[5].base_stat,
      height: data.data.height,
      weight: data.data.weight,
    };
});
  const finalData = await Promise.all(apiInfo).then((data) => data);
  return finalData
};


// Obtener info de mi DB 
const getDbInfo = async () => {
  return await Pokemon.findAll({
    include: {
      model: Type,
      attributes: ['name'],
    through: {
      attributes: [],
      },
    }
  })
};


// Unir la info de la Api y la info de  mi DB
const getAllPokemon = async () => {
  const apiInfo = await getApiInfo();
  const dbInfo = await getDbInfo();
  const allInfo = apiInfo.concat(dbInfo);
  return allInfo;
};


// Obtener todos los nombres de Pokemon || Buscar por nombre
router.get('/', async (req, res) => {
  const allPokemon = await getAllPokemon();
  const name = req.query.name;

  if(name) {
    const findPokemonName = allPokemon.filter(el => el.name.toLowerCase() === name.toLowerCase());
    findPokemonName.length > 0 ?
    res.send(findPokemonName) :
    res.status(404).send(`No existe ningún pokemon con nombre "${name}" intenta con otro nombre`);
  } else {
      res.send(allPokemon);
    }
});


// Buscar Pokemon por ID
router.get('/:id', async (req, res) => {
  const id = req.params.id;
  const allPokemon = await getAllPokemon();

  if(id) {
    const findPokemonId = allPokemon.filter(el => el.id == id);
    findPokemonId.length > 0 ?
    res.send(findPokemonId) :
    res.status(404).send(`No existe ningún pokemon con id "${id}" intenta con otro id`);
  } else {
      res.send(allPokemon);
    }
});


// Crear un Pokemon
router.post('/', async (req, res) => {
  // Nueva info pasada por el usuario
  let { name, image, types, hp, attack, defense, speed, height, weight, createdInDB } = req.body;
  
  // Crear el pokemon en la DB Pokemon
  let newPokemon = await Pokemon.create(
  { name, image, hp, attack, defense, speed, height, weight, createdInDB })
  
  // Agregar el tipo de Pokemon
  let addTypes = await Type.findAll({ where: { name: types } })
  newPokemon.addType(addTypes);

  res.send('Pokemon creado con éxito');

});


// Eliminar un Pokemon
router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  const allPokemon = await getAllPokemon();
  let index = allPokemon.findIndex(el => el.id == id);
  
  if(index >= 0) {
    allPokemon.splice(index, 1);
    res.send('Pokemon deleted succesfully!!');
  } else {
    res.status(404).send(`Pokemon with ID "${id}" not found, try with another`);
    }

  if(id) {
    await Pokemon.destroy({
      where : {id : id}
    })
  }
});


// Eliminar un Pokemon
router.put('/:id', async (req, res) => {
  const { id } = req.params;

  // Info a actualizar pasada por el usuario
  let { name, image, types, hp, attack, defense, speed, height, weight,
  } = req.body;

  // Validar si el ID existe en la DB
  const findId = await Pokemon.findByPk(id)
  if (!findId) {
    res.status(400).send(`Pokemon with ID ${id} not found`)
  } else {
    // Actualizar la nueva info en la DB Pokemon
    Pokemon.update ({
      name, image, types, hp, attack, defense, speed, height, weight, 
      },
      {
        where : { id, }
      },
    ); 
    res.send('Pokemon modified succesfully!!');
    }

});

module.exports = router;