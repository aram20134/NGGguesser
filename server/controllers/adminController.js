const uuid = require('uuid')
const path = require('path')
const ApiError = require('../error/ApiError');
const { Map, Like, VariantMap, UserMapPlayed } = require('../models/models');

class adminController {
    async saveChangesVariantMap (req, res, next) {
        try {
            var {id, posX, posY, mapId} = req.body
            posX = (posX * 9 - mapId * 2) - 40
            posY = (posY * 9 - mapId * 2) - 40
            console.log(posX, posY)
            const variantMap = await VariantMap.update({posX, posY}, {where: {id}})

            return res.json({message: 'Успешно'})
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
}

module.exports = new adminController()