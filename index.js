
const Nexmo = require('nexmo');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Hardcoded credentials
const nexmo = new Nexmo({
  apiKey: 'API_KEY',
  apiSecret: 'API_SECRET_KEY',
  applicationId: 'APLICATION_ID',
  privateKey: './private.key'
});

var message;
var callMessage;
var SMSmessage;
var callerId;
const senderNumber = '17773334545' //My phone
const virtualNumber = '18174061118'; 
var numbers = ['13331232233']; //Array of verified friends phones 
 
const server = app.listen(3000, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});

// HTTP POST route to handle the SMS requests
app.post('/inbound', (req, res) => {
  handleInboundSMS(req.body, res);
});

// HTTP POST route to handle the call responses
app.post('/event', (req, res) =>{
	console.log('Received response from the user', req.body);
	handleCallInput(req.body,res);
	res.sendStatus(200);
});

function handleInboundSMS(params, res) {
  if (!params.to || !params.msisdn) {
    console.log('This is not a valid inbound SMS message!');
  } else {
  	//Function variables
  	var fromNumber = params.msisdn;
  	message = params.text;
  	//JSON response showed at the server web interface
    let incomingData = {
      messageId: params.messageId,
      from: fromNumber,
      text: message,
      type: params.type,
      timestamp: params['message-timestamp']
    };
    if (fromNumber == senderNumber){
    	//if the inbound is the initial sender, forward the message to everyone else in the group
    	SMSmessage = message + ' Please respond with Yes or No if you can join me!';
    	numbers.forEach(function(number){
    		nexmo.message.sendSms(virtualNumber, number, SMSmessage);
    		callGroup(number);
  			console.log("Forwarding initial message to: " + number);
		});
    } else{
    	//If the inbound is not from the initial sender, it is a response from a previous group message, so we have to forward the response to the sender
    	nexmo.message.sendSms(virtualNumber, senderNumber, 'The number ' + fromNumber + ' has sent the following response: ' + message);
    	console.log("Forwarding response to sender");
    }
    res.send(incomingData);
  }
  res.status(200).end();
}

function handleCallInput(params,res){
	//JSON response showed at the server web interface
    let inputData = {
      inputResponse: params.dtmf,
      timestamp: params.timestamp
    };
    // Text back to the sender the response from each one
    if( params.dtmf.charAt(0) == '1'){
    	nexmo.message.sendSms(virtualNumber, senderNumber, 'The number ' + callerId + ' can join you.');
    } else if (params.dtmf.charAt(0) == '2'){
    	nexmo.message.sendSms(virtualNumber, senderNumber, 'The number ' + callerId + ' cannot join you.');
    } else{
    	nexmo.message.sendSms(virtualNumber, senderNumber, 'The number ' + callerId + ' did not send a response.');
    }
}

//Dial your friend's phone numbers
function callGroup(number){
	callMessage = message + ' Press 1 to confirm you can join me, or press 2 if you cannot join me';
	nexmo.calls.create({
		to: [{
			type: 'phone',
			number: number
		}],
		from: {
			type: 'phone',
			number: virtualNumber
			},
		answer_url: ['http://20c7dfb5.ngrok.io/answer'] //Change this if the local server is rebooted to the corresponding URL
	});
	console.log("Calling to number: " + number);
}

//Application GET method to read the Join me message
app.get('/answer', function (req, res) {
	console.log('The request from the /answer is: ' + req.query.to);
	callerId = req.query.to;
	const ncco = [
	{
		action: 'talk',
		voiceName: 'Jennifer',
		text: callMessage,
		bargeIn: true
	},
	{
		action:'input',
		timeOut: 5,
		eventUrl: ['http://20c7dfb5.ngrok.io/event'] //Change this if the local server is rebooted to the corresponding URL
	}
	];
	res.json(ncco);
});

