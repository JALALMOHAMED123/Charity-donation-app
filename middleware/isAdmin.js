const User = require('../models/user');

const isAdmin = async (req, res, next) => {
  try {
    const admin = await User.findOne({ where: { id: req.user.id, isAdmin: true } });
    if (!admin) {
      return res.status(403).send('Access denied: Only admins can perform this action');
    }
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = isAdmin;