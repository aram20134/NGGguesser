const Router = require('express')
const mapController = require('../controllers/mapController')
const auth = require('../middleware/auth')
const checkRole = require('../middleware/checkRole')
const router = new Router()

router.post('/add', checkRole('ADMIN'), mapController.addMap)
router.get('/get', mapController.getMaps)
router.post('/like', auth, mapController.setLike)
router.post('/addVariantMap', checkRole('ADMIN'), mapController.addVariantMap)
router.post('/likeDel', auth, mapController.delLike)
router.post('/addUserMapPlayed', auth, mapController.addUserMapPlayed)
router.post('/getUserMapPlayed', mapController.getUserMapPlayed)

module.exports = router