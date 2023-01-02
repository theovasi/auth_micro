const User = require("./../models").User;
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const CryptoJS = require("crypto-js");

const VAULT_ADDR = process.env.VAULT_ADDR;
const VAULT_NAMESPACE = process.env.VAULT_NAMESPACE;


async function fetchSignSecret () {
  let vaultToken;
  var details = {
      'role_id': '0895cf43-1b4f-ee7b-48c2-5997118572eb',
      'secret_id': 'd193002f-94bf-b442-0873-7263e5ebf8be'
  };

  var formBody = [];
  for (var property in details) {
    var encodedKey = encodeURIComponent(property);
    var encodedValue = encodeURIComponent(details[property]);
    formBody.push(encodedKey + "=" + encodedValue);
  }
  formBody = formBody.join("&");

  const signSecret = await fetch(VAULT_ADDR + '/v1/auth/approle/login', {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Vault-Namespace': 'admin'
    },
    body: formBody,
    method: 'POST'
  }).then(res => res.json()).then((data) => {
    vaultToken = data.auth.client_token;
    return fetch(VAULT_ADDR + '/v1/secret/data/sign', {
      headers: {
        'X-Vault-Token': vaultToken,
        'X-Vault-Namespace': VAULT_NAMESPACE
      },
      method: 'GET'
    }).then(res => res.json()).then((data) => {
        return data.data.data.secret;
    })
  });
  return signSecret;
}

const emailRegex =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

module.exports = {
  addUser: (req, res) => {
    let { username, email, password } = req.body;
    let salt = crypto.randomBytes(16);
    let passwordHash = CryptoJS.SHA3(password + salt);
    let passwordHex = passwordHash.toString(CryptoJS.enc.Hex);

    new User({ username, email, password: passwordHex, salt })
      .save()
      .then((user) => {
        if (user != null) {
          res.status(200).json({});
        } else {
          res.status(401).json({});
        }
      });
  },
  checkUserExists: (req, res) => {

    if (emailRegex.test(req.params.userIdentifier)) {
      whereClause = { email: req.params.userIdentifier };
    } else {
      whereClause = { username: req.params.userIdentifier };
    }

    return User.findOne(whereClause)
      .then((user) => {
        res.status(201).send(user != null);
      })
      .catch((error) => res.status(401).send(error));
  },

  loginUser: (req, res) => {
    let { userIdentifier, password } = req.body;
    let whereClause;

    if (emailRegex.test(userIdentifier)) {
      whereClause = { email: userIdentifier };
    } else {
      whereClause = { username: userIdentifier };
    }

    fetchSignSecret().then( (signSecret) => {
      User.findOne(whereClause)
      .then((user) => {
        let passwordHash = CryptoJS.SHA3(password + user.salt);
        let passwordHex = passwordHash.toString(CryptoJS.enc.Hex);

        if (passwordHex === user.password) {
          return res.json({
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Credentials": true,
            },
            // Generate token.
            token: jwt.sign(
              {
                userId: user.id,
                username: user.username,
              },
              signSecret,
              { expiresIn: "1d" }
            ),
            refreshToken: jwt.sign(
              {
                userId: user.id,
                username: user.username,
              },
              signSecret
            ),
          });
        } else {
          return res.json({});
        }
      })
      .catch((error) => res.status(401).send(error))})
  },

  getUser: (req, res) => {
    fetchSignSecret().then( (signSecret) => {
      let token = req.get("Authorization");
      let userId = jwt.verify(token, signSecret, "base64").userId;
      User.findOne({ id: userId }).then((user) =>
        res.status(200).json({
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
          },
          username: user.username,
        })
      );
    })
  },

  verifyLogin: (req, res) => {
    let token = req.get("Authorization");
    if (token === "undefined") {
      return res.status(403).json({});
    }

    fetchSignSecret().then( (signSecret) => {
      let decoded = jwt.verify(token, signSecret, "base64");
      if (decoded) return res.status(200).json({ decoded });
      else return res.status(403).json({});
    });
  }
};
