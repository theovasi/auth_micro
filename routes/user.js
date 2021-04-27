const userController = require('../controllers/user.ctrl');

module.exports = (router) => {
  router.get('/userExists/:userIdentifier', userController.checkUserExists);
  router.get('/login', userController.verifyLogin);
  router.post('/login', userController.loginUser);
  router.post('/user', userController.addUser);
  router.get('/user', userController.getUser);
};
