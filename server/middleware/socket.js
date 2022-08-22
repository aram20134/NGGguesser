const jwt = require('jsonwebtoken')
const ApiError = require('../error/ApiError')

module.exports = function (socket, next) {
    jwt.verify(socket.handshake.auth.token, process.env.SECRET_KEY, (e, decoded) => {
        if (e) return next(ApiError.forbiden(e.message))
        socket.decoded = decoded
        next()
    })
}