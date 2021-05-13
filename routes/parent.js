const express = require('express');
const db = require('../db/postgresdb')
const code = require('../db/code');
const models = require('../db/models');

const router = express.Router();

// get:/parent/children/{parentId}
router.get('/children/:parent_id', async (req, res) => {

    console.log('> get children')
    let parentId = req.params.parent_id
    
    try {
        let allPlayers = (await db.query("SELECT * from profiles where role = 'PLAYER';")).rows
        let children = (await db.query("SELECT profiles.id FROM profiles INNER JOIN children ON profiles.id = children.child_id WHERE children.parent_id = $1", [parentId])).rows

        let profiles = allPlayers.map((player) => {
            let profile = models.Person(player)
            let child = children.find((child) => child.id === player.id)

            profile.marked = child != undefined

            return profile;
        })

         return res.json(profiles)
    }
    catch(err) {
        console.log(err)
        return res.sendStatus(code.SERVER_ERROR)
    }
});

// delete:parent/child[parent_id, player_id]
router.delete('/child', async (req, res) => {

    let parentId = req.query.parent_id
    let childId = req.query.child_id

    console.log(`unbind ${childId} to ${parentId}`)

    try {
        await db.query("DELETE FROM children WHERE (parent_id = $1 AND child_id = $2)", [parentId, childId])
        return res.sendStatus(200)
    }
    catch(err) {
        console.log(err)
        return res.sendStatus(code.SERVER_ERROR)
    }
})


// put:parent/child[parent_id, player_id]
router.put('/child', async (req, res) => {
    console.log('> change player team')

    let parentId = req.query.parent_id
    let childId = req.query.child_id

    console.log(`bind ${childId} to ${parentId}`)

    try {
        let rows = (await db.query("SELECT * FROM children WHERE (parent_id = $1 AND child_id = $2)", [parentId, childId])).rows
        if (rows.length > 0) {
            // binding already exists
            return res.sendStatus(202)
        }
        await db.query('INSERT INTO children(parent_id, child_id) values($1, $2)', [parentId, childId])

        return res.sendStatus(200)
    }
    catch(err) {
        return res.sendStatus(code.SERVER_ERROR)
    }
});

module.exports = router;
