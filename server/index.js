require('dotenv').config()
const JWTcheck = require('./middleware/JWTcheck');
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
const ApiError = require('./error/ApiError')
const uuid = require('uuid');
const sessionHandler = require('./middleware/sessionHandler');
const gameStore = require('./socketStore/gameStore');
const sessionStore = require('./socketStore/sessionStore');

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
io.use(sessionHandler)

io.on('connection', (socket) => {
    socket.join(socket.sessionID)
    socket.on('USER_ONLINE', () => {
        const logUsers = []
        for (let entry of io.of("/").sockets) {
            entry.map((u) => u.decoded !== undefined && logUsers.push({id: u.id, user: u.decoded}))
        }
        io.sockets.emit('USERS_ONLINE', logUsers)

        socket.emit('SESSION', {
            sessionID: socket.sessionID
        })
    })

    socket.on('disconnect', () => {
        const logUsers = []
        for (let entry of io.of("/").sockets) {
            entry.map((u) => u.id !== undefined && logUsers.push({id: u.id, user: u.decoded}))
        }
        io.sockets.emit('USERS_ONLINE', logUsers)
    })

    socket.on('START_PLAY', async ({mapId, room}) => {
        var variantMaps = await models.VariantMap.findAll({order: sequelize.random(), limit: 5, where: {mapId}})
        gameStore.saveGame(room, variantMaps)
    })

    socket.on('STARTED_PLAY', ({room}) => {
        if (gameStore.findStage(room) === 4) {
            console.log('end')
            socket.emit('MAPS_END')
        }
        socket.emit('STARTED_PLAY', gameStore.findGame(room), gameStore.findStage(room), gameStore.findScore(room), gameStore.findAllChooses(room))
    })

    socket.on('NEXT_MAP', ({room, score, posX, posY, truePosX, truePosY}) => {
        if (gameStore.findStage(room) === 4) {
            gameStore.saveChoose(room, posX, posY, truePosX, truePosY)
            gameStore.saveScore(room, gameStore.findScore(room) + score)
            gameStore.saveStage(room, gameStore.findStage(room) + 1)
            console.log(gameStore)
            return socket.emit('MAPS_END')
        } else if (gameStore.findStage(room) === 5) {
            return console.log('stage 5')
        }
        
        gameStore.saveChoose(room, posX, posY, truePosX, truePosY)
        gameStore.saveScore(room, gameStore.findScore(room) + score)
        gameStore.saveStage(room, gameStore.findStage(room) + 1)
        console.log(gameStore)
    })

})

start()