const { Router } = require('express');
const router = Router();


// Importar todos los routers
const pokemonRoutes = require('../controllers/pokemon');
const typeRoutes = require('../controllers/type'); 


// Configurar los routers 
router.use('/pokemon', pokemonRoutes);
router.use('/type', typeRoutes);



module.exports = router;
