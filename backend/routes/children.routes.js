const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const { updateChild, deleteChild } = require('../controllers/children.controller');

router.use(verifyToken);

// لاحظ: بلا familyId هنا — الطفل يُعدَّل ويُحذف بـ id تاعه مباشرة
router.put('/:id', requireRole('admin', 'secretary'), updateChild);
router.delete('/:id', requireRole('admin'), deleteChild);

module.exports = router;
