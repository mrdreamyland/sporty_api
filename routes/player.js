const express = require('express');
const db = require('../db/postgresdb')
const util = require('../util.js')
const code = require('../db/code');
const models = require('../db/models');

const router = express.Router();

// put:player/team[player_id, team_id]
router.put('/team', async (req, res) => {
    console.log('> change player team')

    const teamId = req.query.team_id
    const playerId = req.query.player_id
    const today = util.dateToString(new Date())

    try {
        await db.query("UPDATE profiles SET team_id = $1 team_bind_date=$2 WHERE id = $3", [teamId, today, playerId])
        return res.sendStatus(200)
    }
    catch (err) {
        return res.sendStatus(code.SERVER_ERROR)
    }
});

// get:player/team/{player_id}
router.get('/team/:player_id', async (req, res) => {
    const playerId = req.params.player_id

    try {
        const data = await db.query("SELECT teams.id, teams.code, teams.name, teams.activity "
            + "FROM teams INNER JOIN profiles ON (teams.id = profiles.team_id) WHERE profiles.id = $1;", [playerId])
        const rows = data.rows

        if (rows.length == 0) {
            return res.sendStatus(code.NOT_FOUND)
        }
        else {
            return res.json(models.Team(rows[0]))
        }
    }
    catch (err) {
        console.log(err)
        return res.sendStatus(code.SERVER_ERROR)
    }
});

// get:/player/statistics/{profileId}
router.get('/statistics/:player_id', async (req, res) => {
    const playerId = req.params.player_id

    try {
        let query = await db.query("SELECT name, team_id, team_bind_date from profiles WHERE id = $1", [playerId])
        let rows = query.rows

        if (rows.length == 0) {
            return res.sendStatus(code.NOT_FOUND)
        }
        const player = rows[0]
        const teamId = player.team_id
        const name = player.name
        const bindDate = player.team_bind_date

        query = await db.query("SELECT * FROM events WHERE team_id = $1 AND date >= $2", [teamId, bindDate])
        const allEvents = query.rows

        query = await db.query("SELECT * FROM attendance WHERE attendance.player_id = $1", [playerId])
        const attendances = query.rows

        let good = attendances.filter((e) => e.behavior == 'POSITIVELY').length
        let bad = attendances.filter((e) => e.behavior == 'BAD').length
        let excused = attendances.filter((e) => e.state == 'EXCUSED').length
        let attended = attendances.filter((e) => e.state == 'ATTENDED').length
        let late = attendances.filter((e) => e.state == 'LATE').length

        let filteredEvents = allEvents
            .filter(e => e.type == 'EVENT' || e.type == 'WORKOUT')
            .filter(e => attendances.find(a => a.event_id == e.id) != undefined)

        let events = filteredEvents.filter(e => e.type == 'EVENT').length
        let workouts = filteredEvents.filter(e => e.type == 'WORKOUT').length

        let all = attended + excused + late
        let score = 10 / all

        let scores = (attended * score)
            + (excused * score * 0.25)
            + (late * score * 0.5)
            + (good * score * 0.1)
            - (bad * score * 0.25)

        let statistics = {
            'scores': parseFloat(scores.toFixed(1)),
            'good': good,
            'bad': bad,
            'attended': attended,
            'excused': excused,
            'late': late,
            'events': events,
            'workouts': workouts
        }

        console.log(player.name)
        console.log(JSON.stringify(statistics,null,2))

        return res.json(statistics)
    }
    catch (err) {
        console.log(err)
        return res.sendStatus(code.SERVER_ERROR)
    }
});

module.exports = router