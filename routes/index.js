var express = require('express');
var router = express.Router();

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

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//get Events details from the calender
router.get('/getEvents',function (req, res, next) {
   connectToCalendar().then((result)=>{
     console.log(result+" +++++++++++++++++");
     res.send(result);
   });
});

//Post events to the google calendar
router.get('/postEvents/:username/:phoneNumber/:company/:email/:startDate', function(req, res, next){
    let details = {
        username : req.params.username,
        phoneNumber : req.params.phoneNumber,
        company : req.params.company,
        email: req.params.email,
        startDate:req.params.startDate
    }
    console.log(details)
    createNewEvent(details).then(result=>{
        console.log(result);
        res.send(result)
    }).catch(err=>{
        console(err);
        res.send(err);
    })
})

let connectToCalendar = function(){
  return new Promise(resolve => {
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
              let obj={
                event_date : start,
                event_name : event.summary
              };
              resolve({
                  success:true,
                  value:events
              })
          });
      });


  })
}

//creating a new event
let createNewEvent = (details)=>{
    return new Promise(resolve => {
        console.log(details);
        // Refer to the Node.js quickstart on how to setup the environment:
// https://developers.google.com/calendar/quickstart/node
// Change the scope to 'https://www.googleapis.com/auth/calendar' and delete any
// stored credentials.

        var event = {
            'summary': 'Meeting with '+details.username+' company '+details.company,
            'location': details.company,
            'description': 'Provide a Demo on YM BOt.',
            'start': {
                'dateTime': details.startDate+'T09:00:00-07:00',
                'timeZone': 'Asia/Calcutta',
            },
            'end': {
                'dateTime': details.startDate+'T17:00:00-07:00',
                'timeZone': 'Asia/Calcutta',
            },
            'recurrence': [
                'RRULE:FREQ=DAILY;COUNT=2'
            ],
            'attendees': [
                {'email': details.email},
            ],
            'reminders': {
                'useDefault': true,
                // 'overrides': [
                //     {'method': 'email', 'minutes': 24 * 60},
                //     {'method': 'popup', 'minutes': 10},
                // ],
            },
        };

        calendar.events.insert({
            auth: oauth2Client,
            calendarId: 'syedparvez72@gmail.com',
            resource: event,
        }, function(err, event) {
            if (err) {
                console.log('There was an error contacting the Calendar service: ' + err);
                return;
            }
            console.log('Event created: %s', event.htmlLink);
            resolve({
                success:true,
                value:event.htmlLink
            });
        });

    })

}
module.exports = router;
