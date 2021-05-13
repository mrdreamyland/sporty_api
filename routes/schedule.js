const express = require('express');
const db = require('../db/postgresdb')
const util = require('../util.js')
const code = require('../db/code');
const models = require('../db/models');
const queries = require('../db/queries')

const router = express.Router();

// get:schedule/player/{id}[type, dates]
router.get('/player/:id', async (req, res) => {

    const prof_id = req.params.id
    const type = req.query.type
    const startDate = req.query.start
    const endDate = req.query.end

    try {
        let sql = queries.schedule.player(prof_id, type, startDate, endDate)
        let query = await db.query(sql.sql, sql.params)
        console.log(query.rows)
        const events = query.rows.map(e => models.Schedule(e))
        console.log(events.name)
        return res.json(events)
    }
    catch(err) {
        console.log(err)
        return res.sendStatus(code.SERVER_ERROR)
    }
});

// get:schedule/trainer/{id}[type, dates]
router.get('/trainer/:id', async (req, res) => {

    const prof_id = req.params.id
    const type = req.query.type
    const startDate = req.query.start
    const endDate = req.query.end

    try {
        let sql = queries.schedule.trainer(prof_id, type, startDate, endDate)
        let query = await db.query(sql.sql, sql.params)
        const events = query.rows.map(e => models.Schedule(e))
        console.log(events)
        return res.json(events)
    }
    catch(err) {
        console.log(err)
        return res.sendStatus(code.SERVER_ERROR)
    }
});

// get:schedule/team[team_id, dates]
router.get('/team/:id', async (req, res) => {

    const team_id = req.params.id
    const type = req.query.type
    const startDate = req.query.start
    const endDate = req.query.end

    try {
        let sql = queries.schedule.team(team_id, type, startDate, endDate)
        let query = await db.query(sql.sql, sql.params)
        const events = query.rows.map(e => models.Schedule(e))
        return res.json(events)
    }
    catch(err) {
        console.log(err)
        return res.sendStatus(code.SERVER_ERROR)
    }
});

// get:schedule/details/{shedule_id}
router.get('/details/:schedule_id', async (req, res) => {

    const id = req.params.schedule_id

    const sql = "SELECT attendance.id, events.id as event_id, profiles.id as prof_id, profiles.name, profiles.photoUrl, attendance.state, attendance.behavior "
        + "FROM profiles INNER JOIN events ON (profiles.team_id = events.team_id) "
        + "LEFT JOIN attendance ON (profiles.id = attendance.player_id AND events.id = attendance.event_id) "
        + "WHERE (events.id = $1)"

        try {
            let query = await db.query(sql, [id])
            console.log(query.rows)
            const events = query.rows.map(e => models.Event(e))
            return res.json(events)
        }
        catch(err) {
            console.log(err)
            return res.sendStatus(code.SERVER_ERROR)
        }
});

// put:schedule/detail[details]
router.put('/detail', async (req, res) => {
    let detail = req.body
    try {
        rows = (await db.query('SELECT id FROM attendance WHERE event_id = $1 AND player_id = $2', [detail.eventId, detail.playerId])).rows

        if (rows.length > 0) {
            let row = rows[0]
            await db.query("UPDATE attendance SET behavior=$1, state=$2 WHERE id = $3", [detail.behavior, detail.state, row.id])
            console.log('update ' + row.id)
        }
        else {
            await db.query("INSERT INTO attendance(event_id, player_id, behavior, state) VALUES($1, $2, $3, $4)",
                [detail.eventId, detail.playerId, detail.behavior, detail.state])
            console.log('insert')
        }
        return res.sendStatus(200)
    }
    catch (err) {
        console.log(err)
        return res.sendStatus(code.SERVER_ERROR)
    }
})

// put:schedule/details[details]
router.put('/details', async (req, res) => {
    let details = req.body

    for (const i in details) {
        
        let detail = details[i]
        console.log(`${detail.playerId}:${detail.eventId}`)

        try {

            rows = (await db.query('SELECT id FROM attendance WHERE event_id = $1 AND player_id = $2', [detail.eventId, detail.playerId])).rows

            if (rows.length > 0) {
                let row = rows[0]
                await db.query("UPDATE attendance SET behavior=$1, state=$2 WHERE id = $3", [detail.behavior, detail.state, row.id])
                console.log('update ' + row.id)
            }
            else {
                await db.query("INSERT INTO attendance(event_id, player_id, behavior, state) VALUES($1, $2, $3, $4)",
                    [detail.eventId, detail.playerId, detail.behavior, detail.state])
                console.log('insert')
            }
        }
        catch (err) {
            console.log(err)
            return res.sendStatus(code.SERVER_ERROR)
        }
    }
    res.sendStatus(200)
});

// post:schedule[schedule]
router.post('/:team_id', async (req, res) => {
    let token = req.header("Authorization")
    let teamId = req.params.team_id
    let schedule = req.body

    try {
        let rows = (await db.query("SELECT id FROM profiles WHERE token = $1;", [token])).rows
        if (rows.length == 0) {
            return res.sendStatus(code.UNAUTHORIZED)
        }
        let trainerId = rows[0].id

        await db.query("INSERT INTO events(name, team_id, trainer_id, date, timeStart, timeEnd, type, description) values($1, $2, $3, $4, $5, $6, $7, $8)",
            [schedule.name, teamId, trainerId, util.dateToString(schedule.date), util.timeToString(schedule.time.start), util.timeToString(schedule.time.end), schedule.type, schedule.description])
        res.sendStatus(200)
    }
    catch(err) {
        console.log(err)
        res.sendStatus(code.SERVER_ERROR)
    }
});

// put:schedule:id[schedule]
router.put('/:id', async (req, res) => {
    let id = req.params.id
    let schedule = req.body

    try {
        await db.query("UPDATE events SET name=$1, team_id=$2, date=$3, timeStart=$4, timeEnd=$5, type=$6, description=$7 where id = $8",
            [schedule.name, schedule.teamId, util.dateToString(schedule.date), util.timeToString(schedule.time.start), util.timeToString(schedule.time.end), schedule.type, schedule.description, id])
        res.sendStatus(200)
    }
    catch(err) {
        console.log(err)
        res.sendStatus(code.SERVER_ERROR)
    }
});

// delete:schedule:id
router.delete('/:id', async (req, res) => {
    let id = req.params.id
    try {
        await db.query("DELETE FROM events where id=$1", [id])
        res.sendStatus(200)
    }
    catch(err) {
        console.log(err)
        res.sendStatus(code.SERVER_ERROR)
    }
});

module.exports = router;