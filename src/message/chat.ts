import type {App} from "@slack/bolt";
import {noBotMessages} from "../misc";
// import {ChatGPTAPI} from "chatgpt";

export function listen(app: App, token?: string) {
    app.message(/^!chat\s(.*)/gm, noBotMessages(), async ({context, say}) => {
        const { ChatGPTAPI } = await import('chatgpt');
        const api = new ChatGPTAPI({
            sessionToken: token as string,
            markdown: true,
        });
        await api.ensureAuth();

        const prompt = context["matches"][1];
        const response = await api.sendMessage(prompt);

        await say(response);
    });
}
