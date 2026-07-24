const prisma = require('../config/db');

// GET /api/classes?type=SOUTIEN&search=...
async function getClasses(req, res) {
  try {
    const { type, search } = req.query;

    const where = {
      deletedAt: null,
      ...(type && { type }),
      ...(search && {
        OR: [{ name: { contains: search } }, { teacher: { contains: search } }],
      }),
    };

    const classes = await prisma.classRoom.findMany({
      where,
      orderBy: { name: 'asc' },
      include: { _count: { select: { enrollments: { where: { status: 'ACTIVE' } } } } },
    });

    res.json(classes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
}

// GET /api/classes/:id
async function getClassById(req, res) {
  try {
    const { id } = req.params;

    const classRoom = await prisma.classRoom.findFirst({
      where: { id: Number(id), deletedAt: null },
    });

    if (!classRoom) {
      return res.status(404).json({ message: 'القسم غير موجود' });
    }

    res.json(classRoom);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
}

// POST /api/classes
async function createClass(req, res) {
  try {
    const { name, teacher, type, niveau, horaire, notes } = req.body;

    if (!name || !teacher || !type) {
      return res.status(400).json({ message: 'يرجى تعبئة اسم القسم والمعلم والنوع' });
    }

    if (!['SOUTIEN', 'CORANIQUE'].includes(type)) {
      return res.status(400).json({ message: 'النوع يجب أن يكون SOUTIEN أو CORANIQUE' });
    }

    const classRoom = await prisma.classRoom.create({
      data: {
        name,
        teacher,
        type,
        niveau: niveau || null,
        horaire: horaire || null,
        notes: notes || null,
      },
    });

    res.status(201).json(classRoom);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
}

// PUT /api/classes/:id
async function updateClass(req, res) {
  try {
    const { id } = req.params;

    const existing = await prisma.classRoom.findFirst({ where: { id: Number(id), deletedAt: null } });
    if (!existing) {
      return res.status(404).json({ message: 'القسم غير موجود' });
    }

    const { name, teacher, type, niveau, horaire, notes } = req.body;

    if (type && !['SOUTIEN', 'CORANIQUE'].includes(type)) {
      return res.status(400).json({ message: 'النوع يجب أن يكون SOUTIEN أو CORANIQUE' });
    }

    const updated = await prisma.classRoom.update({
      where: { id: Number(id) },
      data: {
        ...(name && { name }),
        ...(teacher && { teacher }),
        ...(type && { type }),
        ...(niveau !== undefined && { niveau }),
        ...(horaire !== undefined && { horaire }),
        ...(notes !== undefined && { notes }),
      },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
}

// DELETE /api/classes/:id (soft delete)
async function deleteClass(req, res) {
  try {
    const { id } = req.params;

    const existing = await prisma.classRoom.findFirst({ where: { id: Number(id), deletedAt: null } });
    if (!existing) {
      return res.status(404).json({ message: 'القسم غير موجود' });
    }

    await prisma.classRoom.update({
      where: { id: Number(id) },
      data: { deletedAt: new Date() },
    });

    res.json({ message: 'تم حذف القسم بنجاح' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
}

module.exports = { getClasses, getClassById, createClass, updateClass, deleteClass };
