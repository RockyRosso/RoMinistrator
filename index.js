//-- Variables

require('dotenv').config();
const token = process.env.BOT_TOKEN;

const bot = require('./src/bot');

//--

//-- Init bot

const client = new bot(token);
client.connect();

//--
