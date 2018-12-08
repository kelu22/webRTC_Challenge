# webRTC_Challenge
Small application build as a technical test for WebRTC.ventures company

## Application description

In this application, a phone number sends a customizable SMS to a Nexmo virtual number, which forward this message to other phone numbers that are indicated previously in the app.js file. The Nexmo number appends the phrase "Please respond with Yes or No if you can join me!" to the SMS forwarded to the group, and also performs a voice call that reads the message written with the phrase "Press 1 to Confirm you can join me, or press 2 if you cannot join me". 

The user in the group can send an SMS back to the initial sender or press a key for answering, and the original number will receive all the answers in a SMS. Here in this diagram provided by webRT.ventures you can see the sequence diagram:

<p align="center">
<img width="631" alt="screen shot 2018-12-07 at 4 09 55 pm" src="https://user-images.githubusercontent.com/6637058/49675706-6e481680-fa3c-11e8-8c6f-9cc9b724137a.png">
</p>

## Dependencies installation and previous steps

One important thing is that every phone number that is taking place in this application must be registered and confirmed by the Nexmo platform, which you can do by going to the dashboard in your Nexmo account and adding the phone numbers with the country code in the "#Test numbers" section. 

We also need a publicy accessible web server so Nexmo can make webhook requests to your app. If you're developing locally you must use a tool such as ngrok. Then, we launch this server at the port we want:

<p align="center">
<img width="567" alt="screen shot 2018-12-07 at 4 24 32 pm" src="https://user-images.githubusercontent.com/6637058/49675761-9d5e8800-fa3c-11e8-9e84-b9bd2adc0741.png">
</p>

Then we use npm to install nexmo, the REST API client for Node.js in your working directory:    
                                                
                                                $ npm install nexmo --save
                                              
In our index.js file, we will have to indicate our YOUR_API_KEY and YOUR_API_SECRET in a Nexmo instance. If you don't want to have it hardcoded, you can also set them with the following CLI input in your working directory:
                        
                                                $ nexmo setup api_key api_secret

Lastly, we have to indicate the port we chose for the ngrok server in the index.js file for the application to listen.

## How the application works

We launch our local server and make our NodeJS application listen on that port so we can intercept all the inbound and outbound connections that are passing through. We have indicated in the *numbers* array which are the phone numbers that have acccess to the Nexmo services, and we have written our original sender number and the virtual number that we have registered in Nexmo.

The original number sends a SMS and the server routes this inbound message at the /inbound route, so we handle this SMS according to which is the number that appears in the *from* field in the JSON exchanged in the HTTP transaction. If the sender is the original number, we have to append the phrase *Please respond with Yes or No if you can join me!* and forward this message to all numbers in the group. The Nexmo's SMS API can only accept one message per request, so we need to keep connection alive and reuse the API request of each of the destination numbers. The members of the groups receive the SMS and send their response, so it is routed through the /inbound route again, but this time the *from* field is not the orginal number, so we forward the SMS message only to the first sender.

The members of the groups are also going to receive a call at the same time, handled by the /answer route that reads the message and forward the input back to the server. Each of the calls' responses are routed as individual events to the *handleCallInput* method, and depending of which is the input of the user we send a SMS answer back to the sender number. We only take the first number that the user has pressed to prevent errors.If the input is incorrect or it does not exist, we send a SMS saying that we don't have a response for that number.
