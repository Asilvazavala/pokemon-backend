const API_URL_TYPES = 'https://pokeapi.co/api/v2/type';
const { Type } = require('./db');
const axios = require('axios');

const addTypesToDb = async () => {
const apiType = await axios.get(API_URL_TYPES)
let createType = await apiType.data.results.map(el => el.name[0].toUpperCase() + el.name.slice(1));
createType.sort(function (a, b) {
  if (a > b) {
    return 1;
  } else if (a < b) {
      return -1;
  }
  return 0 
})

  createType.map(el => Type.findOrCreate({
     where: {name: el}
  }))

     await Type.findAll();
     console.log('Types adedd to DB');
}

module.exports = {
  addTypesToDb,
}