const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const { getExpenses, createExpense, updateExpense, deleteExpense } = require('../controllers/expenses.controller');

router.use(verifyToken);

router.get('/', getExpenses);
router.post('/', requireRole('admin', 'accountant'), createExpense);
router.put('/:id', requireRole('admin', 'accountant'), updateExpense);
router.delete('/:id', requireRole('admin'), deleteExpense);

module.exports = router;
