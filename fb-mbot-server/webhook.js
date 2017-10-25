const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const server = app.listen(process.env.PORT || 4446, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});


const request = require('request');
//var createTextVersion = require("textversionjs");
var htmlToText = require('html-to-text');

var options = {
                mimetypes: {
                        json: ["application/json", "application/my-custom-content-type-for-json;charset=utf-8"]
                        
                    }
                };
var Client = require('node-rest-client').Client; 
var client = new Client(options);


/* For Facebook Validation */
app.get('/webhook', (req, res) => {
  console.log("hello");
  if (req.query['hub.mode'] && req.query['hub.verify_token'] === 'raita_honolulu') {
    res.status(200).send(req.query['hub.challenge']);
  } else {
    res.status(403).end();
  }
});

/* Handling all messenges */
app.post('/webhook', (req, res) => {
  console.log(req.body);
  if (req.body.object === 'page') {
    req.body.entry.forEach((entry) => {
      entry.messaging.forEach((event) => {
        if (event.message && event.message.text) {
           url = 'http://210.4.73.237:4444/question-with-answers/?url=https://stackoverflow.com/questions/13890935/does-pythons-time-time-return-the-local-or-utc-timestamp';
           /*
           client.get(url, function (data, response) {
               // parsed response body as js object 
               console.log('get data');
               console.log(data);
               // raw response 
               //console.log(response);
               sendMessage(event,data);
           });
           */
           request({
             url: url,
             json: true
           }, function (error, response, data) {
               console.log(error);
               console.log(response.statusCode);
               if (!error && response.statusCode === 200) {
                   //console.log(body) // Print the json response
                   //var result = data["answer_count"];
                   //console.log(result);
                   for (x in data.answers){
                       //answerBody = createTextVersion(data.answers[x]["body"]);
                       answerBody = htmlToText.fromString(data.answers[x]["body"]);
                       answerBody = textCutter(answerBody, 545);
                       answerBody = answerBody+ "..." + "\n"+"Details: "+"https://stackoverflow.com/a/"+data.answers[x]["answer_id"];
                       answerBody = answerBody+"\n"+"Answer Acceptance Probability:"+data.answers[x]["acceptance_probability"]+"%";
                       console.log(answerBody);
                       sendMessage(event, answerBody);
                   }
                   //sendMessage(event, result);
               }
           }); 
          //sendMessage(event);
        }
      });
    });
    res.status(200).end();
  }
});

//const request = require('request');
function sendMessage(event, data) {
  let sender = event.sender.id;
  //let text = event.message.text;
  let text = data;

  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token: 'EAACAMNDM9jQBAJBkci3UBzFNvN65C3uPp4GKN44Ehh9Hhhvz0YLtRtXyMloyFG54divICZB8MaEfOsRNd2PMi4bXhIASXPtVll5dTkygc3DZAJLA3eJxI3WsKiHzZBiBKeDN7QOpO7GKHXTZBBDWYZBIFDjkSeLMoBlJg8uCEBgZDZD'},
    method: 'POST',
    json: {
      recipient: {id: sender},
      message: {text: text}
    }
  }, function (error, response) {
    if (error) {
        console.log('Error sending message: ', error);
    } else if (response.body.error) {
        console.log('Error: ', response.body.error);
    }
  });
}

function textCutter(text, n) {
   var short = text.substr(0, n);
   if (/^\S/.test(text.substr(n)))
       return short.replace(/\s+\S*$/, "");
   return short;
}

function isUrl(s) {
   var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
   return regexp.test(s);
}
