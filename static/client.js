const socket = io()
var messages = document.getElementById('messages');
var form = document.getElementById('form');
var input = document.getElementById('input');

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
    messages.appendChild(item);
    item = document.createElement('li');
    item.textContent = msg.msg;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
  });
socket.emit("new");
 