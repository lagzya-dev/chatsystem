const express = require("express");
const http = require("http");
const path = require("path")
const fs = require('fs');
const socket = require("socket.io");
const telegram = require("./telegram/index")
const app = express();
const server = http.Server(app);
const io = socket(server);


//let data = JSON.parse(fs.readFile("./data/telegram.json"));
app.set("port", 5000);
app.use("/static/src", express.static(__dirname + "/static/src"));
app.use("/static/media", express.static(__dirname + "/static/media"));

app.get("/", (requst, response) => {
    response.sendFile(path.join(__dirname + "/static", "index.html"))
})
app.get('/style/app.css', function(req, res) {
    res.sendFile(__dirname + "/static/style/" + "app.css");
  });
app.get('/audio/notify.mp3', function(req, res) {
    res.sendFile(__dirname + "/static/audio/" + "notify.mp3");
});
server.listen(5000, () => {
    console.log("Start server")
});

let clients = [];
let count = 1;
let accounts = JSON.parse(fs.readFileSync("accounts.json"));
let message = JSON.parse(fs.readFileSync("messages.json"));
let mutes = [];
let events = [];
let blockedname = ["Admin", "Administrator", "Админ", "Администратор"]
io.on('connection', (socket) => {
    console.log('USER CONNECTED');
    socket.on('auth', function (name, password) {
        console.log("try")
        let exsists = accounts.find(p => p.login === name);
        if(!exsists){
            socket.emit("alert", "Аккаунт не существует")
            return
        }
        if(exsists.password !== password){
            socket.emit("alert", "Пароль не подходит.")
            return
        }
        clients.push(
            {
                'account': exsists,
                'isAdmin': false,
                'socketId': socket.id
            });
        socket.emit("regsec", exsists.login);
        for(let i = 0; i < message.length; i++){
            socket.emit("chat message", message[i])
        }
     });
    socket.on("new", (login) =>{
        console.log(login)
        if(login){
            let exsists = accounts.find(p => p.login === login);
        if(!exsists){
            socket.emit("alert", "Аккаунт не существует")
            return
        }
        clients.push(
            {
                'account': exsists,
                'isAdmin': false,
                'socketId': socket.id
            });
            socket.emit("regsec", login);
        }
        for(let i = 0; i < message.length; i++){
            socket.emit("chat message", message[i])
        }
    })
    socket.on('register', function (name, email, rules, captcha, password, repeatpassword) {
    
        if(blockedname.includes(name)){
            socket.emit("alert", "Запрещенное имя")
            return
        }

        if(name.length < 3) {
            socket.emit("alert", "Имя слишком короткое")
            return
        }

        if(email == "") {
            socket.emit("alert", "Введите почту")
            return;
        }

        if(rules == null ) {
            socket.emit("alert", "Вы не согласились с правилами")
            return;
        }

        if(captcha == null){
            socket.emit("alert", "ВЫ РОБОТ")
            return
        }

        if(password == ""){
            socket.emit("alert", "Вы не ввели пароль")
            return
        }

        if(repeatpassword == ""){
            socket.emit("alert", "Вы не повторили пароль")
            return
        }

        if(password !== repeatpassword){
            socket.emit("alert", "Пароли не совпадают")
            return
        }

        if(password.length < 8){
            socket.emit("alert", "Пароль не может состоять меньше чем из 8 символов")
            return
        }
        let exsists = accounts.find(p => p.login === name || p.email === email);
        if(exsists){
            socket.emit("alert", "Данное имя или почта уже используются")
            return
        }
        let newAccount = {
            login: name,
            email: email,
            dataReg: new Date(),
            password: password
        }
        clients.push(
            {
                'account': newAccount,
                'isAdmin': false,
                'socketId': socket.id
            });
        accounts.push(newAccount);
        fs.writeFileSync("accounts.json", JSON.stringify(accounts, null, 2));
        socket.emit("regsec", newAccount.login);
        for(let i = 0; i < message.length; i++){
            socket.emit("chat message", message[i])
        }
     });

    socket.on('disconnect', function (data) {
        if (clients.length > 0) {
            let item = clients.find(x => x.socketId == socket.id);
            const index = clients.indexOf(item);
            if (index > -1) {
                clients.splice(index, 1);
             }
        }
    });
    socket.on('chat message', msg => {

        let item = clients.find(x => x.socketId == socket.id);
        if (clients.length >= 0) {
            const index = clients.indexOf(item);
            if (index <= -1) {

                let send = {
                    owner: "BOT",
                    msg: "Перезагрузите страницу вы не подключены!",
                    colorname:  "green"
                };
                socket.emit("chat message", send)
                return;
             }
        }
        if(msg[0] == "/"){
            let args = msg.split(" ");
            switch(args[0]){
                case "/admin":
                    item.isAdmin = true;
                    break
                case "/clear":
                    message = [];
                    io.emit("clearChat");
                    break
                case "/mute":
                    args = msg.split(" ");
                    mutes.push(args[1].toLowerCase());
                    break;
                case "/unmute":
                    let user = mutes.find(p => p == args[1].toLowerCase());
                    const index = mutes.indexOf(user);
                    if (index > -1) {
                        mutes.splice(index, 1);
                    }
                    break;  
                case "/roll":
                    let send = {
                        owner: item.account.login,
                        msg: "" + `${parseInt(Math.random() * 100)}`,
                        colorname: item.isAdmin ?  "red" : ""
                    };
                    message.push(send)
                    io.emit("chat message", send)
                    io.emit('notify')
                    break;
                case "/start":
                    let exsitsEvent = events.find(p => p.owner == item.account.login);
                    if(exsitsEvent){
                        return;}
                    let event = {
                        id: events.length + 1,
                        owner: item.account.login,
                        answer: args[1]
                    }
                    events.push(event);
                    let msg = {
                        owner: "BOT",
                        msg: "" + `Пользователь ${item.account.login} запустил ивент /join ${events.length} камень/ножницы/бумага`,
                        colorname:  "green"
                    };
                    io.emit("chat message", msg)
                    io.emit('notify')
                    break;
                case "/join":
                    let eventTriger = events.find(p => p.id == args[1])
                    if(!eventTriger) return;
                    let msgJoin = {
                        owner: "BOT",
                        msg: "" + `Ивент ${eventTriger.id} пользователь ${item.account.login} выбрал: ${args[2]}, а пользователь ${eventTriger.owner} выбрал: ${eventTriger.answer}`,
                        colorname:  "green"
                    };
                    let findIndex = events.indexOf(eventTriger); 
                    if(findIndex > -1){
                        events.splice(findIndex, 1);
                    }
                    io.emit("chat message", msgJoin)
                    io.emit('notify')
                    break;
            }
            return;
        }
        let send = {
            owner: item.account.login,
            msg: msg,
            colorname: item.isAdmin ?  "red" : ""
        };
        if(mutes.includes(item.account.login.toLowerCase())){

            let send = {
                owner: "BOT",
                msg: "У вас блокировка чата.",
                colorname:  "green"
            };
            socket.emit("chat message", send)
            return
        }
        message.push(send)
        try{
            let text = `${send.owner}: ${msg}`
            for(let i = 0; i < clientsTelegram.length; i++)
                telegram.bot.telegram.sendMessage(`${clientsTelegram[i]}`, text)
        }
        catch (e){
            console.log(e)
        }
        io.emit("chat message", send)
        io.emit('notify')
      });
  });


  function sendMessage(name, text, chatId){
    let msg = {
        owner: name,
        msg: text,
        colorname:  ""
    };
    try{
        let text = `${msg.owner}: ${msg.msg}`
        for(let i = 0; i < clientsTelegram.length; i++)
            if(clientsTelegram[i] !== chatId)
                telegram.bot.telegram.sendMessage(`${clientsTelegram[i]}`, text)
    }
    catch (e){
        console.log(e)
    }
    message.push(msg)
    io.emit("chat message", msg)
    io.emit('notify')
}
let clientsTelegram = JSON.parse(fs.readFileSync("clients.json"))
telegram.bot.on("text",  (ctx) => {
    
    sendMessage(ctx.message.chat.first_name, ctx.message.text , ctx.message.chat.id);
    ctx.reply("Ваше сообщение доставлено", {
        reply_to_message_id: ctx.message.message_id
    })
    if(!clientsTelegram.includes(ctx.message.chat.id)){ 
        clientsTelegram.push(ctx.message.chat.id);
        let data = JSON.stringify(clientsTelegram, null, 2);
        fs.writeFileSync("clients.json", data)
    }
    ctx.sendSticker("CAACAgIAAxkBAAEHVe1jyPYuQNIAAUBtUCxwsSeF4JnysUMAAjAAA8BfOCByLr48GRWIYS0E")
 })
 setInterval(() => {
    fs.writeFileSync("messages.json", JSON.stringify(message, null, 2))
    
 }, 1000);