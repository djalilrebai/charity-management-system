const prisma = require('../config/db');

// GET /api/families/:id/children
async function getChildrenByFamily(req, res) {
  try {
    const familyId = req.params.id;

    const family = await prisma.family.findFirst({
      where: { id: Number(familyId), deletedAt: null },
    });
    if (!family) {
      return res.status(404).json({ message: 'العائلة غير موجودة' });
    }

    const children = await prisma.child.findMany({
      where: { familyId: Number(familyId), deletedAt: null },
      orderBy: { dateNaissance: 'desc' },
    });

    res.json(children);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
}

// POST /api/families/:id/children
async function createChild(req, res) {
  try {
    const familyId = req.params.id;
    const { nom, sexe, dateNaissance, situation, anneeEtude } = req.body;

    if (!nom || !sexe || !dateNaissance) {
      return res.status(400).json({ message: 'يرجى تعبئة الاسم والجنس وتاريخ الميلاد' });
    }

    if (!['MALE', 'FEMALE'].includes(sexe)) {
      return res.status(400).json({ message: 'الجنس يجب أن يكون MALE أو FEMALE' });
    }

    const family = await prisma.family.findFirst({
      where: { id: Number(familyId), deletedAt: null },
    });
    if (!family) {
      return res.status(404).json({ message: 'العائلة غير موجودة' });
    }

    const child = await prisma.child.create({
      data: {
        familyId: Number(familyId),
        nom,
        sexe,
        dateNaissance: new Date(dateNaissance),
        situation: situation || null,
        anneeEtude: anneeEtude || null,
      },
    });

    res.status(201).json(child);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
}

// PUT /api/children/:id — لاحظ: بلا familyId في الـ URL، كيما اتفقنا
async function updateChild(req, res) {
  try {
    const { id } = req.params;

    const existing = await prisma.child.findFirst({ where: { id: Number(id), deletedAt: null } });
    if (!existing) {
      return res.status(404).json({ message: 'الطفل غير موجود' });
    }

    const { nom, sexe, dateNaissance, situation, anneeEtude } = req.body;

    if (sexe && !['MALE', 'FEMALE'].includes(sexe)) {
      return res.status(400).json({ message: 'الجنس يجب أن يكون MALE أو FEMALE' });
    }

    const updated = await prisma.child.update({
      where: { id: Number(id) },
      data: {
        ...(nom && { nom }),
        ...(sexe && { sexe }),
        ...(dateNaissance && { dateNaissance: new Date(dateNaissance) }),
        ...(situation !== undefined && { situation }),
        ...(anneeEtude !== undefined && { anneeEtude }),
      },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
}

// DELETE /api/children/:id (soft delete)
async function deleteChild(req, res) {
  try {
    const { id } = req.params;

    const existing = await prisma.child.findFirst({ where: { id: Number(id), deletedAt: null } });
    if (!existing) {
      return res.status(404).json({ message: 'الطفل غير موجود' });
    }

    await prisma.child.update({
      where: { id: Number(id) },
      data: { deletedAt: new Date() },
    });

    res.json({ message: 'تم حذف الطفل بنجاح' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
}

module.exports = {
  getChildrenByFamily,
  createChild,
  updateChild,
  deleteChild,
};