const bcrypt = require('bcryptjs');

const password = 'admin123'; // Change this!
const hash = bcrypt.hashSync(password, 10);

console.log('Hashed password:', hash);