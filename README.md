![coverage](https://gitlab.socs.uoguelph.ca/kubotic/coffeebot/badges/master/coverage.svg?job=test-coverage)
![pipeline](https://gitlab.socs.uoguelph.ca/kubotic/coffeebot/badges/master/pipeline.svg)
![Code style: airbnb](https://img.shields.io/badge/code%20style-airbnb-blue.svg?style=flat-square)

# CoffeeBot

## API

| Route                      | Slack-Command                               | Done?              |
| -------------------------- | ------------------------------------------- | ------------------ |
| `/preference/save`         | `/save-preference [size] [type] [details]`  | :white_check_mark: |
| `/preferences/get`         | `/get-preference @[username]`               | :white_check_mark: |
| `/order-:order_id`         |                                             | :no_good:          |
| `/order/create`            | `/who-wants-coffee`                         | :white_check_mark: |
| `/order-:order_id/respond` |                                             | :no_good:          |
| `/orders/display`          | `/display-orders`                           | :white_check_mark: |
| `/order/history`           |                                             | :no_good:          |
| `/order/history/:user_id`  |                                             | :no_good:          |
| `/shop/save`               | `/save-shop [name] OR [name], [location]`   | :white_check_mark: |
| `/shop/delete`             | `/delete-shop [name] OR [name], [location]` | :white_check_mark: |
| `/shop/all`                | `/display-all-shops`                        | :white_check_mark: |

---

## Scopes

Add these scopes to your bot. (Under permissions)

- `bot`
- `commands`
- `channels:history`
- `im:history`
- `mpim:history`
- `users:read`

## Testing

- Run `npm install --dev`
- Run `npm run tests`

Also:

- Try running the command in slack.

#### View Test Coverage

```bash
npm run coverage
```

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

### Docker
```
docker-compose up
```

#### You will have to configure the .env (dotenv) with the slack app. 

goto [Slack API: Applications \| Slack](https://api.slack.com/apps)
1. Create new Bot 
2. Add the bot to your workspace
3. Most of the credentials are in `Basic Information` tab

- create a file named `.env` and copy the contents of `.env_example` to this file. And add your bots creds to the file. This gives your local bot permission to be the backend to your slack app. 
   - To get the  `SLACK_AUTH_TOKEN` credential you have to first go to the `Bot User` Tab, and add you App as a Bot User. This will allow you access the `Bot User OAuth Access Token` you need In the `Install App` tab. NOTE: This is not the `OAuth Access Token` (I made this mistake)
   - You will also need to set the `SLACK_OAUTH_ACCESS_TOKEN` credential -- this is the `OAuth Access Token` found above `Bot User OAuth Access Token`
   


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

## Debugging 
- If it doesn't work you can look in 2 places for debug info 
  1. ngrok. Will tell you if everything is correcly connecting
  2. your running bot server. If you are getting connection here, failures are likely in the bot code. 

## Running the SQL setup script
Ensure **SQLite3** is installed.

`npm run setup`

This will generate a database.db file which is populated with empty tables with the coffee bot's schema.

## Adding Slack OAuth Scopes to a Bot User
1. Go to [Slack API: Applications \| Slack](https://api.slack.com/apps) and navigate to OAuth & Permissions
2. Ensure all of the following OAuth scopes have been added to your bot user:
   - bot
   - commands
   - channels:history
   - groups:history
   - im:history
   - mpim:history
   - users:read