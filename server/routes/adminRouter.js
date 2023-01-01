const Router = require('express');
const adminController = require('../controllers/adminController');
const router = new Router()
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

router.post('/changeVariantMap', auth, checkRole('ADMIN'), adminController.saveChangesVariantMap)
router.post('/changeMap', auth, checkRole('ADMIN'), adminController.saveChangesMap)
router.post('/addVariantMap', auth, checkRole('ADMIN'), adminController.addVariantMap)
router.post('/deleteVariantMap', auth, checkRole('ADMIN'), adminController.deleteVariantMap)
router.post('/setAdminUser', auth, checkRole('ADMIN'), adminController.setAdminUser)

module.exports = router