const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const {
  getMembers,
  createMember,
  updateMember,
  deleteMember,
  createAccountForMember,
} = require('../controllers/members.controller');

router.use(verifyToken);

// القراءة: الجميع
router.get('/', getMembers);

// الإضافة والتعديل: admin و secretary
router.post('/', requireRole('admin', 'secretary'), createMember);
router.put('/:id', requireRole('admin', 'secretary'), updateMember);

// الحذف: admin بس
router.delete('/:id', requireRole('admin'), deleteMember);

// إنشاء حساب دخول لعضو: admin بس (القرار يرجع لرئيس الجمعية بصفته admin)
router.post('/:id/create-account', requireRole('admin'), createAccountForMember);

module.exports = router;
