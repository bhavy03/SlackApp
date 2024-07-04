const { App } = require("@slack/bolt");
const signingSecret = process.env.SLACK_SIGNING_SECRET;
const botToken = process.env.SLACK_BOT_TOKEN;
const appToken = process.env.APP_TOKEN;

const app = new App({
  signingSecret: `${signingSecret}`,
  token: `${botToken}`,
  socketMode: true, // enable to use socket mode
  appToken: `${appToken}`,
});

(async () => {
  await app.start(process.env.PORT || 12000);
  app.message("hey", async ({ command, say }) => {
    try {
      say("Hello Human!");
    } catch (error) {
      console.log("err");
      console.error(error);
    }
  });
  app.shortcut("new_id", async ({ shortcut, ack, client }) => {
    await ack();
    try {
      await client.views.open({
        trigger_id: shortcut.trigger_id,
        view: {
          type: "modal",
          callback_id: "modal_view",
          title: {
            type: "plain_text",
            text: "InternBit Assignment",
            emoji: true,
          },
          submit: {
            type: "plain_text",
            text: "Submit",
            emoji: true,
          },
          close: {
            type: "plain_text",
            text: "Cancel",
            emoji: true,
          },
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "Select a user",
              },
              accessory: {
                type: "users_select",
                placeholder: {
                  type: "plain_text",
                  text: "Select a user",
                  emoji: true,
                },
                action_id: "users_select-action",
              },
            },
            {
              type: "input",
              element: {
                type: "rich_text_input",
                action_id: "rich_text_input-action",
              },
              label: {
                type: "plain_text",
                text: "Message",
                emoji: true,
              },
            },
          ],
        },
      });
    } catch (error) {
      console.log("err");
      console.error(error);
    }
  });
  app.view("modal_view", async ({ ack, body, view, client }) => {
    await ack();

    // Extract the user and message from the view state
    const userBlock = view.state.values["H5UyI"];
    const messageBlock = view.state.values["ey271"];

    const user = userBlock["users_select-action"].selected_user;
    const richTextValue =
      messageBlock["rich_text_input-action"].rich_text_value;

    function parseRichTextValue(richTextValue) {
      let formattedText = "";
      richTextValue.elements.forEach((element) => {
        element.elements.forEach((subElement) => {
          formattedText += formatText(subElement);
        });
      });
      return formattedText;
    }

    function formatText(subElement) {
      let text = subElement.text;
      if (subElement.style) {
        if (subElement.style.bold) {
          text = `*${text}*`;
        }
        if (subElement.style.italic) {
          text = `_${text}_`;
        }
        if (subElement.style.strikethrough) {
          text = `~${text}~`;
        }
      }
      if (subElement.type === "link") {
        text = `${subElement.url}`;
      }
      return text;
    }
    const message = parseRichTextValue(richTextValue);

    // Send a message to the selected user
    try {
      await client.chat.postMessage({
        channel: user,
        text: message,
      });
      console.log(`Message sent to user ${user}`);
    } catch (error) {
      console.error("Error sending message to user:", error);
    }
  });
  console.log(`⚡️ Bolt app is running!`);
})();
