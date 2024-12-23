const bcrypt = require('bcrypt'); // Librería para el manejo seguro de contraseñas
const jwt = require('jsonwebtoken'); // Librería para generar y verificar JSON Web Tokens
const axios = require('axios'); // Librería para realizar solicitudes HTTP
const { addToBlacklist } = require('../utils/blacklist'); // Importación de la función que maneja el blacklist de tokens

require('dotenv').config(); // Carga las variables de entorno desde el archivo .env
const SECRET_KEY = process.env.SECRET_KEY; // Clave secreta para firmar los JWT
const users = []; // Base de datos temporal

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validación de campos obligatorios
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    // Verificación de si el usuario ya existe
    const existingUser = users.find((user) => user.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'El usuario ya está registrado' });
    }

    // Hasheo de la contraseña antes de almacenarla
    const hashedPassword = await bcrypt.hash(password, 10);

    // Creación del nuevo usuario
    const newUser = {
      id: users.length + 1,
      name,
      email,
      password: hashedPassword,
    };

    // Agrega el nuevo usuario a la base de datos temporal
    users.push(newUser);

    // Respuesta exitosa con el ID del nuevo usuario
    res.status(201).json({ message: 'Usuario registrado con éxito', userId: newUser.id });
  } catch (error) {
    // Manejo de errores en caso de fallar en la creación
    res.status(500).json({ message: 'Error al registrar usuario', error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validación de campos obligatorios
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son obligatorios' });
    }

    // Búsqueda del usuario por email
    const user = users.find((user) => user.email === email);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Comparación de la contraseña proporcionada con la almacenada
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // Generación de un JWT con un tiempo de expiración de 1 hora
    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });

    // Respuesta exitosa con el token
    res.status(200).json({ message: 'Login exitoso', token });
  } catch (error) {
    // Manejo de errores en caso de fallar en el login
    res.status(500).json({ message: 'Error en el login', error: error.message });
  }
};

const addPokemon = async (req, res) => {
  try {
    const { pokemonName } = req.body; // Nombre del Pokémon enviado en el cuerpo de la solicitud
    const userId = req.user.id; // ID del usuario autenticado

    // Llamada a la API de Pokémon para obtener información sobre el Pokémon
    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`);
    if (!response.data) {
      return res.status(404).json({ message: 'Pokémon no encontrado' });
    }

    // Formato del Pokémon a agregar al inventario del usuario
    const pokemon = {
      name: response.data.name,
      id: response.data.id,
      type: response.data.types.map((t) => t.type.name),
    };

    // Buscar al usuario y agregar el Pokémon a su inventario
    const user = users.find((u) => u.id === userId);
    if (!user.inventory) {
      user.inventory = [];
    }

    user.inventory.push(pokemon); // Agregar el Pokémon al inventario

    // Respuesta exitosa con el Pokémon agregado
    res.status(201).json({
      message: 'Pokémon agregado exitosamente',
      pokemon,
    });
  } catch (error) {
    // Manejo de errores en caso de fallar al agregar el Pokémon
    res.status(500).json({ message: 'Error al agregar Pokémon', error: error.message });
  }
};

const getInventory = (req, res) => {
  try {
    const userId = req.user.id; // ID del usuario autenticado

    // Buscar al usuario por ID
    const user = users.find((u) => u.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar si el usuario tiene un inventario y si está vacío
    if (!user.inventory || user.inventory.length === 0) {
      return res.status(200).json({ message: 'No tienes Pokémon en tu inventario' });
    }

    // Responder con el inventario de Pokémon
    res.status(200).json({
      message: 'Inventario de Pokémon',
      inventory: user.inventory,
    });
  } catch (error) {
    // Manejo de errores al obtener el inventario
    res.status(500).json({ message: 'Error al obtener inventario', error: error.message });
  }
};

const logoutUser = (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Obtener el token de los encabezados
  if (!token) {
    return res.status(400).json({ message: 'Token no proporcionado' });
  }

  // Agregar el token a la blacklist
  addToBlacklist(token);
  res.status(200).json({ message: 'Logout exitoso' });
};

module.exports = { registerUser, loginUser, addPokemon, getInventory, logoutUser }; // Exportar las funciones para su uso en otros módulos
