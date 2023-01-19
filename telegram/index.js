const { Telegraf } = require("telegraf");

const bot = new Telegraf("1017117744:AAGCOW4EwiueGTqvLm0BVxhGNuUrU1h1xbQ");

module.exports = {
    bot
}

bot.launch();