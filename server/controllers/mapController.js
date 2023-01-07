const uuid = require('uuid')
const path = require('path')
const ApiError = require('../error/ApiError');
const { Map, Like, VariantMap, UserMapPlayed, User, Friend } = require('../models/models');
const {Sequelize} = require('sequelize');

class mapController {

    async addMap(req, res, next) {
        try {
            const {name, description, difficult, phase} = req.body
            const {img, mapSchema} = req.files
            if (!name || !description || !difficult || !phase || !mapSchema) return next(ApiError.badRequest('Получены не все значения'))
    
            let fileName = uuid.v4() + '.' + img.name.split('.').pop()
            let fileName2 = uuid.v4() + '.' + mapSchema.name.split('.').pop()

            img.mv(path.resolve(__dirname, '..', 'static/map', fileName))
            mapSchema.mv(path.resolve(__dirname, '..', 'static/mapSchema', fileName2))

            const map = await Map.create({name, description, phase, difficult, image: fileName, mapSchema: fileName2})
            return res.json(map)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
    async getMaps(req, res, next) {
        try {
            const maps = await Map.findAll({include: [{model: Like}, {model: VariantMap}, {model: UserMapPlayed}]})
            return res.json({maps})
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
    async setLike(req, res, next) {
        try {
            const {mapId} = req.body
            const like = await Like.create({mapId, userId:req.user.id})
            return res.json({like})
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
    async delLike(req, res, next) {
        try {
            const {mapId} = req.body
            const like = await Like.destroy({where: {mapId, userId:req.user.id}})
            return res.json({like})
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async addUserMapPlayed(req, res, next) {
        try {
            const {score, mapId, time} = req.body
            const userId = req.user.id
            if (!score || !userId || !mapId || !time) return next(ApiError.badRequest('Получены не все значения'))
            const userMapPlayed = await UserMapPlayed.create({score, userId, mapId, time})
            return res.json({userMapPlayed})
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async getUserMapPlayed(req, res, next) {
        try {
            const {userId} = req.body
            const userMapPlayed = await UserMapPlayed.findAll({where: {userId}})
            return res.json(userMapPlayed)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async getHighscore(req, res, next) {
        try {
            const {mapId} = req.params //.findAll({where: {mapId}, attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('userId')), 'userId']]})
            var highscore = await UserMapPlayed.findAll({where: {mapId}, order:[['score', 'DESC'], ['time', 'ASC']], include: [{model: User, attributes:['name', 'avatar']}]})
            highscore = highscore.reduce((acc, cur) => {
                if (!acc.find(v => v.userId == cur.userId)) {
                  acc.push(cur);
                }
                return acc;
            }, []);
            highscore = highscore.slice(0, 5)
            return res.json(highscore)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async getFriendsHighScore (req, res, next) {
        try {
            const {id} = req.user
            const {mapId} = req.params 
            var friends = []
            var user = await User.findOne({where: {id}, include: [{model: Friend}]})
            
            for (let i = 0; i < user.friends.length; i++) {
                var a = await User.findOne({where: {id: user.friends[i].friendId}, attributes: {exclude: ['password']}, include: [{model: UserMapPlayed, where: {mapId}}], order:[[UserMapPlayed, 'score', 'DESC'], [UserMapPlayed, 'time', 'ASC']]})
                friends.push({name: a?.name, avatar: a?.avatar, score: a?.userMapPlayeds[0].score, time: a?.userMapPlayeds[0].time})
            }
            friends = friends.filter((f) => f.name)
            res.json(friends)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async findMap(req, res, next) {
        try {
            const {name} = req.params
            const map = await Map.findOne({where: {name}, include: [{model: Like}, {model: VariantMap}, {model: UserMapPlayed}]})
            return res.json({map})
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
}

module.exports = new mapController()
