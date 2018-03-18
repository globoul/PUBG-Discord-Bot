# PUBG Discord Bot

This bot uses [https://pubg.op.gg/](https://pubg.op.gg/) as a means to get a PUBG player's stats.

# Bot Usage
1. Add bot to your server by going to this [url](https://discordapp.com/oauth2/authorize?client_id=417828293019041804&scope=bot&permissions=0).
2. You can now interact with the bot on your server/direct messages by using the default prefix `!pubg-`.
3. I recommend running `!pubg-help` to list all available commands and running `!pubg-help <command-name>` to understand what each command does.
4. When/If you want to set up server defaults (prefix, season, region, mode, squad size) you should run `!pubg-setServerDefaults` with its requried parameters which you can read about by running `!pubg-help setServerDefaults`.

# Developing and Contributing
In order to develop we need a test environment. I'm not sure if this is the preferred way to test a discord bot but I've found it works for me. 

## Create your own Discord Testing Bot
1. Go here [Discord Bot Guide](https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token) and create a new discord bot that you can use on our own personal server for testing.
2. Note this is where you can get your discord bot token.
3. Go ahead and add your bot to your discord server.

## Getting the code
1. Fork this repo and develop in the forked repo. When you're ready to merge into the main repo make a pull request.

## Setting up Heroku
1. Go to [Heroku](https://www.heroku.com/).
2. Create a new Node app.
3. Go to the `Resources` tab and under `Add-ons` install `Heroku Postgres` (this will add a `DATABASE_URL` config under the `Settings` tabs).
4. Go to the `Deploy` tab and link your forked version of this repo.
5. Tell it to automatically deploy and go ahead and manually deploy the app.
6. Go to the `Resources` tab and turn the `web` dyno off and the `worker` dyno on. 
7. On the top right click `More ^` and select `Restart all dynos`.
8. Go to the `Settings` tab and click `Reveal Config Vars`.
9. Add the following key value pairs:
    bot_token=`your discord bot token - refer to above documentation`
    prefix=`!pubg-`
    DATABASE_URL=`this should already exist if not refer to below documentation`

### How to get DATABASE_URL
1. Click the `Resources` tab.
2. Under the `Add-ons` section click `Heroku Postgres:: Database`.
3. On the new page click the `Settings` tab.
4. Click `View Credentials` and the `DATABASE_URL` will be the value of `URI`
