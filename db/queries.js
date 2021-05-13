const playerSheduleQuery = (prof_id, type, start, end) => {

    let params = [prof_id, start, end]

    let query = "SELECT profiles.id as prof_id, events.id, events.name, events.team_id, events.description, (SELECT code FROM teams WHERE id = events.team_id) as teamName, "
        + "(SELECT name FROM profiles WHERE id = events.trainer_id) as trainers, events.date, events.timeStart, events.timeEnd, "
        + "events.type, attendance.behavior, attendance.state "
        + "FROM profiles INNER JOIN events ON (profiles.team_id = events.team_id) "
        + "LEFT JOIN attendance ON (events.id = attendance.event_id AND profiles.id = attendance.player_id) "
        + "WHERE (profiles.id = ($1::INTEGER) AND date >= $2 AND date <= $3 ";
    query += (type === 'ALL') ? ")" : "AND type = $4)"
    query += " ORDER BY events.date ASC"

    if (type !== 'ALL') params.push(type)

    return {'sql': query, 'params': params}
}

const trainerSheduleQuery = (prof_id, type, start, end) => {

    let params = [prof_id, start, end]

    let query = "SELECT events.id, events.name, events.team_id, events.description, (SELECT code FROM teams WHERE id = events.team_id) as teamName, "
        + "(SELECT name FROM profiles WHERE id = events.trainer_id) as trainers, events.date, events.timeStart, events.timeEnd, events.type "
        + "FROM profiles INNER JOIN events ON (profiles.id = events.trainer_id) "
        + "WHERE (events.trainer_id = $1 AND date >= $2 AND date <= $3 "
        query += (type === 'ALL') ? ")" : "AND type = $4)"
        query += " ORDER BY events.date ASC;"
    
    if (type !== 'ALL') params.push(type)

    return {'sql': query, 'params': params}
}

const teamSheduleQuery = (team_id, type, start, end) => {

    let params = [team_id, start, end]

    let query = "SELECT events.id, events.team_id, events.name, teams.name as teamName, events.description, (SELECT name FROM profiles WHERE id = events.trainer_id) as trainers, events.date, events.timeStart, events.timeEnd, events.type "
            + "FROM teams INNER JOIN events ON (teams.id = events.team_id) "
            + "WHERE (events.team_id = $1 AND date >= $2 AND date <= $3 "
            query += (type === 'ALL') ? ")" : "AND type = $4)"
            query += " ORDER BY events.date ASC"
    
    if (type !== 'ALL') params.push(type)

    return {'sql': query, 'params': params}
}

const schedule = {
    'player': playerSheduleQuery,
    'trainer': trainerSheduleQuery,
    'team': teamSheduleQuery
}

module.exports = {
    'schedule': schedule
}