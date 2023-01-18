const express = require("express");
const http = require("http");
const path = require("path")
const socket = require("socket.io");
const app = express();
const server = http.Server(app);
const io = socket(server);


app.set("port", 5000);
app.use("/static", express.static(__dirname + "/static"));


app.get("/", (requst, response) => {
    response.sendFile(path.join(__dirname + "/static", "index.html"))
})
app.get('/app.css', function(req, res) {
    res.sendFile(__dirname + "/static/" + "app.css");
  });
app.get('/audio/notify.mp3', function(req, res) {
    res.sendFile(__dirname + "/static/audio/" + "notify.mp3");
});
server.listen(5000, () => {
    console.log("Start server")
});

let clients = [];
let count = 1;
let message = [];
let mutes = [];
let events = [];
let blockedname = ["Admin", "Administrator", "Админ", "Администратор"]
io.on('connection', (socket) => {
    console.log('USER CONNECTED');
    socket.on('register', function (name, email, rules, captcha) {
        if(blockedname.includes(name)){
            socket.emit("alert", "Запрещенное имя")
            return
        }
        if(name.length < 3){
            socket.emit("alert", "Имя слишком короткое")
            return
        }
        if(email == ""){
            socket.emit("alert", "ВВЕДИТЕ ПОЧТУ")
            return;
        }
        if(rules == null ){
            socket.emit("alert", "ВЫ НЕ СОГЛАСИЛИСЬ С ПРАВИЛАМИ")
            return;
        }
        if(captcha == null){
            socket.emit("alert", "ВЫ РОБОТ")
        }
       
        clients.push(
            {
                'nickname': name,
                'email': email,
                'isAdmin': false,
                'socketId': socket.id
            });
          
        console.log(message)
        socket.emit("regsec");
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
                    console.log(args[1])
                    mutes.push(args[1].toLowerCase());
                    break;
                case "/unmute":
                    let user = mutes.find(p => p == args[1].toLowerCase());
                    console.log(user);
                    const index = mutes.indexOf(user);
                    if (index > -1) {
                        mutes.splice(index, 1);
                    }
                    break;  
                case "/roll":
                    let send = {
                        owner: item.nickname,
                        msg: "" + `${parseInt(Math.random() * 100)}`,
                        colorname: item.isAdmin ?  "red" : ""
                    };
                    message.push(send)
                    console.log(msg)
                    io.emit("chat message", send)
                    io.emit('notify')
                    break;
                case "/start":
                    let exsitsEvent = events.find(p => p.owner == item.nickname);
                    if(exsitsEvent){
                        console.log(events.length + "|" + events)
                        return;}
                    let event = {
                        id: events.length + 1,
                        owner: item.nickname,
                        answer: args[1]
                    }
                    events.push(event);
                    let msg = {
                        owner: "BOT",
                        msg: "" + `Пользователь ${item.nickname} запустил ивент /join ${events.length} камень/ножницы/бумага`,
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
                        msg: "" + `Ивент ${eventTriger.id} пользователь ${item.nickname} выбрал: ${args[2]}, а пользователь ${eventTriger.owner} выбрал: ${eventTriger.answer}`,
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
            owner: item.nickname,
            msg: msg,
            colorname: item.isAdmin ?  "red" : ""
        };
        if(mutes.includes(item.nickname.toLowerCase())){

            let send = {
                owner: "BOT",
                msg: "У вас блокировка чата.",
                colorname:  "green"
            };
            socket.emit("chat message", send)
            return
        }
        message.push(send)
        console.log(msg)
        io.emit("chat message", send)
        io.emit('notify')
      });
  });