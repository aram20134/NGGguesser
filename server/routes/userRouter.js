const Router = require('express')
const userController = require('../controllers/userController')
const router = new Router()
const auth = require('../middleware/auth');

router.post('/reg', userController.reg)
router.post('/log', userController.login)
// router.post('/changeusername', userController.changeUserName)
router.get('/check', auth, userController.check)
router.get('/userscount', userController.getUsersCount)
router.post('/findUser', userController.findUser)
router.post('/userbyname', userController.getUserByName)
router.post('/useractivity', userController.getUserActivity)
router.post('/userlikes', userController.getUserLikes)
router.post('/exp', auth, userController.addExp)
router.get('/', userController.getAllUsers)
router.post('/addFriend', auth, userController.addFriend)
router.get('/searchUsers', userController.searchUsers)
router.post('/delFriend', auth, userController.delFriend)
router.post('/getFriends', auth, userController.getFriends)
// router.get('/id', userController.getUserId)
// router.get('/name', userController.getUserName)

module.exports = router

