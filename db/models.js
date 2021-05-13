const util = require('../util')

const Token = (values) => {
    return {
        'token': values.token,
        'role': values.role
    }
}

const Details = (values) => {
    return {
        'id': (values.id == null ? '-1' : values.id),
        'eventId': values.event_id,
        'playerId': values.prof_id,
        'name': values.name,
        'photoUrl': values.photourl,
        'behavior': values.behavior ? values.behavior : 'NONE',
        'state': values.state ? values.state : 'NONE'
    }
}

const Attendance = (values) => {
    return 
}

const Schedule = (values) => {
    console.log(values)
    return {
        'id': values.id,
        'teamId': values.team_id,
        'teamName': values.teamname,
        'description': values.description,
        'name': values.name,
        'trainers': values.trainers,
        'date': util.parseDate(values.date),
        'time': {
            'start': util.parseTime(values.timestart),
            'end': util.parseTime(values.timeend)
        },
        'attendance': values.state ? values.state : 'NONE',
        'behavior': values.behavior ? values.behavior : 'NONE', 
        'type': values.type
    }
}

const Event = (values) => {
    console.log(values)
    return {
        id: values.id,
        eventId: values.event_id,
        playerId: values.prof_id,
        name: values.name,
        photoUrl: values.photourl,
        behavior: values.behavior ? values.behavior : 'NONE',
        state: values.state ? values.state : 'NONE'
    }
}

const Profile = (values) => {
    return {
        'id': values.id,
        'name': values.name,
        'birthDay': util.parseDate(values.birthday),
        'gender': values.gender,
        'phoneNumber': values.phonenumber.toString(),
        'emailAddress': values.emailaddress,
        'photoUrl': values.photourl,
        'team': values.team,
        'teamId': values.teamid
    }
}

const Person = (values, team) => {
    return {
        'id': values.id,
        'name': values.name,
        'phone': values.phonenumber,
        'email': values.emailaddress,
        'photoUrl': values.photourl,
        'role': values.role,
        'teamName': values.teamname,
        'marked': false
    }
}

const User = (values) => {
    return {
        'id': values.id,
        'name': values.name,
        'phone': values.phonenumber,
        'email': values.emailaddress,
        'photoUrl': values.photourl,
        'role': values.role,
        'teamName': values.teamname,
        'username': values.username,
        'password': values.password
    }
}

const Contacts = (values) => {
    return {
        'email': values.email,
        'phone': values.phone.toString(),
        'description': values.description
    }
}

const Team = (values) => {
    return {
        'id': values.id,
        'code': values.code,
        'name': values.name,
        'activity': values.activity
    }
}

const emptyToken = {'token': '', 'role': 'NONE'}

module.exports = {
    'Token': Token,
    'Profile': Profile,
    'Person': Person,
    'Team': Team,
    'Schedule': Schedule,
    'Details': Details,
    'Contacts': Contacts,
    'Event': Event,
    'User': User,
    'emptyToken': emptyToken
}
