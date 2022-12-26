
const express = require('express');
const morgan = require('morgan');
const logger = require('./utils/logger');
const cors = require('cors');
const Person = require('./models/person');
const { PORT } = require('./utils/config');
const personsRouter = require('./controllers/persons');
const middleware = require('./utils/middleware');
const app = express();

const options = {
	dotfiles: 'ignore',
	etag: false,
	extensions: ['htm', 'html', 'css', 'js', 'ico', 'jpg', 'jpeg', 'png', 'svg'],
	index: ['index.html'],
	maxAge: '1m',
	redirect: false
};



app.use(cors());
app.use(express.static('build', options));
app.use(express.json());
app.use(morgan(middleware.morganTemplate));

app.use('/api/persons', personsRouter);

app.get('/api/info', async (req, res) => {
	const numPeople = await Person.countDocuments({});
	res.send(new Date().toString() + `<p>Phonebook has ${numPeople} person(s) in it</p>`);
});


app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

app.listen(PORT, () => {
	logger.info(`App is listening on port ${PORT}...`);
});