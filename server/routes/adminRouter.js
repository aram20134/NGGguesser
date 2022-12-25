const Router = require('express');
const adminController = require('../controllers/adminController');
const router = new Router()
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

router.post('/changeVariantMap', auth, checkRole('ADMIN'), adminController.saveChangesVariantMap)

module.exports = router