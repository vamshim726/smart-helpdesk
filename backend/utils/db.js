const mongoose = require('mongoose');

const connectToDatabase = async () => {
	const mongoUri = process.env.MONGO_URI;
	
	mongoose.set('strictQuery', false);
	await mongoose.connect(mongoUri, {});
	console.log(mongoUri);
	console.log('Connected to MongoDBSS');
};

module.exports = { connectToDatabase };
