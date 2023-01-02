const userController = require("../controllers/user.ctrl");
const cors = require("cors");
var bodyParser = require("body-parser");

jsonParser = bodyParser.json();

module.exports = (router) => {
  router.get(
    "/userExists/:userIdentifier",
    jsonParser,
    userController.checkUserExists
  );
  router.get("/login", jsonParser, userController.verifyLogin);
  router.post("/login", jsonParser, userController.loginUser);
  router.post("/user", jsonParser, userController.addUser);
  router.get("/user", jsonParser, userController.getUser);
};
