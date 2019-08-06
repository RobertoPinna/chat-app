const path = require('path')
const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage  , generateLocationMessage }= require('./utils/messages')
const { addUser , removeUser , getUser , getUsersInRoom } = require('./utils/users')

//here the server file


const app = express()

const server = http.createServer(app) // here we create a server
const io = socketio(server) // now server supports web sockets

const port = process.env.PORT || 3000

const publicDirectoryPath = path.join(__dirname, '../public') // __dirname is the current directory of this file , public at the beginning doesn't exist
                                                                // after we created the public folder, that one is the root directory of the app
app.use(express.static(publicDirectoryPath))

io.on('connection' , (socket) => { // socket is an object of the new client connected
    console.log('New WebSocket connection')

    //socket.emit('message' , generateMessage('Welcome! ') ) // we emit this event everytime one client connect
    // socket.emit('countUpdated' , count) // here we are calling an event , the same event on chat.js file ( client file )
    // socket.on('increment' , () => {
    //     count++
    //     //socket.emit('countUpdated' , count) // this function concern just with one client, the client at the moment
    //     io.emit('countUpdated' , count) // this one function instead emit the event for every client connected
    // })

    //socket.broadcast.emit('message' , generateMessage('a new user has joined') )  //here send to everyone like io.emit , but except the one connected in that moment
    
    socket.on('join' , ( {username , room} , callback ) => { // for joining the rooms
        const { error , user } = addUser({ id : socket.id , username , room})

        if(error){
            return callback(error)
        }

        socket.join(user.room) //only on the server side

        //socket.emit, io.emit, socket.broadcast.emit
        //io.to.emit // emit an event to everybody, in a specific room
        //socket.broadcast.to.emit // broadcast type , limited to a specific chat room

        socket.emit('message' , generateMessage('Admin',`Welcome! ${user.username} ` ) ) // we emit this event everytime one client connect
        // socket.emit('countUpdated' , count) // here we are calling an event , the same event on chat.js file ( client file )
        // socket.on('increment' , () => {
        //     count++
        //     //socket.emit('countUpdated' , count) // this function concern just with one client, the client at the moment
        //     io.emit('countUpdated' , count) // this one function instead emit the event for every client connected
        // })

        socket.broadcast.to(user.room).emit('message' , generateMessage( 'Admin' , `${user.username} has joined!`) )  //here send to everyone like io.emit , but except the one connected in that moment
        io.to(user.room).emit('roomData' ,{
             room : user.room , 
             users: getUsersInRoom(user.room)
            
        } )

        callback()

   })

    socket.on('sendMessage' , (mex , callback) => {

        const filter = new Filter()

        const user = getUser(socket.id)

        if(filter.isProfane(mex)){
            return callback('Profanity is not allowed')
        }

        io.to(user.room).emit('message' , generateMessage(user.username , mex) ) // it will write that just on the room named in to() parenthesis
        callback() 
    })

    socket.on('sendLocation' , (latitude , longitude , callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage' , generateLocationMessage(user.username , 'https://google.com/maps?q=' + latitude + ',' + longitude ) ) 
        callback()
    })


    socket.on('disconnect' , () => { // each time  a client disconnect

        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message' , generateMessage( 'Admin' , `${user.username} has left!`)) // to a specified rooms
            io.to(user.room).emit('roomData' , {
                room : user.room ,
                users : getUsersInRoom(user.room)
            })
        }

       // socket.broadcast.emit('message' , generateMessage(' A user has left') )
    })

})

server.listen(port , () => {
    console.log('Server on port ' + port ) // optional
})



