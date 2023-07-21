const { CloudEvent, HTTP } = require('cloudevents');
const {Translate} = require('@google-cloud/translate').v2;

let languages =
  ['🇺🇦', 'uk', '🇯🇵', 'ja', '🇵🇱', 'pl', '🇨🇿', 'cs', '🇸🇰', 'sk',
   '🇮🇹', 'it', '🇺🇸', 'en', '🇩🇪', 'de', '🇨🇦', 'fr', '🇮🇪', 'ga',
   '🇹🇷', 'tr', '🇬🇷', 'el', '🇮🇳', 'hi'];


async function handle(context, event) {

  // Extract tweet from cloud event
  let tweet = event.data;

  // Pick a random language
  let idx = Math.floor(Math.random() * (languages.length / 2));

  // Call Google Translation API
  const translate = new Translate({projectId: process.env.GOOGLE_PROJECT_ID});
  let [translation] =  await translate.translate(tweet.text, languages[idx * 2 + 1]);

  // Generate response text
  let text = `🐣 ${tweet.text}
  
${languages[idx * 2]} ${translation}
by <https://twitter.com/${tweet.user.name}/status/${tweet.id}|*${tweet.user.name}*>
`
  console.log(text);

  // Create and return cloud event with the translated text
  return HTTP.binary(new CloudEvent({
        source: 'tweet.translator',
        // Type used for routing the event to the proper sink
        type: 'tweet.translated',
        data: text
  }));
};

module.exports = { handle };
