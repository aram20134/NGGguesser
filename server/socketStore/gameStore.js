class gameStore {
  constructor() {
    this.games = new Map();
    this.stage = new Map();
    this.score = new Map();
    this.chooses = new Map()
    this.dateStart = new Map()
    this.user = new Map()
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

  saveGame(room, varaintMaps, userId) {
    this.games.set(room, varaintMaps);
    this.stage.set(room, 0)
    this.score.set(room, 0)
    this.chooses.set(room, [{}])
    this.dateStart.set(room, new Date().getTime())
    this.user.set(room, userId)
    this.isStartedPlay.set(room, false)
    this.time.set(room, 0)

    var timeout = setTimeout(() => {
      this.clearGame(room)
      console.log('cleared game')
      clearTimeout(timeout)
    }, 172800000) // 48h
  }

  saveChoose(room, posX, posY, truePosX, truePosY) {
    this.chooses.set(room, [...this.findAllChooses(room), {posX, posY, truePosX, truePosY}])
  }

  saveScore(room, score) {
    this.score.set(room, score)
  }

  saveStage(room, stage) {
    this.stage.set(room, stage)
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
  clearGame(room) {
    this.stage.delete(room)
    this.games.delete(room)
    this.score.delete(room)
    this.chooses.delete(room)
    this.time.delete(room)
    this.dateStart.delete(room)
    this.user.delete(room)
    this.isStartedPlay.delete(room)
  }
}
module.exports = new gameStore()