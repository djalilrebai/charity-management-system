const prisma = require('../config/db');

// GET /api/activities?search=...
async function getActivities(req, res) {
  try {
    const { search } = req.query;

    const where = {
      deletedAt: null,
      ...(search && {
        OR: [{ name: { contains: search } }, { type: { contains: search } }],
      }),
    };

    const activities = await prisma.activity.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { familyActivities: true } } },
    });

    res.json(activities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
}

// GET /api/activities/:id
async function getActivityById(req, res) {
  try {
    const { id } = req.params;

    const activity = await prisma.activity.findFirst({
      where: { id: Number(id), deletedAt: null },
    });

    if (!activity) {
      return res.status(404).json({ message: 'النشاط غير موجود' });
    }

    res.json(activity);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
}

// POST /api/activities
async function createActivity(req, res) {
  try {
    const { name, type, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'اسم النشاط إلزامي' });
    }

    const activity = await prisma.activity.create({
      data: {
        name,
        type: type || null,
        description: description || null,
      },
    });

    res.status(201).json(activity);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
}

// PUT /api/activities/:id
async function updateActivity(req, res) {
  try {
    const { id } = req.params;

    const existing = await prisma.activity.findFirst({ where: { id: Number(id), deletedAt: null } });
    if (!existing) {
      return res.status(404).json({ message: 'النشاط غير موجود' });
    }

    const { name, type, description } = req.body;

    const updated = await prisma.activity.update({
      where: { id: Number(id) },
      data: {
        ...(name && { name }),
        ...(type !== undefined && { type }),
        ...(description !== undefined && { description }),
      },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
}

// DELETE /api/activities/:id (soft delete)
async function deleteActivity(req, res) {
  try {
    const { id } = req.params;

    const existing = await prisma.activity.findFirst({ where: { id: Number(id), deletedAt: null } });
    if (!existing) {
      return res.status(404).json({ message: 'النشاط غير موجود' });
    }

    await prisma.activity.update({
      where: { id: Number(id) },
      data: { deletedAt: new Date() },
    });

    res.json({ message: 'تم حذف النشاط بنجاح' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
}

module.exports = {
  getActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
};
