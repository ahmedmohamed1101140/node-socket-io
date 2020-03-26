const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require ('socket.io');
const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser ,userLeave, getRoomUsers} = require('./utils/users');


const app = express();
const server = http.createServer(app);
const io = socketio(server);

//set static foler
app.use(express.static(path.join(__dirname, 'puplic'))); 

const chatName = 'ChatBot';

//Run when client connect
io.on('connect', socket =>{
    
    socket.on('joinRoom',({username,room}) =>{
        const user  = userJoin(socket.id, username,room)

        socket.join(user.room);
        //welcome current user
        socket.emit('message', formatMessage(chatName,'Welcome to My chat'));


        //Broad cast when user connect
        socket.broadcast
        .to(user.room)
        .emit(
            'message',
            formatMessage(chatName,`${user.username} has join the chat`)
        );

        //Send users and room info

        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })

            

    });
    
    //Listen for chat message
    socket.on('chatmessage', message=>{
        const user = getCurrentUser(socket.id);

        io
        .to(user.room)
        .emit(
            'message',
            formatMessage(user.username,message)
        );
    });
    

  
    //Run when user disconnect
    socket.on('disconnect',() =>{
        const user = userLeave(socket.id);

        if(user){
            io
            .to(user.room)
            .emit(
                'message',
                formatMessage(chatName,`A ${user.username} has left the chat`)
            );

            //Send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    });

  

});

const PORT = 3000 || process.env.PORT

server.listen(PORT, () => console.log(`Server Runnign on PORT ${PORT}`));

