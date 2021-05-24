const express = require('express');
const serverless = require('serverless-http');
const routes = require('./routes/');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');


const app = express();
const router = express.Router();

routes(router);

// Middlewares
app
	.use((req, res, next) => {
		res.append('Access-Control-Allow-Origin', '*');
		res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
		res.append('Access-Control-Allow-Headers', '*');
		next();
	})
	.use('/', router);

module.exports.handler = serverless(app);
