const Router = require('express')
const router = new Router()
const userRouter = require('./userRouter')

router.use('/user', userRouter)
// router.use('/map', mapRouter)

module.exports = router
