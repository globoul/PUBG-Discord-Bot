In order to develop we need a test environment. I'm not sure if this is the preferred way to test a discord bot but I've found it works for me.

## Create your own Discord Testing Bot
1. Go here [Discord Bot Guide](https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token) and create a new Discord bot and a bot user that you can use on our own personal Discord server for testing.
2. Note this is where you can get your Discord bot user's token.
3. Go ahead and add your bot to your Discord server.

## Getting the code
1. Fork this repo and develop in the forked repo. When you're ready to merge into the main repo make a pull request.

## Setting up Heroku
1. Go to [Heroku.com](https://www.heroku.com/).
2. Create a new Node app.
3. Go to the `Resources` tab and under `Add-ons` install `Heroku Postgres` (this will add a `DATABASE_URL` config under the `Settings` tabs).
4. Go to the `Deploy` tab and link your forked version of this repo.
5. Tell it to automatically deploy and go ahead and manually deploy the app.
6. Go to the `Resources` tab and turn the `web` dyno off and the `worker` dyno on.
7. On the top right click `More ^` and select `Restart all dynos`.
8. Go to the `Settings` tab and click `Reveal Config Vars`.
9. Add the following key value pairs:
    * bot_token=`<discord bot user's token> - refer to above documentation`
    * prefix=`!pubg-`
    * DATABASE_URL=`<Heroku supplied Database Url> - this should already exist if not refer to below documentation`
10. On the top right click `More ^` and select `Restart all dynos`.
11. If you want to see the progress of your app starting up on the top right click `More ^` and select `View Logs`.


## Install PsSql CLI tools
In order to interact with the postgres database you will need to install the PsSql commandline tools.
1. Follow the [PsSql install guide](https://devcenter.heroku.com/articles/heroku-postgresql#local-setup).

### How to get DATABASE_URL
1. Click the `Resources` tab.
2. Under the `Add-ons` section click `Heroku Postgres:: Database`.
3. On the new page click the `Settings` tab.
4. Click `View Credentials` and the `DATABASE_URL` will be the value of `URI`
