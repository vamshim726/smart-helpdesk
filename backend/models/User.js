const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
	{
		name: { 
			type: String, 
			required: [true, 'Name is required'], 
			trim: true,
			minlength: [2, 'Name must be at least 2 characters long'],
			maxlength: [50, 'Name cannot exceed 50 characters']
		},
		email: { 
			type: String, 
			required: [true, 'Email is required'], 
			unique: true, 
			lowercase: true, 
			trim: true,
			match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
		},
		passwordHash: { 
			type: String, 
			required: [true, 'Password hash is required']
		},
		role: { 
			type: String, 
			enum: {
				values: ['admin', 'agent', 'user'],
				message: 'Role must be either "admin", "agent", or "user"'
			}, 
			default: 'user'
		},
		isActive: {
			type: Boolean,
			default: true
		},
		lastLogin: {
			type: Date,
			default: null
		}
	},
	{ 
		timestamps: true,
		toJSON: { 
			transform: function(doc, ret) {
				delete ret.passwordHash;
				return ret;
			}
		}
	}
);

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

// Instance method to compare password
userSchema.methods.comparePassword = async function (plainPassword) {
	if (!plainPassword) {
		throw new Error('Password is required for comparison');
	}
	return bcrypt.compare(plainPassword, this.passwordHash);
};

// Static method to hash password
userSchema.statics.hashPassword = async function (plainPassword) {
	if (!plainPassword) {
		throw new Error('Password is required for hashing');
	}
	if (plainPassword.length < 6) {
		throw new Error('Password must be at least 6 characters long');
	}
	const salt = await bcrypt.genSalt(12);
	return bcrypt.hash(plainPassword, salt);
};

// Instance method to update last login
userSchema.methods.updateLastLogin = function() {
	this.lastLogin = new Date();
	return this.save();
};

// Static method to find user by email (case-insensitive)
userSchema.statics.findByEmail = function(email) {
	return this.findOne({ email: email.toLowerCase() });
};

// Pre-save middleware to ensure email is lowercase
userSchema.pre('save', function(next) {
	if (this.isModified('email')) {
		this.email = this.email.toLowerCase();
	}
	next();
});

// Pre-save middleware to validate password hash
userSchema.pre('save', function(next) {
	if (this.isModified('passwordHash') && !this.passwordHash) {
		next(new Error('Password hash cannot be empty'));
	}
	next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
