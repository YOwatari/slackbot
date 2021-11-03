import type {App} from "@slack/bolt";
import {noBotMessages} from "../misc";
import {google} from "googleapis";

const cs = google.customsearch('v1');

export function listen(app: App, key?: string, engine?: string) {
    app.message(/^jpi\s(.*)/, noBotMessages(), async ({context, say}) => {
       const keyword = context["matches"][1];

       const result = await cs.cse.list({
           auth: key,
           cx: engine,
           q: keyword,
           searchType: "image",
           safe: 'high',
       });
        const urls: string[] = result.data.items?.map(item => item.link).filter(link => !link?.match(/ameba|fc2|pbs/)) as string[];

       if (urls.length === 0) {
           await say('そんな画像はないパカ');
       } else {
           await say({
               text: keyword,
               blocks: [{
                   type: "image",
                   title: {
                       type: "plain_text",
                       text: keyword,
                   },
                   image_url: urls[Math.floor(Math.random() * urls.length)],
                   alt_text: keyword,
               }],
               link_names: false
           });
       }
    });
}
