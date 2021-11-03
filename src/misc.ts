import type {Middleware, SlackEventMiddlewareArgs} from "@slack/bolt";

export function noBotMessages(): Middleware<SlackEventMiddlewareArgs<'message'>> {
    return async ({message, next}) => {
        if (next === undefined) {
            return;
        }

        if (!message.subtype || message.subtype != "bot_message") {
            await next();
        }
    };
}
