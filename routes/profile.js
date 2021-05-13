// router for ./profile

const express = require('express');
const code = require('../db/code');
const db = require('../db/postgresdb');
const models = require('../db/models');
const util = require('../util')

var router = express.Router();

router.get('/', async (req, res) => {
    console.log('> get profile')

    try {
      
      let token = req.header('Authorization')

      let sql = 'SELECT profiles.id, profiles.name, profiles.birthDay, profiles.gender,' +
      ' profiles.phoneNumber, profiles.emailAddress, profiles.photoUrl, teams.name as team, teams.id as teamId' + 
      ' FROM profiles LEFT JOIN teams ON profiles.team_id = teams.id WHERE token = $1'


      let query = await db.query(sql, [token])
      
      if (query.rows.length == 0) {
        return res.send(code.UNAUTHORIZED)
      }
      return res.send(models.Profile(query.rows[0]))
    }
    catch(err) {
      console.log(err)
      return res.sendStatus(code.SERVER_ERROR)
    }
})


router.put('/', async (req, res) => {
  console.log('> update profile')

  let token = req.header('Authorization')
  let profile = req.body

  try {
    await db.query('UPDATE profiles set name = $1, birthDay = $2, gender = $3, phoneNumber = $4, emailAddress = $5 WHERE token = $6;',
    [profile.name, util.dateToString(profile.birthDay), profile.gender, profile.phoneNumber, profile.emailAddress, token])

    return res.sendStatus(200)
  }
  catch(err) {
    console.log(err)
    return res.sendStatus(code.SERVER_ERROR)
  }
}) 

router.put('/photo', async (req, res) => {
  console.log('> update photo')

  let token = req.header('Authorization')
  let photoUrl = req.query.url
  try {
    await db.query('UPDATE profiles set photoUrl = $1 WHERE token = $2', [photoUrl, token])
    return res.sendStatus(200)
  }
  catch(err) {
    console.log(err)
    return res.sendStatus(code.SERVER_ERROR)
  }
}) 

module.exports = router;