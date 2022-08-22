const Router = require('express')
const userController = require('../controllers/userController')
const router = new Router()
const auth = require('../middleware/auth');

router.post('/reg', userController.reg)
router.post('/log', userController.login)
// router.post('/changeusername', userController.changeUserName)
router.get('/check', auth, userController.check)
router.get('/users', userController.getUsers)
// router.get('/id', userController.getUserId)
// router.get('/name', userController.getUserName)

module.exports = router

