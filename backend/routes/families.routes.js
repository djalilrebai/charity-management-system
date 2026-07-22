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

module.exports = router;
