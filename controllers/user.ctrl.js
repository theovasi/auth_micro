const User = require('./../models').User;
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const CryptoJS = require('crypto-js');

module.exports = {
  addUser: (req, res, next) => {
    let { username, email, password } = req.body;
    let salt = crypto.randomBytes(16);
    let passwordHash = CryptoJS.SHA3(password + salt);
    let passwordHex = passwordHash.toString(CryptoJS.enc.Hex);
    let profilePicture = null;

    new User({ username, email, password: passwordHex, salt})
      .save().then((user) => {
        if (user != null) {
          res.status(200).json({});
        } else {
          res.status(401).json({});
        }
      });
  },
  checkUserExists: (req, res, next) => {
    let emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (emailRegex.test(req.params.userIdentifier)) {
      whereClause = {email: req.params.userIdentifier};
    }
    else {
      whereClause = {username: req.params.userIdentifier};
    }

    return User
      .findOne(whereClause)
			.then(user => {
				res.status(201).send(user != null)
			})
      .catch(error => res.status(401).send(error));
  },

  loginUser: (req, res, next) => {
    let emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    let { userIdentifier, password } = req.body;
    let whereClause;
    if (emailRegex.test(userIdentifier)) {
      whereClause = {email: userIdentifier};
    }
    else {
      whereClause = {username: userIdentifier};
    }
       
    User
      .findOne(whereClause)
      .then(user => {
        let passwordHash = CryptoJS.SHA3(password + user.salt);
        let passwordHex = passwordHash.toString(CryptoJS.enc.Hex);

        if (passwordHex === user.password) {
          return res.json(
          {
						headers: {
							'Access-Control-Allow-Origin': '*',
							'Access-Control-Allow-Credentials': true,
						},
            // Generate token.
            token: jwt.sign(
            {
              userId: user.id,
              username: user.username,
						}, 'v3rys3cr3t', { expiresIn: '1d' }),
						refreshToken: jwt.sign(
							{
									userId: user.id,
									username: user.username,
							}, 'v3rys3cr3t',
						)
          });
        } else { 
          return res.json({
					});
        }
      })
      .catch(error => res.status(401).send(error));
  },

  getUser: (req, res, next) => {
    let token = req.get('Authorization');
    let userId = jwt.verify(token, 'v3rys3cr3t', 'base64').userId;
    User
      .findOne({id: userId })
        .then(user => res.status(200).json({ 
					headers: {
						'Access-Control-Allow-Origin': '*',
						'Access-Control-Allow-Credentials': true,
					},
					username: user.username
				}));
  },

  verifyLogin: (req, res, next) => {
    let token = req.get('Authorization');
    if (token === 'undefined') {
      return res.status(403).json( {} );
    } 

    let decoded = jwt.verify(token, 'v3rys3cr3t', 'base64');
    if (decoded) 
      return res.status(200).json({ decoded });
    else 
      return res.status(403).json( {} );
  }
};
