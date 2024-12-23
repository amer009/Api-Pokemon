// blacklist.js
const blacklist = []; // Arreglo para almacenar los tokens que han sido invalidados

module.exports = {
  // Función para agregar un token a la blacklist
  addToBlacklist: (token) => {
    blacklist.push(token); // Agrega el token a la lista de tokens bloqueados
  },

  // Función para verificar si un token está en la blacklist
  isTokenBlacklisted: (token) => {
    return blacklist.includes(token);
  },
};

