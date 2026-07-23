const prisma = require('../config/db');

// دالة مساعدة: تحويل السجل الخام لشكل مبسّط يحتوي اسم النشاط واسم المستخدم مباشرة
function formatFamilyActivity(record) {
  return {
    id: record.id,
    familyId: record.familyId,
    activityId: record.activityId,
    activityName: record.activity?.name || null,
    date: record.date,
    quantity: record.quantity,
    value: record.value,
    notes: record.notes,
    createdBy: record.createdBy,
    createdByUsername: record.createdByUser?.username || null,
  };
}

// GET /api/families/:id/activities
async function getFamilyActivities(req, res) {
  try {
    const familyId = req.params.id;

    const family = await prisma.family.findFirst({
      where: { id: Number(familyId), deletedAt: null },
    });
    if (!family) {
      return res.status(404).json({ message: 'العائلة غير موجودة' });
    }

    const records = await prisma.familyActivity.findMany({
      where: { familyId: Number(familyId), deletedAt: null },
      include: {
        activity: { select: { name: true } },
        createdByUser: { select: { username: true } },
      },
      orderBy: { date: 'desc' },
    });

    res.json(records.map(formatFamilyActivity));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
}

// POST /api/families/:id/activities
async function createFamilyActivity(req, res) {
  try {
    const familyId = req.params.id;
    const { activityId, date, quantity, value, notes } = req.body;

    if (!activityId || !date) {
      return res.status(400).json({ message: 'يرجى اختيار النشاط والتاريخ' });
    }

    const family = await prisma.family.findFirst({
      where: { id: Number(familyId), deletedAt: null },
    });
    if (!family) {
      return res.status(404).json({ message: 'العائلة غير موجودة' });
    }

    const activity = await prisma.activity.findFirst({
      where: { id: Number(activityId), deletedAt: null },
    });
    if (!activity) {
      return res.status(404).json({ message: 'النشاط غير موجود' });
    }

    const created = await prisma.familyActivity.create({
      data: {
        familyId: Number(familyId),
        activityId: Number(activityId),
        date: new Date(date),
        quantity: quantity !== undefined ? Number(quantity) : 1,
        value: value !== undefined && value !== '' ? Number(value) : null,
        notes: notes || null,
        createdBy: req.user.id, // المستخدم الحالي من التوكن
      },
      include: {
        activity: { select: { name: true } },
        createdByUser: { select: { username: true } },
      },
    });

    res.status(201).json(formatFamilyActivity(created));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
}

// PUT /api/family-activities/:id
async function updateFamilyActivity(req, res) {
  try {
    const { id } = req.params;

    const existing = await prisma.familyActivity.findFirst({
      where: { id: Number(id), deletedAt: null },
    });
    if (!existing) {
      return res.status(404).json({ message: 'السجل غير موجود' });
    }

    const { activityId, date, quantity, value, notes } = req.body;

    if (activityId) {
      const activity = await prisma.activity.findFirst({
        where: { id: Number(activityId), deletedAt: null },
      });
      if (!activity) {
        return res.status(404).json({ message: 'النشاط غير موجود' });
      }
    }

    const updated = await prisma.familyActivity.update({
      where: { id: Number(id) },
      data: {
        ...(activityId && { activityId: Number(activityId) }),
        ...(date && { date: new Date(date) }),
        ...(quantity !== undefined && { quantity: Number(quantity) }),
        ...(value !== undefined && { value: value === '' ? null : Number(value) }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        activity: { select: { name: true } },
        createdByUser: { select: { username: true } },
      },
    });

    res.json(formatFamilyActivity(updated));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
}

// DELETE /api/family-activities/:id (soft delete)
async function deleteFamilyActivity(req, res) {
  try {
    const { id } = req.params;

    const existing = await prisma.familyActivity.findFirst({
      where: { id: Number(id), deletedAt: null },
    });
    if (!existing) {
      return res.status(404).json({ message: 'السجل غير موجود' });
    }

    await prisma.familyActivity.update({
      where: { id: Number(id) },
      data: { deletedAt: new Date() },
    });

    res.json({ message: 'تم حذف السجل بنجاح' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
}

module.exports = {
  getFamilyActivities,
  createFamilyActivity,
  updateFamilyActivity,
  deleteFamilyActivity,
};
