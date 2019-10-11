### How to Create a Slack bot using BotKit


- install Node.js 
- install npm 
- clone this repository
- have [ngrok - secure introspectable tunnels to localhost](https://ngrok.com/) on your computer so you can run it from your command line


The `package.json` contains 

* botkit
* express 
* dotenv 
* body-parser 
* request

### How To

1. `npm install`
2. `node index.js`
* index.js is a simple Hello World bot

The bot will spin up a server on `port 3000`


#### You will have to configure the .env (dotenv) with the slack app. 

goto [Slack API: Applications \| Slack](https://api.slack.com/apps)
1. Create new Bot 
2. Add the bot to your workspace
3. Most of the credentials are in `Basic Information` tab

- open the `.env` file. And add your bots creds to the file. This gives your local bot permission to be the backend to your slack app. 
   - To get the  `SLACK_AUTH_TOKEN` credential you have to first go to the `Bot User` Tab, and add you App as a Bot User. This will allow you access the `Bot User OAuth Access Token` you need In the `Install App` tab. NOTE: This is not the `OAuth Access Token` (I made this mistake)
   


## running ngrok
 `ngrok http 3000`
 
 Which will create a windowed tab (don't close because it will change the randomly generated url)
 and get the https forward URL it gives you 
 
 ```
 Forwarding https://570c44b0.ngrok.io -> http://localhost:3000
 ```        
This is the new URL where you will be able to access your server on port 3000 from outside sources. 

 * Then, Create a new `slash command` in the slack bot interface [Slack API: Applications \| Slack](https://api.slack.com/apps) with the `ngrok https endpoint` as the `Request URL`. 
      * Everytime you try to complete that slash command on slack, it will automatically hit that URL.This also means you have to update the `Request URL` field on the slackbot interface every time you restart ngrok. :( 


## Test 
- try running the command in slack.

## Debugging 
- If it doesn't work you can look in 2 places for debug info 
  1. ngrok. Will tell you if everything is correcly connecting
  2. your running bot server. If you are getting connection here, failures are likely in the bot code. 


 
 
 
 


