require('dotenv').config()
const JWTcheck = require('./middleware/socket');
const express = require('express')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const models = require('./models/models')
const sequelize = require('./db');
const router = require('./routes/index')
const path = require('path')
const errorHandle = require('./middleware/ErrorHandle')
const { Server } = require("socket.io");
const http = require('http');
const jwt = require('jsonwebtoken');
const ApiError = require('./error/ApiError')

const PORT = 5002 || procces.env.PORT
const app = express()


app.use(cors())
app.use(express.json())

app.use(express.static(path.resolve(__dirname, 'static')))
app.use(fileUpload())
app.use('/api', router)
app.use(errorHandle)

const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync({alter: true})
        app.listen(PORT, () => console.log(`SERVER STARTED AT PORT ${PORT}`))
    } catch (e) {
        console.log(e)
    }
}


// IO SOKCET

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
})

server.listen(5003, () => [
    console.log('start')
])


io.use(JWTcheck)
let users = new Set();
let logUsers = {}
io.on('connection', (socket) => {  

    socket.on('USER_ONLINE', () => {
        users.add({id: socket.decoded.id, socket: socket.id})
        logUsers = {}
        users.forEach((u) => {
            logUsers[u.id] = u
        })
        io.sockets.emit('USERS_ONLINE', logUsers)
        console.log(users)
    })

    socket.on('disconnect', () => {
        users.forEach(user => {
            if (user.id === socket.decoded.id) {
                users.delete(user)
            }
        })
        logUsers = {}
        users.forEach((u) => {
            logUsers[u.id] = u
        })
        io.sockets.emit('USERS_ONLINE', logUsers)
    })
})

start()