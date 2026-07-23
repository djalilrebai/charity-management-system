const prisma = require('../config/db');

// GET /api/finance/summary?from=...&to=...
// يرجع إجمالي المداخيل والمصاريف والرصيد — يُستعمل هنا وفي Dashboard لاحقاً
async function getFinanceSummary(req, res) {
  try {
    const { from, to } = req.query;

    const dateFilter = (from || to)
      ? {
          date: {
            ...(from && { gte: new Date(from) }),
            ...(to && { lte: new Date(to) }),
          },
        }
      : {};

    const [incomeAgg, expenseAgg] = await Promise.all([
      prisma.income.aggregate({
        where: { deletedAt: null, ...dateFilter },
        _sum: { amount: true },
      }),
      prisma.expense.aggregate({
        where: { deletedAt: null, ...dateFilter },
        _sum: { amount: true },
      }),
    ]);

    const totalIncome = Number(incomeAgg._sum.amount || 0);
    const totalExpenses = Number(expenseAgg._sum.amount || 0);

    res.json({
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
}

module.exports = { getFinanceSummary };
