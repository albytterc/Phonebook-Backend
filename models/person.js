const mongoose = require('mongoose');
const { MONGODB_URI } = require('../utils/config');
mongoose.connect(MONGODB_URI)
	.then(() => console.log('Connected to DB'))
	.catch((err) => console.log('Unable to connect to DB:', err.message));

mongoose.set('strictQuery', true);


const personSchema = new mongoose.Schema({
	name: {
		type: String,
		minLength: 3,
		required: true

	},
	number: {
		type: Number,
		min: 1000000000,
		max: 9999999999,
		required: true
	}
});

personSchema.set('toJSON', {
	transform: (document, obj) => {
		obj.id = obj._id.toString();
		delete obj._id;
		delete obj.__v;
	}
});

module.exports = mongoose.model('Person', personSchema);