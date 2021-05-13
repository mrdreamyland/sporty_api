
const express = require('express');
const code = require('../db/code');
const db = require('../db/postgresdb');
const models = require('../db/models');

var router = express.Router();

// get:trainer/teams/{trainer_id}
router.get('/teams/:trainer_id', async (req, res) => {
    console.log('> get team list')

    let trainerId = req.params.trainer_id
    try {
        let allTeams = (await db.query("SELECT * FROM teams;")).rows
        let trainerTeams = (await db.query("SELECT teams.id FROM trainers INNER JOIN teams ON teams.id = trainers.team_id WHERE trainers.profile_id = $1", [trainerId])).rows

        let teams = allTeams.map((row) => {
            let newTeam = models.Team(row)
            let trainerTeam = trainerTeams.find((team) => team.id === newTeam.id)

            newTeam.marked = trainerTeam != undefined

            return newTeam;
        })
        return res.json(teams)
    }
    catch (err) {
        console.log(err)
        return res.sendStatus(code.SERVER_ERROR)
    }
})

// post:trainer/team[trainer_id, team_id]
router.post('/team', async (req, res) => {
    console.log('> bind team')

    let trainerId = req.query.trainer_id
    let teamId = req.query.team_id

    let rows = (await db.query("SELECT * FROM trainers WHERE (profile_id = $1 AND team_id = $2)", [trainerId, teamId])).rows

    try {
        if (rows.length > 0) {
            // binding already exists
            return res.sendStatus(202)
        }
        else {
            await db.query("INSERT INTO trainers(profile_id, team_id) values($1, $2)", [trainerId, teamId])
            return res.sendStatus(200)
        }
    }
    catch (err) {
        console.log(err)
        re.sendStatus(code.SERVER_ERROR)
    }
})

// delete:trainer/team[trainer_id, team_id]
router.delete('/team', async (req, res) => {
    console.log('> delete binding')

    let trainerId = req.query.trainer_id
    let teamId = req.query.team_id

    try {
        await db.query("DELETE FROM trainers WHERE (profile_id = $1 AND team_id = $2)", [trainerId, teamId])
        return res.sendStatus(200)
    }
    catch(err) {
        console.log(err)
        re.sendStatus(code.SERVER_ERROR)
    }
})

// #token
// get:trainer/teams
router.get('/teams', async (req, res) => {
    console.log('> get team list with auth')

    let token = header('Authorization')

    try {
        let rows = (await db.query("SELECT id FROM profiles WHERE token = $1", [token])).rows
        if (rows.length == 0) {
            return res.sendStatus(code.UNAUTHORIZED)
        }
        let row = rows[0]
        let trainerId = row.id
        
        let allTeams = (await db.query("SELECT * FROM teams;")).rows
        let trainerTeams = (await db.query("SELECT teams.id FROM trainers INNER JOIN teams ON teams.id = trainers.team_id WHERE trainers.profile_id = $1", [trainerId])).rows

        let teams = allTeams.map((row) => {
            let newTeam = models.Team(row)
            let trainerTeam = trainerTeams.find((team) => team.id === newTeam.id)

            newTeam.marked = trainerTeam != undefined

            return newTeam;
        })
        console.log(allTeams.length)
        return res.json(teams)
    }
    catch (err) {
        console.log(err)
        return res.sendStatus(code.SERVER_ERROR)
    }
})

module.exports = router;
