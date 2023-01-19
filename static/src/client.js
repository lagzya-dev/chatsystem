
const socket = io()
var messages = document.getElementById('messages');
var form = document.getElementById('form');
var input = document.getElementById('input');
var emoji = document.getElementById('emoji');
//SELCECT AUTH OR REG

var regButton = document.getElementById('button1');

var authButton = document.getElementById('button2');
regButton.addEventListener("click", (e) => {
    document.getElementById("regID").style.display = "block";
    document.getElementById("authID").style.display = "none"
})
authButton.addEventListener("click", (e) => {
    document.getElementById("regID").style.display = "none";
    document.getElementById("authID").style.display = "block"
})
//
var reg = document.getElementById('registr');
var aut = document.getElementById('authr');

let notify = document.getElementById('notify');

var emoji1 = document.getElementById('emojisst');

const listCommands = document.getElementById('list-commands');
const seeComands = document.getElementById('see-comands');
let isSeeComands = true
let volume = 0;

let userName = ""

listCommands.style.display = "none"

// появление листа команд

seeComands.addEventListener("click", () => {
    if (isSeeComands) {
        listCommands.style.display = ""
        isSeeComands = false
    } else {
        listCommands.style.display = "none"
        isSeeComands = true
    }
})

// handler send-message

if (form) {
    form.style.display = "none";
    messages.style.display = "none";
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (input.value) {
            if (input.value.includes("/vol")) {
                volume = input.value.split(" ")[1];
                input.value = '';
                return
            }
            socket.emit('chat message', input.value);
            input.value = '';
        }
    });
}

if (reg) {
    reg.addEventListener('submit', (e) => {
        e.preventDefault();
        if (document.forms.registr) {
            var formData = new FormData(document.forms.registr)
            userName = formData.get("name")
            socket.emit("register", formData.get("name"), formData.get("email"), formData.get("rules"), formData.get("captcha"), formData.get("password"), formData.get("repeatpassword"))
        }
    })
}
if (aut) {
    aut.addEventListener('submit', (e) => {
        e.preventDefault();
        if (document.forms.authr) {
            var formData = new FormData(document.forms.authr)
            userName = formData.get("name")
            socket.emit("auth", formData.get("name"), formData.get("password"))
        }
    })
}
if (emoji) {
    emoji.addEventListener("click", (e) => {
        e.preventDefault()
        if (document.getElementById("emojis").style.display === "block") {
            document.getElementById("emojis").style.display = "none";
        }
        else document.getElementById("emojis").style.display = "block";
    })
}

if (emoji1) {
    emoji1.addEventListener("click", (e) => {
        e.preventDefault()
        input.value += " :happy:";
    })
}

// получение сообщений

socket.on('chat message', function (msg) {

    const item = document.createElement("div"); 
    
    item.innerHTML = `<div style="background:green">
        <div>${JSON.stringify(msg.owner)}</div>
    </div>`
    
    if (userName === msg.owner) {
        item.style = "background:#eeffde;border-radius:10px; padding:10px; justify-self: end; width: 50%"
    } else {
        item.style = "background:white; width: 50%; border-radius: 10px; padding:10px;"
    }


    var title = document.createElement('div');
    title.textContent = msg.owner;
    if (msg.colorname !== "") {
        title.style.color = msg.colorname
    }
    if (msg.owner === "") {
        title.style.color = msg.colorname
    }
    item.appendChild(title)



    const content = document.createElement('div');
    content.innerText = msg.msg
    item.appendChild(content)
    messages.appendChild(item);

    let msgs = msg.msg.split(" ");
    msgs.forEach(element => {
        if (element.includes(":happy:")) {
            let img = document.createElement("img");
            img.src = "https://www.emojiall.com/images/120/bubble/1f600.png"
            img.className = "emojiinlist"
            content.appendChild(img)
            return;
        }
    });

    window.scrollTo(0, document.body.scrollHeight);
});


socket.emit("new", localStorage.getItem("login"));

socket.on("regsec", (id) => {
    volume = 0.2;
    document.body.style.overflow = "visible";
    document.getElementById("auth").style.display = "none";
    form.style.display = "";
    messages.style.display = "grid"
    localStorage.setItem("login", id)
});

socket.on("alert", (text) => {
    alert(text);
})

socket.on("notify", () => {
    if(messages.style.display === "grid"){
        var audio = new Audio('audio/notify.mp3');
        console.log(volume)
        audio.volume = parseFloat(volume);
        audio.play();
    }
})

socket.on("clearChat", () => {
    for (let i = messages.children.length - 1; i >= 0; i--) {
        messages.removeChild(messages.children[i]);
    }
})