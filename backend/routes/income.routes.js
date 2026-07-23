const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const { getIncomes, createIncome, updateIncome, deleteIncome } = require('../controllers/income.controller');

router.use(verifyToken);

// القراءة: admin, secretary, accountant, viewer
router.get('/', getIncomes);

// الإضافة والتعديل: admin و accountant (المحاسب هو المسؤول الأساسي هنا)
router.post('/', requireRole('admin', 'accountant'), createIncome);
router.put('/:id', requireRole('admin', 'accountant'), updateIncome);

// الحذف: admin بس
router.delete('/:id', requireRole('admin'), deleteIncome);

module.exports = router;
