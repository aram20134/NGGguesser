const ApiError = require('../error/ApiError')
const uuid = require('uuid');
const sessionStore = require('../socketStore/sessionStore');

module.exports = function (socket, next) {
    
    if (socket.handshake.query.forOnline) {
        return next()
    }

    const sessionID = socket.handshake.auth.sessionID;
    if (sessionID !== 'undefined') {
        const session = sessionStore.findSession(sessionID);
        
        if (session) {
            socket.sessionID = sessionID;
            return next();
        } else {
            sessionStore.saveSession(socket.decoded.id, sessionID)
            socket.sessionID = sessionID;
            return next()
        }
    }

    const newSessionID = uuid.v4()
    
    socket.sessionID = newSessionID;
    sessionStore.saveSession(socket.decoded.id, newSessionID)

    next();
}