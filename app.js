require('dotenv').config();

const { App, LogLevel } = require('@slack/bolt');
const { google } = require('googleapis');
const customSearch = google.customsearch('v1');

const app = new App({
    logLevel: LogLevel.DEBUG,
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    appToken: process.env.SLACK_APP_TOKEN,
    socketMode: true,
});

app.message(/^jpi\s(.+)/, async ({ context, say }) => {
    const keyword = context.matches[1];

    const result = await customSearch.cse.list({
        auth: process.env.GOOGLE_API_KEY,
        cx: process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID,
        q: keyword,
        searchType: 'image',
        safe: 'high',
    });
    const urls = result.data.items.map(item => item.link).filter(link => !link.match(/(ameba|fc2|pbs)/));

    if (urls.length == 0) {
        await say('そんな画像はないパカ');
    } else {
        await say({
            text: keyword,
            blocks: [{
                "type": "image",
                "title": {
                    "type": "plain_text",
                    "text": keyword,
                },
                "image_url": urls[Math.floor(Math.random() * urls.length)],
                "alt_text": keyword,
            }],
            link_names: false
        });
    }
});

(async () => {
    await app.start(process.env.PORT || 3000);
    console.log('Bolt app is running');
})();

