const express = require('express')
const bodyParser = require('body-parser')

const account = require('./routes/account')
const profile = require('./routes/profile')
const trainer = require('./routes/trainer')
const team = require('./routes/team')
const player = require('./routes/player')
const parent = require('./routes/parent')
const schedule = require('./routes/schedule')
const club = require('./routes/club')

const app = express()
const port = process.env.PORT || 5000

app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send('Sporty App backend')
})

app.use('/', account)
app.use('/profile', profile)
app.use('/trainer', trainer)
app.use('/team', team)
app.use('/player', player)
app.use('/parent', parent)
app.use('/schedule', schedule)
app.use('/club', club)

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`)
})
