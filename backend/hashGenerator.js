// hashGenerator.js
const bcrypt = require('bcryptjs');

const plainPassword = '123456'; // <-- Ganti dengan password yang Anda inginkan

bcrypt.hash(plainPassword, 10, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
    return;
  }
  console.log('Password Asli:', plainPassword);
  console.log('Password Hash:', hash); // <-- Salin hasil hash ini
});