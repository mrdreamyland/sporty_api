const express = require('express');
const db = require('../db/postgresdb')
const code = require('../db/code');
const models = require('../db/models');

const router = express.Router();

// get:club/players
router.get('/players', async (req, res) => {
    console.log('require all players')
    try {
        let query = await db.query("SELECT profiles.id, profiles.name, profiles.phoneNumber, profiles.emailAddress, profiles.photoUrl, profiles.role, teams.name as teamName FROM profiles LEFT JOIN teams ON (profiles.team_id = teams.id) WHERE role = $1 ORDER BY profiles.name ASC;", ['PLAYER'])
        let data = query.rows
        let persons = data.map((e) => models.Person(e, e.teamName))
        res.json(persons)
    }
    catch(err) {
        console.log(err)
        res.sendStatus(code.SERVER_ERROR)
    }
})
// get:club/trainers
router.get('/trainers', async (req, res) => {
    console.log('require all trainers')
    try {
        let data = (await getPersons('TRAINER')).rows
        let persons = data.map((e) => models.Person(e))
        res.json(persons)
    }
    catch(err) {
        console.log(err)
        res.sendStatus(code.SERVER_ERROR)
    }
})
// get:club/parents
router.get('/parents', async (req, res) => {
    console.log('require all parents')
    try {
        let data = (await getPersons('PARENT')).rows
        let persons = data.map((e) => models.Person(e))
        res.json(persons)
    }
    catch(err) {
        console.log(err)
        res.sendStatus(code.SERVER_ERROR)
    }
})
// get:club/teams
router.get('/teams', async (req, res) => {
    console.log('require all teams')
    try {
        let query = await db.query("SELECT * FROM teams;")
        let data = query.rows
        let teams = data.map((e) => models.Team(e))
        res.json(teams)
    }
    catch(err) {
        console.log(err)
        res.sendStatus(code.SERVER_ERROR)
    }
})
// put:club/role{id}[role]
router.put('/role/:id', async (req, res) => {
    
    let id = req.params.id
    let role = req.query.role
    let admin = 'admin'

    console.log('change user role with id ' + id + 'to ' + role)

    try {
        await db.query('UPDATE profiles SET role = $1 WHERE id = $2 AND username <> $3;', [role, id, admin])
        res.sendStatus(200)
    }
    catch(err) {
        console.log(err)
        res.sendStatus(code.SERVER_ERROR)
    }
})
// get:club/contacts
router.get('/contacts', async (req, res) => {
    console.log('get contacts')
    try {
        let contacts = (await db.query('SELECT * FROM contacts;')).rows[0]
        res.json(models.Contacts(contacts))
    } 
    catch (err) {
        console.log(err)
        res.sendStatus(code.SERVER_ERROR)
    }
})
// put:club/contacts[contacts]
router.put('/contacts', async (req, res) => {
    console.log('update contacts')
    let contacts = req.body
    try {
        await db.query('UPDATE contacts SET phone = $1, email = $2, description = $3',
         [contacts.phone.toString(), contacts.email, contacts.description])
        res.sendStatus(200)
    }
    catch (err) {
        console.log(err)
        res.sendStatus(code.SERVER_ERROR)
    }
})

// get:club/users
router.get('/users', async (req, res) => {
    console.log('require all users')
    try {
        let data = (await db.query('SELECT * FROM profiles ORDER BY name ASC;')).rows
        let users = data.map((e) => models.User(e))
        res.json(users)
    }
    catch(err) {
        console.log(err)
        res.sendStatus(code.SERVER_ERROR)
    }
})

router.delete('/users/:id', async (req, res) => {
    let id = req.params.id
    try {
        console.log("delete user " + id)
        await db.query('DELETE FROM profiles WHERE id=$1;', [id])
        res.sendStatus(200)
    }
    catch(err) {
        console.log(err)
        res.sendStatus(code.SERVER_ERROR)
    }
})

async function getPersons(role) {
    let data = (role ? await db.query("SELECT * FROM profiles WHERE role = $1 ORDER BY name ASC;", [role]) 
    : await db.query("SELECT * FROM profiles ORDER BY name ASC;", []))
    return data
}

module.exports = router;
