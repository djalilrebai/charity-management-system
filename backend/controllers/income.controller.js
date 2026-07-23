const prisma = require('../config/db');

function formatRecord(record) {
  return {
    id: record.id,
    date: record.date,
    amount: record.amount,
    category: record.category,
    reference: record.reference,
    description: record.description,
    createdBy: record.createdBy,
    createdByUsername: record.createdByUser?.username || null,
    updatedByUsername: record.updatedByUser?.username || null,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

// GET /api/income?category=...&from=...&to=...
async function getIncomes(req, res) {
  try {
    const { category, from, to } = req.query;

    const where = {
      deletedAt: null,
      ...(category && { category }),
      ...((from || to) && {
        date: {
          ...(from && { gte: new Date(from) }),
          ...(to && { lte: new Date(to) }),
        },
      }),
    };

    const records = await prisma.income.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        createdByUser: { select: { username: true } },
        updatedByUser: { select: { username: true } },
      },
    });

    res.json(records.map(formatRecord));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
}

// POST /api/income
async function createIncome(req, res) {
  try {
    const { date, amount, category, reference, description } = req.body;

    if (!date || amount === undefined || !category) {
      return res.status(400).json({ message: 'يرجى تعبئة التاريخ والمبلغ والتصنيف' });
    }

    const created = await prisma.income.create({
      data: {
        date: new Date(date),
        amount: Number(amount),
        category,
        reference: reference || null,
        description: description || null,
        createdBy: req.user.id,
      },
      include: {
        createdByUser: { select: { username: true } },
        updatedByUser: { select: { username: true } },
      },
    });

    res.status(201).json(formatRecord(created));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
}

// PUT /api/income/:id
async function updateIncome(req, res) {
  try {
    const { id } = req.params;

    const existing = await prisma.income.findFirst({ where: { id: Number(id), deletedAt: null } });
    if (!existing) {
      return res.status(404).json({ message: 'السجل غير موجود' });
    }

    const { date, amount, category, reference, description } = req.body;

    const updated = await prisma.income.update({
      where: { id: Number(id) },
      data: {
        ...(date && { date: new Date(date) }),
        ...(amount !== undefined && { amount: Number(amount) }),
        ...(category && { category }),
        ...(reference !== undefined && { reference }),
        ...(description !== undefined && { description }),
        updatedBy: req.user.id,
      },
      include: {
        createdByUser: { select: { username: true } },
        updatedByUser: { select: { username: true } },
      },
    });

    res.json(formatRecord(updated));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
}

// DELETE /api/income/:id (soft delete)
async function deleteIncome(req, res) {
  try {
    const { id } = req.params;

    const existing = await prisma.income.findFirst({ where: { id: Number(id), deletedAt: null } });
    if (!existing) {
      return res.status(404).json({ message: 'السجل غير موجود' });
    }

    await prisma.income.update({
      where: { id: Number(id) },
      data: { deletedAt: new Date(), updatedBy: req.user.id },
    });

    res.json({ message: 'تم حذف السجل بنجاح' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
}

module.exports = { getIncomes, createIncome, updateIncome, deleteIncome };
