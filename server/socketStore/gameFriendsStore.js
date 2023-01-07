class gameFriendsStore {
    constructor() {
      this.games = new Map();
      this.stage = new Map();
      this.score = new Map();
      this.chooses = new Map()
      this.dateStart = new Map()
      this.user = new Map()
      this.userReady = new Map()
      this.isStartedPlay = new Map()
      this.time = new Map()
      this.friends = new Map()
    }
  
    findGame(room) {
      return this.games.get(room);
    }
  
    findStage(room) {
      return this.stage.get(room);
    }
  
    findIsStartedPlay(room) {
      return this.isStartedPlay.get(room);
    }
  
    findScore(room) {
      return this.score.get(room);
    }
  
    findUser(room) {
      return this.user.get(room);
    }
  
    findTime(room) {
      return this.time.get(room)
    }
  
    findDateStart(room) {
      return this.dateStart.get(room);
    }

    findFriends(room) {
      return this.friends.get(room)
    }

    findUserReady(room) {
      return this.userReady.get(room)
    }

    saveLobby(room, userId) {
      this.friends.set(room, [{}])
      this.user.set(room, userId)
      this.userReady.set(room, false)

      var timeout = setTimeout(() => {
        this.clearLobby(room)
        console.log('cleared lobby')
        clearTimeout(timeout)
      }, 172800000) // 48h
    }
  
    saveGame(room, varaintMaps, userId, friends) {
      this.games.set(room, varaintMaps);
      this.stage.set(room, 0)
      this.score.set(room, [{}])
      this.chooses.set(room, [{}])
      this.dateStart.set(room, new Date().getTime())
      this.user.set(room, userId)
      this.userReady.set(room, false)
      this.isStartedPlay.set(room, false)
      this.time.set(room, 0)
      this.friends.set(room, friends)
  
      var timeout = setTimeout(() => {
        this.clearGame(room)
        console.log('cleared game')
        clearTimeout(timeout)
      }, 172800000) // 48h
    }
  
    saveChoose(room, id, name, score, posX, posY, truePosX, truePosY, stage, lineWidth) {
      this.chooses.set(room, [...this.findAllChooses(room), {id, name, score, posX, posY, truePosX, truePosY, stage, lineWidth}])
    }

    saveUserReady (room, ready) {
      this.userReady.set(room, ready)
    }
  
    saveScore(room, score) {
      this.score.set(room, score)
    }
  
    saveStage(room, stage) {
      this.stage.set(room, stage)
    }

    saveFriend (room, friend) {
      this.friends.set(room, [...this.findFriends(room), friend])
    }

    saveFriendAll (room, friend) {
      this.friends.set(room, friend)
    }
  
    saveTime(room, time) {
      this.time.set(room, time)
    }
  
    saveIsStartedPlay(room, bool) {
      this.isStartedPlay.set(room, bool);
    }
  
    findAllChooses(room) {
      return this.chooses.get(room)
    }
  
    findAllGames(room) {
      return {room: room, stage: this.stage.get(room), score: this.score.get(room), dateStart: this.dateStart.get(room), mapId: this.games.get(room)[0].mapId, time: this.time.get(room)}
    }
  
    findUserCurrGames(userId) {
      var pairs = [...this.user.entries()]
      
      pairs = pairs.map((pair) => pair[1] === userId && pair[0]).map((room, i) => this.findIsStartedPlay(room) && this.findAllGames(room)).filter(pair => pair != null)
      return pairs
    }
  
    clearGames() {
      this.games.clear()
      this.stage.clear()
      this.score.clear()
      this.chooses.clear()
      this.time.clear()
      this.dateStart.clear()
      this.user.clear()
      this.isStartedPlay.clear()
    }

    clearLobby(room) {
      this.friends.delete(room)
      this.user.delete(room)
      this.userReady.delete(room)
    }
    clearGame(room) {
      this.stage.delete(room)
      this.games.delete(room)
      this.score.delete(room)
      this.chooses.delete(room)
      this.time.delete(room)
      this.dateStart.delete(room)
      this.user.delete(room)
      this.isStartedPlay.delete(room)
      this.friends.delete(room)
    }
  }
  module.exports = new gameFriendsStore()