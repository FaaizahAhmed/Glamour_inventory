import express from 'express';
import Supplier from '../models/Supplier.js';
import InventoryItem from '../models/InventoryItem.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// GET /api/suppliers — list all suppliers (any authenticated user)
router.get('/', async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ name: 1 });
    res.json({ success: true, data: suppliers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/suppliers/:id — get single supplier
router.get('/:id', async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }
    res.json({ success: true, data: supplier });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/suppliers — create supplier (admin only)
router.post('/', requireRole('admin'), async (req, res) => {
  try {
    const { name, contact_person, email, phone, address, city, country } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Supplier name is required' });
    }

    const existing = await Supplier.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Supplier already exists' });
    }

    const supplier = new Supplier({ name, contact_person, email, phone, address, city, country });
    await supplier.save();

    res.status(201).json({ success: true, data: supplier });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/suppliers/:id — update supplier (admin only)
router.put('/:id', requireRole('admin'), async (req, res) => {
  try {
    const { name, contact_person, email, phone, address, city, country } = req.body;

    if (name) {
      const existing = await Supplier.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Supplier name already in use' });
      }
    }

    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      { name, contact_person, email, phone, address, city, country },
      { new: true, runValidators: true }
    );

    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    res.json({ success: true, data: supplier });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/suppliers/:id — delete supplier (admin only)
router.delete('/:id', requireRole('admin'), async (req, res) => {
  try {
    const count = await InventoryItem.countDocuments({ supplier: req.params.id });
    if (count > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete: ${count} inventory item${count === 1 ? '' : 's'} use this supplier`
      });
    }
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }
    res.json({ success: true, message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/suppliers/:id/products — get all inventory items from a supplier
router.get('/:id/products', async (req, res) => {
  try {
    const items = await InventoryItem.find({ supplier: req.params.id })
      .populate('category', 'name color')
      .populate('createdBy', 'name username')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: items, count: items.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
