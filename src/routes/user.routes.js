const express = require('express');
const router = express.Router();
const { registerUser, loginUser, addPokemon, getInventory, logoutUser } = require('../controllers/user.controller');
const { authenticate, checkBlacklist } = require('../middlewares/auth.middleware');

// Rutas relacionadas con usuarios
router.post('/register', registerUser); // Registro de usuario
router.post('/login', loginUser); // Inicio de sesión

// Rutas protegidas (requieren autenticación y no estar en la blacklist)
router.post('/pokemons', authenticate, checkBlacklist, addPokemon); // Agregar un Pokémon
router.get('/inventory', authenticate, checkBlacklist, getInventory); // Obtener el inventario
router.post('/logout', authenticate, checkBlacklist, logoutUser); // Cerrar sesión

module.exports = router;
