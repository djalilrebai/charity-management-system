const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const {
  getActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
} = require('../controllers/activities.controller');

router.use(verifyToken);

// القراءة: الجميع
router.get('/', getActivities);
router.get('/:id', getActivityById);

// الإضافة والتعديل: admin و secretary
router.post('/', requireRole('admin', 'secretary'), createActivity);
router.put('/:id', requireRole('admin', 'secretary'), updateActivity);

// الحذف: admin بس
router.delete('/:id', requireRole('admin'), deleteActivity);

module.exports = router;
