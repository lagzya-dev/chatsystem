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

server.listen(5000, () => {
    console.log("Start server")
});

let clients = [];
let count = 1;
let message = [];
io.on('connection', (socket) => {
    console.log('USER CONNECTED');

    socket.on('new', function () {
        console.log(123)
        clients.push(
            {
                'isFirst': true,
                'nickname': "",
                'socketId': socket.id
            });
        console.log(message)
        
        for(let i = 0; i < message.length; i++){
            socket.emit("chat message", message[i])
        }
        socket.emit("chat message", {owner:"АДМИНИСТРАЦИЯ", msg:"Отправьте ваш никнейм"})
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
                    owner: "АДМИНИСТРАЦИЯ",
                    msg: "Перезагрузите страницу вы не подключены!"
                };
                socket.emit("chat message", send)
                return;
             }
        }
        if(item.isFirst == true){
            let send = {
                owner: "АДМИНИСТРАЦИЯ",
                msg: "Спасибо теперь вы можете писать сообщения"
            };
            item.isFirst = false;
            item.nickname = msg;
            socket.emit("chat message", send)
            return;
        }
        let send = {
            owner: item.nickname,
            msg: msg
        };
        message.push(send)
        console.log(msg)
        io.emit("chat message", send)
      });
  });