const getDB = require('../util/database').getDB;

module.exports = class Product {
	constructor(title, imgUrl, description, price) {
		this.title = title;
		this.imgUrl = imgUrl;
		this.description = description;
		this.price = price;
	}

	save() {
		const db = getDB();
		return db
			.collection('products')
			.insertOne(this)
			.then((result) => {
				// console.log(result);
			})
			.catch((err) => {
				console.log(err);
			});
	}

	static fetchAll() {
		const db = getDB();
		return db
			.collection('products')
			.find()
			.toArray()
			.then((products) => {
				return products;
			})
			.catch((err) => {
				console.log(err);
			});
	}
};
