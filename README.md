# webRTC_Challenge
Small application build as a technical test for WebRTC.ventures company

## Application description

In this application, a phone number sends a customizable SMS to a Nexmo virtual number, which forward this message to other phone numbers that are indicated previously in the app.js file. The Nexmo number appends the phrase "Please respond with Yes or No if you can join me!" to the SMS forwarded to the group, and also performs a voice call that reads the message written with the phrase "Press 1 to Confirm you can join me, or press 2 if you cannot join me". 

The user in the group can send an SMS back to the initial sender or press a key for answering, and the original number will receive all the answers in a SMS. Here in this diagram provided by webRT.ventures you can see the sequence diagram:

[Diagram]

## Dependencies installation and previous steps

One important thing is that every phone number that is taking place in this application must be registered and confirmed by the Nexmo platform, which you can do by going to the dashboard in your Nexmo account and adding the phone numbers with the country code in the "#Test numbers" section. 

We also need a publicy accessible web server so Nexmo can make webhook requests to your app. If you're developing locally you must use a tool such as ngrok. Then, we launch this server at the port we want:

[Image of the functional server running]

Then we use npm to install nexmo, the REST API client for Node.js in your working directory:    
                                                
                                                $ npm install nexmo --save
                                              
In our index.js file, we will have to indicate our YOUR_API_KEY and YOUR_API_SECRET in a Nexmo instance. If you don't want to have it hardcoded, you can also set them with the following CLI input in your working directory:
                        
                                                $ nexmo setup api_key api_secret

Lastly, we have to indicate the port we chose for the ngrok server in the index.js file for the application to listen.

## Demostration of the working application
