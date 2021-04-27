const express = require('express');
const serverless = require('serverless-http');
const routes = require('./routes/');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');


const app = express();
const router = express.Router();
const port = 8080;

// Middlewares
app
	.use(cors({ origin: 'http://localhost:3000' }))
	.use(bodyParser.json())
	.use(bodyParser.urlencoded({
	extended: true
}))
	.use(helmet());

// Routing
routes(router);
app.use('/', router);
app.get('/', (req, res) => {
		res.send('Nothing to see here :)');
	}
)

// Start server
app.listen(port, () => {
  console.log(`\n\nServer started at port: ${port}\n\n`);
});

module.exports.handler = serverless(app);
