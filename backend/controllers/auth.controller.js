const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'يرجى إدخال اسم المستخدم وكلمة السر' });
    }

    const user = await prisma.user.findUnique({
      where: { username },
      include: { role: true },
    });

    if (!user || user.deletedAt || !user.isActive) {
      return res.status(401).json({ message: 'بيانات الدخول غير صحيحة' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'بيانات الدخول غير صحيحة' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role.name },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role.name,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
}

// يستعمل عند تحميل الصفحة باش نتأكد أن التوكن مازال صالح ونجيب بيانات المستخدم
async function me(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { role: true },
    });

    if (!user || user.deletedAt) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    res.json({
      id: user.id,
      username: user.username,
      role: user.role.name,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
}

module.exports = { login, me };
