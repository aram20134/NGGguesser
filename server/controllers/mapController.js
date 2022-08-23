const uuid = require('uuid')
const path = require('path')
const ApiError = require('../error/ApiError');
const fs = require('fs');
const { Map, Like, VariantMap, UserMapPlayed } = require('../models/models');

class mapController {

    async addMap(req, res, next) {
        try {
            const {name, description, difficult, phase} = req.body
            const {img} = req.files
            if (!name || !description || !difficult || !phase) return next(ApiError.badRequest('Получены не все значения'))
    
            let fileName = uuid.v4() + '.' + img.name.split('.').pop()
            img.mv(path.resolve(__dirname, '..', 'static', fileName))
            const map = await Map.create({name, description, phase, difficult, image: fileName})
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

}

module.exports = new mapController()
