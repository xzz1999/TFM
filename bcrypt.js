const bcrypt = require('bcrypt');
const password = process.argv[2]; // Obtiene la contraseña del argumento de la línea de comandos

// Generar hash de la contraseña
bcrypt.hash(password, 10, function(err, hash) {
  if (err) {
    console.error('Error al generar hash:', err);
    return;
  }
  console.log('Hash:', hash);

  // Verificar la contraseña con el hash
  bcrypt.compare(password, hash, function(err, result) {
    if (err) {
      console.error('Error al verificar la contraseña:', err);
      return;
    }
    console.log('La verificación fue exitosa:', result);
  });
});
