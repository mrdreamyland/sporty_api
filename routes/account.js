// router for ./account

const express = require('express');
const db = require('../db/postgresdb')
const util = require('../util.js')
const code = require('../db/code')

const router = express.Router();

// /login?username=uu&password=1234
router.get('/login', async (req, res) => {
  console.log('> login');

  const { username, password } = req.query
  const token = util.generateToken(username, password);

  console.log('require user ' + username)

  try {
    let rows = (await db.query('SELECT token, role FROM profiles WHERE token = $1;', [token])).rows
    console.log(rows)

    if (rows.length == 0) {
      console.log('wrong username or password')
      return res.sendStatus(code.NOT_FOUND);
    }
    res.json(rows[0]);
  }
  catch (err) {
    console.error(err);
    return res.sendStatus(code.SERVER_ERROR);
  }
});

router.put('/signup', async (req, res) => {
  console.log('> signup');

  let singup = req.body;
  let username = singup.username;

  console.log('register user ' + username)

  try {
    let rows = (await db.query('SELECT username FROM profiles WHERE username = $1;', [username])).rows
    if (rows.length > 0) {
      console.log(`username '${username}' already defined!`);
      return res.sendStatus(code.EXISTS);
    }

    // register user
    let token = util.generateToken(singup.username, singup.password);

    let query = 'INSERT INTO profiles(team_id, name, birthDay, username, password, token, role, gender, phoneNumber, emailAddress, photoUrl, team_bind_date) ' +
        "VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);"

    let today = util.formatDate(new Date())
    let params = [-1, singup.name, '2001-01-01', singup.username, singup.password, token, 'NONE', 'NONE', '', '', '', today]

    await db.query(query, params)

    return res.json({ 'token': token, 'role': 'NONE' });
  }
  catch(err) {
    console.error(err);
    return res.sendStatus(code.SERVER_ERROR);
  }
});

module.exports = router;
