const Sequelize = require('sequelize');

const sequelize = new Sequelize(
	'ecommerceapp',
	process.env.DB_USER,
	process.env.DB_PASS,
	{ dialect: 'mysql', host: 'localhost' }
);

// get the client
// const mysql = require('mysql2');

// // Create the connection pool
// const pool = mysql.createPool({
// 	host: process.env.DB_HOST,
// 	user: process.env.DB_USER,
// 	database: 'ecommerceapp',
// 	password: process.env.DB_PASS,
// 	waitForConnections: true,
// 	connectionLimit: 10,
// 	queueLimit: 0,
// });

// module.exports = pool.promise();
module.exports = sequelize;
