const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

//Get username and room

const { username , room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

// console.log(username,room);

const socket = io();

//Join chat Room
socket.emit('joinRoom',{ username, room});


//Get Room and users

socket.on('roomUsers', ({room,users}) =>{
    outputRoomName(room);
    outputUsers(users);
});

//Message from srver
socket.on('message', message =>{
    console.log(message);
    outputMessage(message);

    //Scrol Down
    chatMessages.scrollTop = chatMessages.scrollHeight;


});



//Message submit
chatForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const msg = e.target.elements.msg.value;
    
    //Emitting message to server
    socket.emit('chatmessage', msg);

    // Clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

function outputMessage(message){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;

    document.querySelector('.chat-messages').appendChild(div);
}


//Ad Room Name to DOM
function outputRoomName(room){
    roomName.innerText = room;
}

function outputUsers(users){
    userList.innerHTML = `
         ${users.map(user => `<li>${user.username}</li>`).join('')}
    `; 
}