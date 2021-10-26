require('dotenv').config();

const { App } = require('@slack/bolt');

const app = new App({
    logLevel: 'debug',
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    appToken: process.env.SLACK_APP_TOKEN,
    socketMode: true,
});

app.message('hello', async ({ message, say }) => {
    await say(`Hey thre <@${message.user}>!`);
});

(async () => {
    await app.start(process.env.PORT || 3000);
    console.log('Bolt app is running');
})();

