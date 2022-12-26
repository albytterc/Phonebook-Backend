if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}
const express = require('express');
// const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/person');
const app = express();

const options = {
	dotfiles: 'ignore',
	etag: false,
	extensions: ['htm', 'html', 'css', 'js', 'ico', 'jpg', 'jpeg', 'png', 'svg'],
	index: ['index.html'],
	maxAge: '1m',
	redirect: false
};


// app.use(morgan((tokens, req, res) => {
//   let log = [
//     tokens.method(req, res),
//     tokens.url(req, res),
//     tokens.status(req, res),
//     tokens.res(req, res, 'content-length'), '-',
//     tokens['response-time'](req, res), 'ms'
//   ].join(' ');
//
//   if (req.method === 'POST') {
//     return `${log} ${JSON.stringify(req.body)}`;
//   }
//
//   return log;
// }));
app.use(cors());
app.use(express.static('build', options));
app.use(express.json());


app.route('/api/persons')
	.get((req, res) => {
		console.log('GET /api/persons -- 200 OK');
		Person.find({}).then((result) => {
			res.json(result);
			// mongoose.connection.close();
		});
	})
	.post(async (req, res, next) => {
		const body = req.body;
		if (!body.name || !body.number) {
			console.log('POST /api/persons -- 400 name or number missing');
			return res.status(400).json({ error: 'Name or number missing' });
		}

		const hasDuplicate = await Person.exists({ name: body.name });
		if (hasDuplicate) {
			console.log('POST /api/persons -- 400 duplicate name');
			return res.status(400).json({ error: `Name ${body.name} already exists in phonebook` });
		}

		const person = new Person(body);
		person.save()
			.then((savedPerson) => {
				console.log('POST /api/persons -- 200 OK');
				res.json(savedPerson);
			})
			.catch((err => next(err)));
	});

app.route('/api/persons/:id')
	.get(async (req, res) => {
		const id = req.params.id;
		const resource = await Person.findById(id).exec();

		if (resource) {
			res.json(resource);
		} else {
			res.sendStatus(404);
		}
	})
	.delete((req, res, next) => {
		const id = req.params.id;
		Person.findByIdAndRemove(id)
			.then((resp) => {
				if (resp) {
					res.sendStatus(204);
				} else {
					res.sendStatus(404);
				}
			})
			.catch(err => next(err));
	})
	.put((req, res, next) => {
		const id = req.params.id;
		const body = req.body;
		const options = {
			new: true,
			runValidators: true,
			context: 'query'
		};
		Person.findByIdAndUpdate(id, body, options)
			.then((result) => {
				res.json(result);
			})
			.catch(error => next(error));
	});


app.get('/api/info', async (req, res) => {
	const numPeople = await Person.countDocuments({});
	res.send(new Date().toString() + `<p>Phonebook has ${numPeople} person(s) in it</p>`);
});

const unknownEndpoint = (req, res) => {
	res.status(404).json({ error: 'Unknown endpoint' });
};

app.use(unknownEndpoint);

const errorHandler = (error, req, res, next) => {
	console.log(error.message);

	switch (error.name) {
	case 'CastError':
		return res.status(400).send({ error: 'Incorrectly formatted id' });
	case 'ValidationError':
		return res.status(400).json({ error: error.message });
	default:
		next(error);
	}
};

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`App is listening on port ${PORT}...`);
});