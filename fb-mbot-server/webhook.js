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
var sampleQuestionURL = 'https://stackoverflow.com/questions/271526/avoiding-null-statements';

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
                    var msg = event.message.text;
                    if(isUrl(msg)){
                        var url = extractURL(msg);
                        var rootDomainName = extractRootDomain(url);
                        console.log(rootDomainName);
                        rootDomainName = rootDomainName.toLowerCase();
                        if(rootDomainName === 'stackoverflow.com') {
                            sendMessage(event, 'Please wait, RAiTA is processing data to give the best answer for your question. Thanks');
                            url = 'http://210.4.73.237:4444/question-with-answers/?url='+url;
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
                                    //var result = data["answer_count"];
                                    for (x in data.answers) {
                                        //answerBody = createTextVersion(data.answers[x]["body"]);
                                        answerBody = htmlToText.fromString(data.answers[x]["body"]);
                                        answerBody = textCutter(answerBody, 545);
                                        answerBody = answerBody + "..." + "\n" + "Details: " + "https://stackoverflow.com/a/" + data.answers[x]["answer_id"];
                                        answerBody = answerBody + "\n" + "Answer Acceptance Probability:" + data.answers[x]["acceptance_probability"] + "%";
                                        console.log(answerBody);
                                        sendMessage(event, answerBody);
                                    }
                                    sendMessage(event, "Thanks for your patience. These are the all answer of your questions with the acceptance probability.");
                                }
                            });
                        }
                        else{
                            sendMessage(event, "Currently RAiTA supports only StackOverflow's questions. We are working hard, to add new questions answer community site in future updates. So please send any valid StackOverflow questions url. For example, if you want to know, how you can handle the great NULLPointerException, then you can try this question answers"+sampleQuestionURL);
                        }
                    }
                    else{
                        sendMessage(event, "If you want the best answers of any StackOverflow questions then please enter that question web link. For example, if you want to know, how you can handle the great NULLPointerException, then you can try this question: "+sampleQuestionURL);
                    }

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

function isUrl(inputMsg) {
   var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
   return regexp.test(inputMsg);
}

function extractURL(inputMsg) {
    var urlRegex = /(https?:\/\/[^ ]*)/;
    var inputMsg   = inputMsg.match(urlRegex)[1];
    return inputMsg;
}

function extractHostname(url) {
    var hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf("://") > -1) {
        hostname = url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }

    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];

    return hostname;
}

function extractRootDomain(url) {
    var domain = extractHostname(url),
        splitArr = domain.split('.'),
        arrLen = splitArr.length;

    //extracting the root domain here
    //if there is a subdomain
    if (arrLen > 2) {
        domain = splitArr[arrLen - 2] + '.' + splitArr[arrLen - 1];
        //check to see if it's using a Country Code Top Level Domain (ccTLD) (i.e. ".me.uk")
        if (splitArr[arrLen - 1].length == 2 && splitArr[arrLen - 1].length == 2) {
            //this is using a ccTLD
            domain = splitArr[arrLen - 3] + '.' + domain;
        }
    }
    return domain;
}
