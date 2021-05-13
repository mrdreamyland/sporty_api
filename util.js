const crypto = require('crypto-js')

const generateToken = (username, password) => {
    return crypto.SHA256(username + password).toString()
}

const parseTime = (string) => {
    let arr = string.split(':')
    let hours = parseInt(arr[0])
    let minutes = parseInt(arr[1])

    return {'hours': hours, 'minutes': minutes}
}

const parseDate = (string) => {

    let arr = string.split('-')

    let year = parseInt(arr[0])
    let month = parseInt(arr[1])
    let day = parseInt(arr[2])

    return { 'year': year, 'month': month, 'day': day }
}

const timeToString = (value) => {
    let hours = formatNumber(value.hours)
    let minutes = formatNumber(value.minutes)

    return `${hours}:${minutes}`
}

const dateToString = (value) => {
    let day = formatNumber(value.day)
    let month = formatNumber(value.month)
    let year = formatNumber(value.year)
  
    return `${year}-${month}-${day}`
}

const formatDate = (d) => {
    let date = formatNumber(d.getDate())
    let month = formatNumber(d.getMonth() + 1)
    let year = formatNumber(d.getFullYear())

    return `${year}-${month}-${date}`
}

const formatNumber = (number) => {
    return number < 10 ? `0${number}` : number
  }
  
module.exports = {
    'generateToken': generateToken,
    'parseDate': parseDate,
    'parseTime': parseTime,
    'dateToString': dateToString,
    'timeToString': timeToString,
    'formatDate': formatDate
}