const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
} = require('../controllers/classes.controller');

router.use(verifyToken);

router.get('/', getClasses);
router.get('/:id', getClassById);

router.post('/', requireRole('admin', 'secretary'), createClass);
router.put('/:id', requireRole('admin', 'secretary'), updateClass);
router.delete('/:id', requireRole('admin'), deleteClass);

module.exports = router;
