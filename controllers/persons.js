const personsRouter = require('express').Router();
const Person = require('../models/person');

personsRouter.route('/')
	.get((req, res) => {
		Person.find({}).then((result) => {
			res.json(result);
		});
	})
	.post(async (req, res, next) => {
		const body = req.body;
		if (!body.name || !body.number) {
			return res.status(400).json({ error: 'Name or number missing' });
		}

		const hasDuplicate = await Person.exists({ name: body.name });
		if (hasDuplicate) {
			return res.status(400).json({ error: `Name ${body.name} already exists in phonebook` });
		}

		const person = new Person(body);
		person.save()
			.then((savedPerson) => {
				res.json(savedPerson);
			})
			.catch((err => next(err)));
	});

personsRouter.route('/:id')
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

module.exports = personsRouter;