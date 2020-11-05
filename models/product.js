const Sequelize = require('sequelize');

const sequelize = require('../util/database');

// product model
const Product = sequelize.define('product', {
	id: {
		type: Sequelize.INTEGER,
		autoIncrement: true,
		allowNull: false,
		primaryKey: true,
	},
	title: Sequelize.STRING,
	price: {
		type: Sequelize.DOUBLE,
		allowNull: false,
	},
	imgUrl: {
		type: Sequelize.STRING,
		allowNull: false,
	},
	description: {
		type: Sequelize.STRING,
		allowNull: false,
	},
});

module.exports = Product;

// const db = require('../util/database');

// const Cart = require('./cart');

// module.exports = class Product {
// 	constructor(id, title, imgUrl, description, price) {
// 		this.id = id;
// 		this.title = title;
// 		this.imgUrl = imgUrl;
// 		this.description = description;
// 		this.price = price;
// 	}

// 	save() {
// 		return db.execute(
// 			'INSERT INTO products (title, price, imgUrl, description) VALUES (?, ?, ?, ?)',
// 			[this.title, this.price, this.imgUrl, this.description]
// 		);
// 	}

// 	static deleteById(id) {}

// 	static fetchAll() {
// 		return db.execute('SELECT * FROM products');
// 	}

// 	static findById(id) {
// 		return db.execute('SELECT * FROM products WHERE products.id = ?', [id]);
// 	}
// };
