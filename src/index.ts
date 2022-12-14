import slack from "@slack/bolt";
const { App, LogLevel } = slack;

import { listen as jpi } from "./message/jpi.js";
import { listen as erande } from "./message/erande.js";
import { listen as chat } from "./message/chat.js";

const app = new App({
    logLevel: LogLevel.DEBUG,
    token: process.env["SLACK_BOT_TOKEN"],
    signingSecret: process.env["SLACK_SIGNING_SECRET"],
    appToken: process.env["SLACK_APP_TOKEN"],
    socketMode: true,
});

jpi(
    app,
    process.env["GOOGLE_API_KEY"],
    process.env["GOOGLE_CUSTOM_SEARCH_ENGINE_ID"]
);
erande(app);
chat(app, process.env["CHATGPT_SESSION_TOKEN"]);

(async () => {
    await app.start(Number(process.env["PORT"]) || 3000);
    console.log("Bolt app is running");
})();
