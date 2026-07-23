const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { getFinanceSummary } = require('../controllers/finance.controller');

router.use(verifyToken);

router.get('/summary', getFinanceSummary);

module.exports = router;
