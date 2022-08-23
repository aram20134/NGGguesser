const Router = require('express')
const router = new Router()
const userRouter = require('./userRouter')
const mapRouter = require('./mapRouter')

router.use('/user', userRouter)
router.use('/map', mapRouter)

module.exports = router
