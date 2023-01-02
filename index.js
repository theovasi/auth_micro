const express = require("express");
var bodyParser = require("body-parser");
const routes = require("./routes/");
var cors = require("cors");
const helmet = require("helmet");

const port = 5000;
// CORS is enabled for the selected origins

const app = express();

// Middlewares
app.use(cors());
app.use(helmet());

const router = express.Router();
routes(router);
app.use("/", router);

app.listen(port, () => {
  console.log("Server running on port: " + port);
});
