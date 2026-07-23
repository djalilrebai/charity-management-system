const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const {
  getFamilies,
  getFamilyById,
  createFamily,
  updateFamily,
  deleteFamily,
} = require('../controllers/families.controller');
const { getChildrenByFamily, createChild } = require('../controllers/children.controller');
const {
  getFamilyActivities,
  createFamilyActivity,
} = require('../controllers/family-activities.controller');

// كل الروابط تحت هذا خاصها تسجيل دخول (توكن صالح)
router.use(verifyToken);

// القراءة: admin, secretary, accountant, viewer كلهم يقدروا يشوفوا
router.get('/', getFamilies);
router.get('/:id', getFamilyById);

// الإضافة والتعديل: admin و secretary بس
router.post('/', requireRole('admin', 'secretary'), createFamily);
router.put('/:id', requireRole('admin', 'secretary'), updateFamily);

// الحذف: admin بس
router.delete('/:id', requireRole('admin'), deleteFamily);

// الأطفال متداخلين تحت العائلة (القراءة والإضافة فقط)
// التعديل والحذف يمرو عبر /api/children/:id مباشرة
router.get('/:id/children', getChildrenByFamily);
router.post('/:id/children', requireRole('admin', 'secretary'), createChild);

// سجل الاستفادة من الأنشطة، متداخل تحت العائلة (القراءة والإضافة فقط)
// التعديل والحذف يمرو عبر /api/family-activities/:id مباشرة
router.get('/:id/activities', getFamilyActivities);
router.post('/:id/activities', requireRole('admin', 'secretary'), createFamilyActivity);

module.exports = router;
