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
const gameFriendsStore = require('./socketStore/gameFriendsStore');
const { randomUUID } = require('crypto');

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
        gameStore.saveGame(room, variantMaps, socket.decoded.id)
    })

    socket.on('START_PLAY_FRIENDS', async ({room}) => {
        gameFriendsStore.saveLobby(room, socket.decoded.id)
    })
    
    socket.on('STARTED_PLAY', ({room}) => {
        gameStore.saveIsStartedPlay(room, true)
        socket.emit('STARTED_PLAY', gameStore.findGame(room), gameStore.findStage(room), gameStore.findScore(room), gameStore.findAllChooses(room), gameStore.findUser(room), gameStore.findTime(room))
    })

    socket.on('LOBBY_FRIENDS_START_GAME', async (room, mapId) => {
        var variantMaps = await models.VariantMap.findAll({order: sequelize.random(), limit: 5, where: {mapId, active: true}})
        const friends = gameFriendsStore.findFriends(room)
        var roomGame = randomUUID()
        gameFriendsStore.saveGame(roomGame, variantMaps, socket.decoded.id, friends)
        gameFriendsStore.clearLobby(room)
        socket.to(room).emit('LOBBY_FRIENDS_START_GAME', roomGame)
        socket.emit('LOBBY_FRIENDS_START_GAME', roomGame)
    })

    socket.on('STARTED_PLAY_FRIENDS', (room) => {
        socket.join(room)
        gameFriendsStore.saveIsStartedPlay(room, true)
        const chooses = gameFriendsStore.findAllChooses(room)
        const friends = gameFriendsStore.findFriends(room)
        let count = 0
        var stage = gameFriendsStore.findStage(room)
        chooses?.map((c) => {
            if (c.stage === stage) {
                count = count + 1
            }
        })
        var gameEnd = friends.length + 1 === count
        console.log(gameEnd)
        socket.emit('STARTED_PLAY_FRIENDS', gameFriendsStore.findGame(room), gameFriendsStore.findStage(room), gameFriendsStore.findScore(room), gameFriendsStore.findAllChooses(room), gameFriendsStore.findUser(room), gameFriendsStore.findTime(room), gameFriendsStore.findFriends(room), gameEnd)
    })

    socket.on('LOBBY_FRIENDS', ({room}, friend) => {
        socket.join(room)
        const host = gameFriendsStore.findUser(room)
        if (host !== friend.id) {
            const friends = gameFriendsStore.findFriends(room)
            const check = friends?.every((f) => f.id !== friend.id)
            check && gameFriendsStore.saveFriend(room, {...friend, ready: false, time: 0})
        }
        gameFriendsStore.saveFriendAll(room, gameFriendsStore.findFriends(room)?.filter((f) => f.id))
        socket.to(room).emit('LOBBY_FRIENDS', gameFriendsStore.findUser(room), gameFriendsStore.findFriends(room))
        socket.emit('LOBBY_FRIENDS', gameFriendsStore.findUser(room), gameFriendsStore.findFriends(room))
    })

    socket.on('LOBBY_FRIENDS_READY', (room, user, ready) => {
        const friends = gameFriendsStore.findFriends(room)
        const id = gameFriendsStore.findUser(room)
        id === user.id && gameFriendsStore.saveUserReady(room, ready)
        gameFriendsStore.saveFriendAll(room, friends.map((f) => {
            if (f.id === user.id) {
                return {...f, ready: ready}
            } else {
                return f
            }
        }))
        socket.to(room).emit('LOBBY_FRIENDS_READY', gameFriendsStore.findFriends(room), gameFriendsStore.findUserReady(room))
        socket.emit('LOBBY_FRIENDS_READY', gameFriendsStore.findFriends(room), gameFriendsStore.findUserReady(room))
    })

    socket.on('LOBBY_FRIENDS_LEAVE', (room, friend) => {
        const friends = gameFriendsStore.findFriends(room)
        const host = gameFriendsStore.findUser(room)
        if (host === friend.id) {
            gameFriendsStore.clearLobby(room)
        } else {
            gameFriendsStore.saveFriendAll(room, friends.filter((f) => f.id !== friend.id))
            socket.to(room).emit('LOBBY_FRIENDS', gameFriendsStore.findUser(room), gameFriendsStore.findFriends(room))
        }
    })

    socket.on('NEXT_MAP', ({room, score, posX, posY, truePosX, truePosY}) => {
        if (gameStore.findStage(room) <= 5) {
            gameStore.saveChoose(room, posX, posY, truePosX, truePosY)
            gameStore.saveScore(room, gameStore.findScore(room) + score)
            gameStore.saveStage(room, gameStore.findStage(room) + 1)
        }
    })

    socket.on('NEXT_MAP_FRIENDS', (room) => {
        const stage = gameFriendsStore.findStage(room)
        if (stage <= 5) {
            socket.emit('NEXT_MAP_FRIENDS')
            socket.to(room).emit('NEXT_MAP_FRIENDS')
            gameFriendsStore.saveStage(room, gameFriendsStore.findStage(room) + 1)
        }
    })

    socket.on('FRIEND_MAP_CHECKED', (room, {id, name, score, posX, posY, truePosX, truePosY, stage, lineWidth}) => {
        if (gameFriendsStore.findStage(room) <= 5) {
            console.log(id, name, score, posX, posY, truePosX, truePosY, stage, lineWidth)
            gameFriendsStore.saveChoose(room, id, name, score, posX, posY, truePosX, truePosY, stage, lineWidth)
            const chooses = gameFriendsStore.findAllChooses(room)
            const friends = gameFriendsStore.findFriends(room)
            let count = 0
            chooses.map((c) => {
                if (c.stage === stage) {
                    count = count + 1
                }
            })
            var gameEnd = friends.length + 1 === count
            socket.to(room).emit('FRIEND_MAP_CHECKED', gameFriendsStore.findAllChooses(room), gameEnd)
            socket.emit('FRIEND_MAP_CHECKED', gameFriendsStore.findAllChooses(room), gameEnd)
        }
    })

    socket.on('ADD_TIME', ({room, time}) => {
        gameStore.saveTime(room, time + 1)
    })

    socket.on('ADD_TIME_FRIEND' , (room, id, time) => {
        const friends = gameFriendsStore.findFriends(room)
        const hostId = gameFriendsStore.findUser(room)
        if (hostId === id) {
            gameFriendsStore.saveTime(room, time + 1)
        } else {
            gameFriendsStore.saveFriendAll(room, friends?.map((f) => {
                if (f.id === id) {
                    return {...f, time: time + 1}
                }
                return f
            }))
        }
        socket.emit('ADD_TIME_FRIEND', gameFriendsStore.findFriends(room), gameFriendsStore.findTime(room))
        socket.to(room).emit('ADD_TIME_FRIEND', gameFriendsStore.findFriends(room), gameFriendsStore.findTime(room))
    })

    socket.on('GET_CURR_MAPS', ({userId}) => {
        socket.emit('GET_CURR_MAPS', gameStore.findUserCurrGames(userId))
    })
    
    socket.on('DEL_CURR_MAP', ({room}) => {
        gameStore.clearGame(room)
    })

    socket.on('ADD_FRIEND', ({from, to}) => {
        socket.to(to).emit('ADD_FRIEND', from)
    })
    socket.on('INVITE_GAME', ({from, to, map, lobby}) => {
        socket.to(to).emit('INVITE_GAME', from, map, lobby)
    })

    socket.on('ADDED_FRIEND', (id) => {
        socket.to(id).emit('ADDED_FRIEND')
        socket.emit('ADDED_FRIEND')
    })

    socket.on('FRIEND_DELETED', (id) => {
        socket.to(id).emit('FRIEND_DELETED')
    })
})

start()