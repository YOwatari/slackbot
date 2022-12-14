import type {App} from "@slack/bolt";
import {noBotMessages} from "../misc";

export function listen(app: App, token?: string) {
    app.message(/^!chat\s(.*)/, noBotMessages(), async ({context, say}) => {
        await say("対応停止中: https://github.com/YOwatari/slackbot/issues/12");
    });
}
