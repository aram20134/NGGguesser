const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const uuid = require('uuid')
const path = require('path')
const {User} = require('../models/models');
const ApiError = require('../error/ApiError');


const signJWT = ({id, name, number, experience, avatar, level, role}) => {
    return jwt.sign(
        {id, name, number, experience, avatar, level, role}, 
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
            const token = signJWT(user)
            return res.json({token})
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
    
    async getUsers (req, res, next) {
        try {
            const users = await User.count()
            return res.json({users})
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async check (req, res, next) {
        const user = await User.findOne({where:{id: req.user.id}})
        const token = signJWT(user)
        return res.json({token})
    }
}   
module.exports = new UserController()
