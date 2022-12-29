const uuid = require('uuid')
const path = require('path')
const ApiError = require('../error/ApiError');
const { Map, Like, VariantMap, UserMapPlayed } = require('../models/models');
const fs = require('fs');

class adminController {
    async saveChangesVariantMap (req, res, next) {
        try {
            var {id, posX, posY, mapId, active} = req.body
            posX = (posX * 9 - mapId * 2) - 40
            posY = (posY * 9 - mapId * 2) - 40
            console.log(posX, posY)
            const variantMap = await VariantMap.update({posX, posY, active}, {where: {id}})

            return res.json({message: 'Успешно'})
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
    async saveChangesMap (req, res, next) {
        try {
            const {active, id} = req.body
            const map = await Map.update({active}, {where:{id}})
            console.log(active);

            return res.json({message: 'Успешно'})
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
    async addVariantMap (req, res, next) {
        try {
            const {mapId} = req.body
            const {img} = req.files

            let fileName = uuid.v4() + '.' + img.name.split('.').pop()
            img.mv(path.resolve(__dirname, '..', 'static/variantMaps', fileName))
    
            const name = fileName.split('.').shift()
            const variantMap = await VariantMap.create({mapId, image:fileName, name})
            
            return res.json(variantMap)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
    async deleteVariantMap (req, res, next) {
        try {
            const {id} = req.body
            console.log(id)
            const {image} = await VariantMap.findOne({where: {id}})
            await VariantMap.destroy({where: {id}})
            fs.unlinkSync(path.resolve(__dirname, '..', 'static/variantMaps', image))

            return res.json({message: 'Успешно'})
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
}

module.exports = new adminController()