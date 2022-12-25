const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const uuid = require('uuid')
const path = require('path')
const {User, Friend, UserMapPlayed, Like, LevelUp} = require('../models/models');
const ApiError = require('../error/ApiError');


const signJWT = ({id, name, number, experience, avatar, level, role, friends, userMapPlayeds}) => {
    return jwt.sign(
        {id, name, number, experience, avatar, level, role, friends, userMapPlayeds}, 
        process.env.SECRET_KEY,
        {expiresIn: '48h'}
    )
}

class UserController {
    async reg (req, res, next) {
        try {
            const {name, password} = req.body
            if (!name || !password) {
                return next(ApiError.badRequest('Неккоректный никнейм или пароль!'))
            }
            const checkName = await User.findOne({where:{name}})
            if (checkName) {
                return next(ApiError.badRequest('Игрок с таким никнеймом уже существует!'))
            }
            const hashPassword = await bcrypt.hash(password, 3)
            const user = await User.create({password:hashPassword, name})
            // const token = signJWT(user)
            return res.json({message: 'success'})
        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }
    }
    async login (req, res, next) {
        const {name, password} = req.body
        const user = await User.findOne({where:{name}})
        if (!user) {
            return next(ApiError.badRequest('Пользователь не найден'))
        }
        let comparePasswd = bcrypt.compareSync(password, user.password)
        if (!comparePasswd) {
            return next(ApiError.badRequest('Неверный пароль'))
        }
        const token = signJWT(user)

        return res.json({token})
    }
    
    async getUsersCount (req, res, next) {
        try {
            const users = await User.count()
            return res.json({users})
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
    async getAllUsers (req, res, next) {
        try {
            const users = await User.findAll({include: [{model: Friend}, {model: UserMapPlayed}, {model: Like}, {model: LevelUp}], order: [[UserMapPlayed, 'updatedAt', 'DESC'], [Like, 'updatedAt', 'DESC']]})
            return res.json({users})
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async findUser (req, res, next) {
        try {
            const {userId, name} = req.body
            var user
            if (userId) {
                user = await User.findOne({where:{id: userId}})
            } else if (name) {
                user = await User.findOne({where:{name}})
            } else {
                next(ApiError.badRequest('Не получено ни одно значение'))
            }
            return res.json(user)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async getUserLikes (req, res, next) {
        try {
            const {userId} = req.body
            const userLikes = await Like.findAll({where: {userId}})
            return res.json({userLikes})
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async getUserByName (req, res, next) {
        try {
            const {name} = req.body
            const user = await User.findOne({where: {name}})
            return res.json({user})
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
    
    async getUserActivity (req, res, next) {
        try {
            const {userId} = req.body
            const user = await User.findOne({where: {id: userId}, include: [{model: Friend}, {model: UserMapPlayed}, {model: Like}, {model: LevelUp}], order: [[UserMapPlayed, 'updatedAt', 'DESC'], [Like, 'updatedAt', 'DESC']]})
            return res.json({user})
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async check (req, res, next) {
        const user = await User.findOne({where:{id: req.user.id}})
        const token = signJWT(user)
        return res.json({token})
    }
    
    async addExp (req, res, next) {
        try {
            const {exp} = req.body
            const check = await User.findOne({where: {id: req.user.id}})
            await User.update({exp: check.exp + exp}, {where: {id: req.user.id}})
            const user = await User.findOne({where: {id: req.user.id}})

            if (user.exp / (150 * (user.level + 1)) >= 1) {
                LevelUp.create({prevLvl: user.level, nextLvl: user.level + 1, userId: req.user.id})
                await User.update({level: user.level + 1, exp: user.exp - (150 * (user.level + 1))}, {where: {id: req.user.id}})
            }
            
            return res.json({message: 'success'})
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
}   
module.exports = new UserController()
