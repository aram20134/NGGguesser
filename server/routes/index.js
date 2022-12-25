const Router = require('express')
const router = new Router()
const userRouter = require('./userRouter')
const mapRouter = require('./mapRouter')
const adminRouter = require('./adminRouter')

router.use('/user', userRouter)
router.use('/map', mapRouter)
router.use('/admin', adminRouter)

module.exports = router
