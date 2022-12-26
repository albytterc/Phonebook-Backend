const logger = require('./logger');
const morganTemplate = (tokens, req, res) => {
	let log = [
		tokens.method(req, res),
		tokens.url(req, res),
		tokens.status(req, res),
		tokens.res(req, res, 'content-length'), '-',
		tokens['response-time'](req, res), 'ms'
	].join(' ');

	return `${log} ${JSON.stringify(req.body)}`;
};

const unknownEndpoint = (req, res) => {
	res.status(404).json({ error: 'Unknown endpoint' });
};

const errorHandler = (error, req, res, next) => {
	logger.error(error.message);

	switch (error.name) {
	case 'CastError':
		return res.status(400).send({ error: 'Incorrectly formatted id' });
	case 'ValidationError':
		return res.status(400).json({ error: error.message });
	default:
		next(error);
	}
};

module.exports = {
	morganTemplate,
	unknownEndpoint,
	errorHandler
};