const bcrypt = require('bcrypt');
const prisma = require('../config/db');

function formatMember(member) {
  return {
    id: member.id,
    nom: member.nom,
    prenom: member.prenom,
    telephone: member.telephone,
    dateNaissance: member.dateNaissance,
    niveauEtude: member.niveauEtude,
    profession: member.profession,
    poste: member.poste,
    dateAdhesion: member.dateAdhesion,
    hasAccount: Boolean(member.user),
    accountUsername: member.user?.username || null,
    accountRole: member.user?.role?.name || null,
  };
}

// GET /api/members?search=...
async function getMembers(req, res) {
  try {
    const { search } = req.query;

    const where = {
      deletedAt: null,
      ...(search && {
        OR: [
          { nom: { contains: search } },
          { prenom: { contains: search } },
          { telephone: { contains: search } },
          { poste: { contains: search } },
        ],
      }),
    };

    const members = await prisma.member.findMany({
      where,
      orderBy: { dateAdhesion: 'desc' },
      include: { user: { include: { role: true } } },
    });

    res.json(members.map(formatMember));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
}

// POST /api/members
async function createMember(req, res) {
  try {
    const { nom, prenom, telephone, dateNaissance, niveauEtude, profession, poste, dateAdhesion } = req.body;

    if (!nom || !prenom || !telephone || !dateNaissance || !poste) {
      return res.status(400).json({ message: 'يرجى تعبئة الاسم واللقب والهاتف وتاريخ الميلاد والمنصب' });
    }

    const member = await prisma.member.create({
      data: {
        nom,
        prenom,
        telephone,
        dateNaissance: new Date(dateNaissance),
        niveauEtude: niveauEtude || null,
        profession: profession || null,
        poste,
        dateAdhesion: dateAdhesion ? new Date(dateAdhesion) : new Date(),
      },
    });

    res.status(201).json(formatMember(member));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
}

// PUT /api/members/:id
async function updateMember(req, res) {
  try {
    const { id } = req.params;

    const existing = await prisma.member.findFirst({ where: { id: Number(id), deletedAt: null } });
    if (!existing) {
      return res.status(404).json({ message: 'العضو غير موجود' });
    }

    const { nom, prenom, telephone, dateNaissance, niveauEtude, profession, poste, dateAdhesion } = req.body;

    const updated = await prisma.member.update({
      where: { id: Number(id) },
      data: {
        ...(nom && { nom }),
        ...(prenom && { prenom }),
        ...(telephone && { telephone }),
        ...(dateNaissance && { dateNaissance: new Date(dateNaissance) }),
        ...(niveauEtude !== undefined && { niveauEtude }),
        ...(profession !== undefined && { profession }),
        ...(poste && { poste }),
        ...(dateAdhesion && { dateAdhesion: new Date(dateAdhesion) }),
      },
      include: { user: { include: { role: true } } },
    });

    res.json(formatMember(updated));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
}

// DELETE /api/members/:id (soft delete)
async function deleteMember(req, res) {
  try {
    const { id } = req.params;

    const existing = await prisma.member.findFirst({ where: { id: Number(id), deletedAt: null } });
    if (!existing) {
      return res.status(404).json({ message: 'العضو غير موجود' });
    }

    await prisma.member.update({
      where: { id: Number(id) },
      data: { deletedAt: new Date() },
    });

    res.json({ message: 'تم حذف العضو بنجاح' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
}

// POST /api/members/:id/create-account — admin بس (كيما اتفقنا)
async function createAccountForMember(req, res) {
  try {
    const { id } = req.params;
    const { username, password, roleName } = req.body;

    if (!username || !password || !roleName) {
      return res.status(400).json({ message: 'يرجى تعبئة اسم المستخدم وكلمة السر والدور' });
    }

    const member = await prisma.member.findFirst({ where: { id: Number(id), deletedAt: null } });
    if (!member) {
      return res.status(404).json({ message: 'العضو غير موجود' });
    }

    const existingUserForMember = await prisma.user.findUnique({ where: { memberId: Number(id) } });
    if (existingUserForMember) {
      return res.status(409).json({ message: 'هذا العضو عنده حساب دخول من قبل' });
    }

    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername) {
      return res.status(409).json({ message: 'اسم المستخدم هذا مستعمل من قبل' });
    }

    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) {
      return res.status(400).json({ message: 'الدور غير موجود' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        passwordHash,
        roleId: role.id,
        memberId: Number(id),
      },
      include: { role: true },
    });

    res.status(201).json({
      id: user.id,
      username: user.username,
      role: user.role.name,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
}

module.exports = {
  getMembers,
  createMember,
  updateMember,
  deleteMember,
  createAccountForMember,
};
