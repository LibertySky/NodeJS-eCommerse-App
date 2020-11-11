const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

class Product {
	constructor(title, imgUrl, description, price, id, userId) {
		this.title = title;
		this.imgUrl = imgUrl;
		this.description = description;
		this.price = price;
		this._id = id ? new mongodb.ObjectID(id) : null;
		this.userId = userId;
	}

	save() {
		const db = getDb();
		let dbOp;
		if (this._id) {
			// update the product
			dbOp = db
				.collection('products')
				.updateOne({ _id: this._id }, { $set: this });
		} else {
			dbOp = db.collection('products').insertOne(this);
		}
		return dbOp
			.then((result) => {
				// console.log(result);
			})
			.catch((err) => {
				console.log(err);
			});
	}

	static fetchAll() {
		const db = getDb();
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

	static findById(prodId) {
		const db = getDb();
		return db
			.collection('products')
			.find({ _id: new mongodb.ObjectId(prodId) })
			.next()
			.then((product) => {
				// console.log(product);
				return product;
			})
			.catch((err) => {
				console.log(err);
			});
	}

	static deleteById(prodId) {
		const db = getDb();
		return db
			.collection('products')
			.deleteOne({ _id: new mongodb.ObjectId(prodId) })
			.then()
			.catch((err) => {
				console.log(err);
			});
	}
}

module.exports = Product;
