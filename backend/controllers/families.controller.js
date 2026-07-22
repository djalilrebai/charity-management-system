const prisma = require('../config/db');

// GET /api/families?search=...&categorie=A&quartier=...&page=1&limit=20
async function getFamilies(req, res) {
  try {
    const { search, categorie, quartier, page = 1, limit = 20 } = req.query;

    const where = {
      deletedAt: null,
      ...(categorie && { categorie }),
      ...(quartier && { quartier: { contains: quartier } }),
      ...(search && {
        OR: [
          { nom: { contains: search } },
          { prenom: { contains: search } },
          { telephone: { contains: search } },
          { numSequentiel: { contains: search } },
        ],
      }),
    };

    const skip = (Number(page) - 1) * Number(limit);

    const [families, total] = await Promise.all([
      prisma.family.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { children: true } } },
      }),
      prisma.family.count({ where }),
    ]);

    res.json({
      data: families,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
}

// GET /api/families/:id
async function getFamilyById(req, res) {
  try {
    const { id } = req.params;

    const family = await prisma.family.findFirst({
      where: { id: Number(id), deletedAt: null },
      include: {
        children: { where: { deletedAt: null } },
        familyActivities: { include: { activity: true }, orderBy: { date: 'desc' } },
      },
    });

    if (!family) {
      return res.status(404).json({ message: 'العائلة غير موجودة' });
    }

    res.json(family);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
}

// POST /api/families
async function createFamily(req, res) {
  try {
    const {
      nom,
      prenom,
      dateNaissance,
      nationalId,
      telephone,
      adresse,
      quartier,
      categorie,
      salaire,
      housingStatus,
      orphansCount,
      notes,
    } = req.body;

    if (!nom || !prenom || !dateNaissance || !telephone || !adresse || !categorie || salaire === undefined) {
      return res.status(400).json({ message: 'يرجى تعبئة كل الحقول الإلزامية' });
    }

    if (!['A', 'B', 'C'].includes(categorie)) {
      return res.status(400).json({ message: 'الصنف يجب أن يكون A أو B أو C' });
    }

    const year = new Date().getFullYear();

    // ننشئ العائلة أولاً برقم تسلسلي مؤقت، ثم نبنيه بناءً على الـ id الحقيقي
    const family = await prisma.$transaction(async (tx) => {
      const created = await tx.family.create({
        data: {
          numSequentiel: `TEMP-${Date.now()}`,
          nom,
          prenom,
          dateNaissance: new Date(dateNaissance),
          nationalId: nationalId || null,
          telephone,
          adresse,
          quartier: quartier || null,
          categorie,
          salaire,
          housingStatus: housingStatus || 'OTHER',
          orphansCount: orphansCount || 0,
          notes: notes || null,
        },
      });

      return tx.family.update({
        where: { id: created.id },
        data: { numSequentiel: `${year}-${String(created.id).padStart(4, '0')}` },
      });
    });

    res.status(201).json(family);
  } catch (error) {
    console.error(error);
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'رقم بطاقة التعريف الوطنية مستعمل من قبل عائلة أخرى' });
    }
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
}

// PUT /api/families/:id
async function updateFamily(req, res) {
  try {
    const { id } = req.params;

    const existing = await prisma.family.findFirst({ where: { id: Number(id), deletedAt: null } });
    if (!existing) {
      return res.status(404).json({ message: 'العائلة غير موجودة' });
    }

    const {
      nom,
      prenom,
      dateNaissance,
      nationalId,
      telephone,
      adresse,
      quartier,
      categorie,
      salaire,
      housingStatus,
      orphansCount,
      notes,
    } = req.body;

    if (categorie && !['A', 'B', 'C'].includes(categorie)) {
      return res.status(400).json({ message: 'الصنف يجب أن يكون A أو B أو C' });
    }

    const updated = await prisma.family.update({
      where: { id: Number(id) },
      data: {
        ...(nom && { nom }),
        ...(prenom && { prenom }),
        ...(dateNaissance && { dateNaissance: new Date(dateNaissance) }),
        ...(nationalId !== undefined && { nationalId }),
        ...(telephone && { telephone }),
        ...(adresse && { adresse }),
        ...(quartier !== undefined && { quartier }),
        ...(categorie && { categorie }),
        ...(salaire !== undefined && { salaire }),
        ...(housingStatus && { housingStatus }),
        ...(orphansCount !== undefined && { orphansCount }),
        ...(notes !== undefined && { notes }),
      },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'رقم بطاقة التعريف الوطنية مستعمل من قبل عائلة أخرى' });
    }
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
}

// DELETE /api/families/:id  (soft delete)
async function deleteFamily(req, res) {
  try {
    const { id } = req.params;

    const existing = await prisma.family.findFirst({ where: { id: Number(id), deletedAt: null } });
    if (!existing) {
      return res.status(404).json({ message: 'العائلة غير موجودة' });
    }

    await prisma.family.update({
      where: { id: Number(id) },
      data: { deletedAt: new Date() },
    });

    res.json({ message: 'تم حذف العائلة بنجاح' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
}

module.exports = {
  getFamilies,
  getFamilyById,
  createFamily,
  updateFamily,
  deleteFamily,
};
