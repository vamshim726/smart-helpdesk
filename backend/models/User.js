const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true },
		email: { type: String, required: true, unique: true, lowercase: true, trim: true },
		passwordHash: { type: String, required: true },
		role: { type: String, enum: ['user', 'admin'], default: 'user' },
	},
	{ timestamps: true }
);

userSchema.methods.comparePassword = async function (plainPassword) {
	return bcrypt.compare(plainPassword, this.passwordHash);
};

userSchema.statics.hashPassword = async function (plainPassword) {
	const salt = await bcrypt.genSalt(10);
	return bcrypt.hash(plainPassword, salt);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
