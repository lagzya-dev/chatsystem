const socket = io()
var messages = document.getElementById('messages');
var form = document.getElementById('form');
var input = document.getElementById('input');
var emoji = document.getElementById('emoji');

var reg = document.getElementById('registr');

var notify = document.getElementById('notify');

var emoji1 = document.getElementById('emojisst');

let volume = 0.2;

if(form ){
    form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value) {
        if(input.value.includes("/vol")){

            volume = input.value.split(" ")[1];
            input.value ='';
            
            return
        }
        socket.emit('chat message', input.value);
        input.value = '';
    }
    });
}

if(reg){
    reg.addEventListener('submit', (e) => {
        e.preventDefault();
        if(document.forms.registr){
            var formData = new FormData(document.forms.registr)
      
            socket.emit("register", formData.get("name"), formData.get("email"), formData.get("rules"), formData.get("captcha"))
        }
    })
}

if(emoji) {
    emoji.addEventListener("click", (e) => {
        e.preventDefault()
        if( document.getElementById("emojis").style.display  === "block")
        {
            document.getElementById("emojis").style.display = "none";
        }
        else document.getElementById("emojis").style.display = "block";
    })
}

if(emoji1) {
    emoji1.addEventListener("click", (e) => {
        e.preventDefault()
        input.value +=" :happy:";
    })
}

if(form ){
    form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value) {
        socket.emit('chat message', input.value);
        input.value = '';
    }
    });
}

socket.on('chat message', function(msg) {
    var item = document.createElement('li');
    item.textContent = msg.owner;
    if(msg.colorname !== ""){
        item.style.color = msg.colorname
    }
    
    messages.appendChild(item);
    item = document.createElement('li');
    messages.appendChild(item);
    let msgs = msg.msg.split(" ");
    msgs.forEach(element => {
        if(element.includes( ":happy:")){
            let img = document.createElement("img");
            img.src = "https://www.emojiall.com/images/120/bubble/1f600.png"
            img.className = "emojiinlist"
            item.appendChild(img)
            console.log(123)
            return;
        }
        if(element != ""){
            let text = document.createElement("span");
            text.innerText = element + " ";
            item.appendChild(text)
        }
    });

    window.scrollTo(0, document.body.scrollHeight);
  });

socket.emit("new");

socket.on("regsec", () =>{
    document.body.style.overflow = "visible";
    document.getElementById("auth").style.display = "none";
});

 socket.on("alert", (text) =>{
    alert(text);
 })

socket.on("notify", () =>{
    var audio = new Audio('audio/notify.mp3');
    console.log(volume)
    audio.volume = parseFloat(volume);
    audio.play();
})

 socket.on("clearChat", () =>{
    for(let i = messages.children.length - 1; i >= 0; i--){
        messages.removeChild(messages.children[i]);
    }
 })