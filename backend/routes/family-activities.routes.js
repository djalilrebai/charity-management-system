const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const { updateFamilyActivity, deleteFamilyActivity } = require('../controllers/family-activities.controller');

router.use(verifyToken);

// بلا familyId هنا — نفس مبدأ /api/children/:id
router.put('/:id', requireRole('admin', 'secretary'), updateFamilyActivity);
router.delete('/:id', requireRole('admin'), deleteFamilyActivity);

module.exports = router;
