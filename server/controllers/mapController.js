const uuid = require('uuid')
const path = require('path')
const ApiError = require('../error/ApiError');
const { Map, Like, VariantMap, UserMapPlayed } = require('../models/models');

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
    async addVariantMap(req, res, next) {
        try {
            var {mapId, posX, posY} = req.body
            const {img} = req.files
            if (!mapId || !img || !posX || !posY) return next(ApiError.badRequest('Получены не все значения'))
            
            let fileName = uuid.v4() + '.' + img.name.split('.').pop()

            img.mv(path.resolve(__dirname, '..', 'static/variantMaps', fileName))
                
            const name = fileName.split('.').shift()
            posX = posX * 9 - mapId * 2
            posY = posY * 9 - mapId * 2
            const variantMap = await VariantMap.create({mapId, posX, posY, image:fileName, name})
            
            return res.json({variantMap})
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async addUserMapPlayed(req, res, next) {
        try {
            const {score, mapId} = req.body
            const userId = req.user.id
            if (!score || !userId || !mapId) return next(ApiError.badRequest('Получены не все значения'))
            const userMapPlayed = await UserMapPlayed.create({score, userId, mapId})
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
            const {mapId} = req.params
            const highscore = await UserMapPlayed.findAll({where: {mapId}, order:[['score', 'DESC']], limit: 5})
            return res.json(highscore)
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
