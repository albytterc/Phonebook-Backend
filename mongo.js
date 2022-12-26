const mongoose = require('mongoose');


if (process.argv.length < 3) {
	console.log('Please provide a password to access the database: node mongo.js <password>');
	process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://testuser:${password}@cluster0.ngxlwu8.mongodb.net/?retryWrites=true&w=majority`;

const personSchema = new mongoose.Schema({
	name: String,
	number: String
});

const Person = mongoose.model('Person', personSchema);

function savePersonToDB() {
	const name = process.argv[3];
	const number = process.argv[4];
	const person = new Person({
		name,
		number
	});

	person.save().then(() => {
		console.log('person saved');
		mongoose.connection.close();
	});
}

function listPersonsInDB() {
	Person.find({}).then((result) => {
		result.forEach((entry) => console.log(entry.name + ' ' + entry.number));
		mongoose.connection.close();
	});
}

mongoose
	.connect(url)
	.then(() => {
		console.log('connected');
		if (process.argv.length === 5) {
			savePersonToDB();
		} else if (process.argv.length === 3) {
			console.log('listing people');
			listPersonsInDB();
		}
	})
	.catch((err) => console.log('ERROR:', err.message));