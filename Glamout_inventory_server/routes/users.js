import express from 'express';
import User from '../models/User.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All user management routes require authentication + admin role
router.use(requireAuth);
router.use(requireRole('admin'));

// GET /api/users — List all users (admin only)
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/users — Create a new user (admin only)
router.post('/', async (req, res) => {
  try {
    const { username, email, password, name, role } = req.body;

    if (!username || !email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'username, email, password and name are required'
      });
    }

    if (role && !['admin', 'moderator'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be admin or moderator'
      });
    }

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: existing.email === email ? 'Email already in use' : 'Username already taken'
      });
    }

    const user = new User({ username, email, password, name, role: role || 'moderator' });
    await user.save();

    res.status(201).json({ success: true, data: user.toJSON() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/users/:id — Update a user's role, info, or password (admin only)
router.put('/:id', async (req, res) => {
  try {
    const { name, email, role, password } = req.body;

    if (role && !['admin', 'moderator'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be admin or moderator'
      });
    }

    if (password !== undefined && password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Use findById + save so the bcrypt pre-save hook fires for password changes
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (password) user.password = password;

    await user.save();

    res.json({ success: true, data: user.toJSON() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/users/:id — Delete a user (admin only, cannot delete self)
router.delete('/:id', async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
