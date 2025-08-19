const mongoose = require('mongoose');

const connectToDatabase = async () => {
	const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart-helpdesk';
	mongoose.set('strictQuery', false);
	await mongoose.connect(mongoUri, {});
	console.log('Connected to MongoDB');
};

module.exports = { connectToDatabase };
