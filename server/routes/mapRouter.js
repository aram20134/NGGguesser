const Router = require('express')
const mapController = require('../controllers/mapController')
const checkRole = require('../middleware/checkRole')
const router = new Router()

router.post('/add', checkRole('ADMIN'), mapController.addMap)
router.get('/get', mapController.getMaps)


module.exports = router