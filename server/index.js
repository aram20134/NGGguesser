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
const sessionHandler = require('./middleware/sessionHandler');
const gameStore = require('./socketStore/gameStore');

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


//     TODO:
//*    1) Friends list --Done--
//*    2) Admin panel (work with maps, variants, replacing images, etc) --Done--
//*    3) Add different difficul (timer, etc) --Done--
//?    4) Games with friends
//?    5) Different modes
// IO SOKCET

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        methods: ['GET', 'POST']
    }
})

server.listen(5003, () => {
    console.log('start')
})

io.use(JWTcheck)
io.use(sessionHandler)

io.on('connection', (socket) => {
    console.log('connected - ', socket?.decoded?.name)
    socket.join(socket.sessionID)
    socket.join(socket?.decoded?.id)

    socket.on('USER_ONLINE', () => {
        var logUsers = []
        for (let entry of io.of("/").sockets) {
            entry.map((el) => {
                el.sessionID !== undefined && logUsers.push({id: el.sessionID, user: el.decoded})
            })
        }
        logUsers.reduce((acc, cur, i) => {
            acc[cur.user.id] = (acc[cur.user.id] || 0) + 1
            if (acc[cur.user.id] >= 2) {
                console.log(logUsers)
                socket.emit('close')
                console.log('disconnected - ', cur.user.name)
                logUsers.splice(i, 1)
            }
            return acc
        }, [])

        // console.log(checkTabs)
        io.sockets.emit('USERS_ONLINE', logUsers)
        
        socket.emit('SESSION', {
            sessionID: socket.sessionID
        })
    })

    socket.on('disconnect', () => {
        const logUsers = []
        for (let entry of io.of("/").sockets) {
            entry.map((u) => u.decoded !== undefined && logUsers.push({id: u.id, user: u.decoded}))
        }
        io.sockets.emit('USERS_ONLINE', logUsers)
    })

    socket.on('START_PLAY', async ({mapId, room}) => {
        var variantMaps = await models.VariantMap.findAll({order: sequelize.random(), limit: 5, where: {mapId, active: true}})
        console.log(variantMaps)
        gameStore.saveGame(room, variantMaps, socket.decoded.id)
    })
    socket.on('STARTED_PLAY', ({room}) => {
        gameStore.saveIsStartedPlay(room, true)
        socket.emit('STARTED_PLAY', gameStore.findGame(room), gameStore.findStage(room), gameStore.findScore(room), gameStore.findAllChooses(room), gameStore.findUser(room), gameStore.findTime(room))
    })

    socket.on('NEXT_MAP', ({room, score, posX, posY, truePosX, truePosY}) => {
        if (gameStore.findStage(room) <= 5) {
            gameStore.saveChoose(room, posX, posY, truePosX, truePosY)
            gameStore.saveScore(room, gameStore.findScore(room) + score)
            gameStore.saveStage(room, gameStore.findStage(room) + 1)
        }
    })

    socket.on('ADD_TIME', ({room, time}) => {
        gameStore.saveTime(room, time + 1)
        console.log(gameStore.findTime(room));
    })

    socket.on('GET_CURR_MAPS', ({userId}) => {
        socket.emit('GET_CURR_MAPS', gameStore.findUserCurrGames(userId))
        console.log(gameStore.findUserCurrGames(userId))
    })
    
    socket.on('DEL_CURR_MAP', ({room}) => {
        gameStore.clearGame(room)
        console.log(gameStore);
    })

    socket.on('ADD_FRIEND', ({from, to}) => {
        console.log('add')
        socket.to(to).emit('ADD_FRIEND', from)
    })
})

start()