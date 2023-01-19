const { Telegraf } = require("telegraf");

const bot = new Telegraf("BOT TOKEN");

module.exports = {
    bot
}

bot.launch();
