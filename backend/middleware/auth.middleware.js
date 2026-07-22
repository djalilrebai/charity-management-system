const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'غير مصرح: التوكن مفقود' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'التوكن غير صالح أو منتهي الصلاحية' });
    }
    req.user = decoded; // { id, username, role }
    next();
  });
}

// استعمال: requireRole('admin', 'secretary')
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'غير مصرح' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'ليس لديك صلاحية للقيام بهذا الإجراء' });
    }
    next();
  };
}

module.exports = { verifyToken, requireRole };
