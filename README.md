# slackbot

* `!jpi {keyword}`
  * Searches for images corresponding to `{keyword}` using Google Image Search. The bot then posts a randomly selected image from the results to the chat.
* `!chat {prompt}`
  * The bot interacts with an AI model from OpenAI, using `{prompt}` as the input. The response from the AI model is then posted in the chat.
* `@jpi 選んで {item1} {item2} {item3} ...`
  * The bot randomly selects one item from a list provided by the user. The list of items should follow the `選んで` command and be separated by spaces.

## install to your workspace

<a href="https://slack.com/oauth/v2/authorize?client_id=2152158731.4457138150866&scope=chat:write,chat:write.public,channels:history&user_scope="><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" /></a>
