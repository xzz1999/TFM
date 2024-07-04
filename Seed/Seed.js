const mongoose = require('mongoose');
const fs = require('fs');
const bcrypt = require('bcrypt');

mongoose.connect('mongodb://127.0.0.1/TFM');

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
}, { versionKey: false });

const User = mongoose.model('User', userSchema);

// Función para hashear contraseñas
const hashPassword = async (password) => {
  const saltRounds = 10;
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.error('Error hasheando la contraseña:', error);
    throw error;
  }
};

fs.readFile('data.json', 'utf8', async (err, data) => {
  if (err) {
    console.error('Error leyendo el archivo JSON:', err);
    return;
  }
  
  try {
    const seedData = JSON.parse(data);

    // Hashear las contraseñas
    for (const user of seedData) {
      user.password = await hashPassword(user.password);
    }

    User.insertMany(seedData)
      .then(() => {
        console.log("Datos de semilla insertados correctamente");
        mongoose.connection.close();
      })
      .catch((err) => {
        console.error(err);
        mongoose.connection.close();
      });
  } catch (err) {
    console.error('Error parseando el archivo JSON:', err);
  }
});
