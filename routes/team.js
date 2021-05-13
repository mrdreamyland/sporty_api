const express = require('express');
const code = require('../db/code');
const db = require('../db/postgresdb');
const models = require('../db/models');
const util = require('../util')

var router = express.Router();

// get:team/trainers/{team_id}
router.get('/trainers/:team_id', async (req, res) => {
    console.log('> team trainers')
    const teamId = req.params.team_id

    try {
        let rows = (await db.query("SELECT * from trainers INNER JOIN profiles ON trainers.profile_id = profiles.id WHERE trainers.team_id = $1 ORDER BY name ASC", [teamId])).rows
        const trainers = rows.map((row) => models.Person(row))
        return res.json(trainers)
    }
    catch (err) {
        console.log(err)
        return res.sendStatus(code.SERVER_ERROR)
    }
})

// get:team/players/{team_id}
router.get('/players/:team_id', async (req, res) => {
    console.log('> team players')
    const teamId = req.params.team_id

    try {
        let rows = (await db.query("SELECT * from profiles where team_id = $1 ORDER BY name ASC", [teamId])).rows
        const players = rows.map((row) => models.Person(row))
        return res.json(players)
    }
    catch (err) {
        console.log(err)
        return res.sendStatus(code.SERVER_ERROR)
    }
})

// get:team/{team_id}
router.get('/:team_id', async (req, res) => {
    console.log('> get team')

    const teamId = req.params.team_id

    try {
        let rows = (await db.query("SELECT * FROM teams WHERE id = $1", [teamId])).rows
        if (rows.length == 0) {
            return res.sendStatus(code.NOT_FOUND)
        }
        return res.json(models.Team(rows[0]))
    }
    catch (err) {
        console.log(err)
        return res.sendStatus(code.SERVER_ERROR)
    }
})

// post:team[team]
router.post('/', async (req, res) => {
    console.log('> create team')

    const team = req.body
    try {
        await db.query("INSERT INTO teams(code, name, activity) values($1, $2, $3)", [team.code, team.name, team.activity])
        return res.sendStatus(200)
    }
    catch (err) {
        console.log(err)
        return res.sendStatus(code.SERVER_ERROR)
    }
})

// put:team/{team_id}[team]
router.put('/:team_id', async (req, res) => {
    console.log('> update team')

    const teamId = req.params.team_id
    const team = req.body

    try {
        await db.query("UPDATE teams SET code=$1, name=$2, activity=$3 WHERE id=$4", [team.code, team.name, team.activity, teamId])
        return res.sendStatus(200)
    }
    catch (err) {
        console.log(err)
        return res.sendStatus(code.SERVER_ERROR)
    }
})

// delete:team/{team_id}
router.delete('/:team_id', async (req, res) => {
    console.log('> delete team')

    const teamId = req.params.team_id

    try {
        await db.query("DELETE FROM teams WHERE id = $1", [teamId])
        return res.sendStatus(200)
    }
    catch (err) {
        console.log(err)
        return res.sendStatus(code.SERVER_ERROR)
    }
})

// !!get:team/attendance/{team_id}?start=&end
router.get('/attendance/:team_id', async (req, res) => {
    console.log('> attendance')

    const teamId = req.params.team_id
    const start = util.parseDate(req.query.start)
    const end = util.parseDate(req.query.end)
    try {
        const events = (await db.query("SELECT id, date FROM events WHERE (date >= $1 AND date <= $2 AND team_id = $3) ORDER BY date ASC",
            [util.dateToString(start), util.dateToString(end), teamId])).rows

        if (events.length == 0) {
            return res.json({ 'dates': [], 'attendances': [] })
        }

        const dates = events.map((event) => util.parseDate(event.date).day)
        console.log(dates)

        const players = (await db.query("SELECT id, name FROM profiles WHERE team_id = $1 ORDER BY name ASC", [teamId])).rows

        if (players.length == 0) {
            return res.json({ 'dates': dates, 'attendances': [] })
        }

        const allAttendances = (await db.query(
            "SELECT attendance.player_id, attendance.event_id, attendance.state, attendance.behavior, events.date "
            + "FROM events LEFT JOIN attendance ON (attendance.event_id = events.id) "
            + "WHERE (events.date >= $1 AND events.date <= $2 AND events.team_id = $3) ORDER BY events.date ASC",
            [util.dateToString(start), util.dateToString(end), teamId])).rows

        const attendances = players.map((player) => {
            const playerAttendances = attendancesForPlayer(player, allAttendances)
            console.log(playerAttendances)

            const fullAttendances = events.map(event => {
                const attendance = playerAttendances.find(v => v.date === event.date)
                return attendance ? attendance.state : 'NONE'
            })

            let attendedCount = fullAttendances.filter((attendance) => attendance == 'ATTENDED').length;
            let excusedCount = fullAttendances.filter((attendance) => attendance == 'EXCUSED').length;
            let lateCount = fullAttendances.filter((attendance) => attendance == 'LATE').length;
            let noneCount = fullAttendances.filter((attendance) => attendance == 'NONE').length;

            let percent = ((attendedCount + noneCount)/events.length).toFixed(1)*100

            return { 
                'name': player.name,
                'attendedCount': attendedCount, 
                'excusedCount': excusedCount,
                'lateCount': lateCount,
                'percent': percent,
                'states': fullAttendances 
            }
        })
        return res.json({ 'dates': dates, 'attendances': attendances })
    }
    catch (err) {
        console.log(err)
        return res.sendStatus(code.SERVER_ERROR)
    }
})

const attendancesForPlayer = (player, attendances) => attendances.filter((v) => v.player_id === player.id)

module.exports = router;