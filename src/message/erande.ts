import {type App, directMention} from "@slack/bolt";

export function listen (app: App) {
    app.message(/選んで\s(.+)/, directMention(), async ({ context, say }) => {
        const items = context["matches"][1].split(/\s/);
        await say(`${items[Math.floor(Math.random()*items.length)]} を選んであげたパカ`);
    });
}
