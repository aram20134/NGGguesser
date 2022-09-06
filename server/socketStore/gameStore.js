class gameStore {
  constructor() {
    this.games = new Map();
    this.stage = new Map();
    this.score = new Map();
    this.chooses = new Map()
    this.dateStart = new Map()
    this.user = new Map()
  }

  findGame(room) {
    return this.games.get(room);
  }

  findStage(room) {
    return this.stage.get(room);
  }

  findScore(room) {
    return this.score.get(room);
  }

  findUser(room) {
    return this.user.get(room);
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

  findAllChooses(room) {
    return this.chooses.get(room)
  }

  findAllGames() {
    return [...this.games.values()];
  }
}
module.exports = new gameStore()