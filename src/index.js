const express = require('express');
const app = express();
const userRoutes = require('./routes/user.routes');

app.use(express.json()); // Middleware para manejar JSON

// Rutas
app.use('/api/users', userRoutes);

// Servidor
app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});

