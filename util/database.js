const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const mongoConnect = (callback) => {
	MongoClient.connect('mongodb://localhost:27017/eCommerceApp', {
		useUnifiedTopology: true,
	})
		.then((client) => {
			console.log('Connected to MongoDB!');
			callback(client);
		})
		.catch((err) => {
			console.log(err);
		});
};

module.exports = mongoConnect;
