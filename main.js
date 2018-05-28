
var fs = require('fs');
var {google} = require('googleapis');
var googleAuth = require('google-auth-library');

var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'calendar-nodejs-quickstart.json';

const googleSecrets = JSON.parse(fs.readFileSync('client_secret.json')).installed;
var oauth2Client = new googleAuth.OAuth2Client(
    googleSecrets.client_id,
    googleSecrets.client_secret,
    googleSecrets.redirect_uris[0]
);

const token = fs.readFileSync(TOKEN_PATH);
oauth2Client.setCredentials(JSON.parse(token));

var calendar = google.calendar('v3');

console.log("Before calender things")

calendar.events.list({
    auth: oauth2Client,
    calendarId: "syedparvez72@gmail.com",
    // timeMin: "2018-05-11T00:00:00.000Z",
    // timeMax: "2018-06-11T23:59:59.000Z"
}, function(err, response) {
    if (err) {
        console.log('The API returned an error: ' + err);
        return;
    }
    var events = response.data.items;
    events.forEach(function(event) {
        var start = event.start.dateTime || event.start.date;
        console.log('%s - %s', start, event.summary);
    });
});