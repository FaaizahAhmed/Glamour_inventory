import express from 'express';
import InventoryItem from '../models/InventoryItem.js';
import { sendLowStockEmail, isLowStock } from '../services/emailService.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Protect all inventory routes with authentication
router.use(requireAuth);

router.get('/stats/dashboard', async (req, res) => {
  try {
    const items = await InventoryItem.find();
    
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const lowStockItems = items.filter(item => item.quantity <= (item.min_stock_level || 10)).length;
    const totalValue = items.reduce((sum, item) => sum + (item.total_value || 0), 0);
    const uniqueItems = items.length;
    
    res.json({
      success: true,
      data: {
        totalItems,
        lowStockItems,
        totalValue: parseFloat(totalValue.toFixed(2)),
        uniqueItems
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const items = await InventoryItem.find()
      .populate('category', 'name color icon')
      .populate('supplier', 'name contact_person email')
      .populate('createdBy', 'name username')
      .populate('updatedBy', 'name username')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id)
      .populate('category', 'name color icon')
      .populate('supplier', 'name contact_person email')
      .populate('createdBy', 'name username')
      .populate('updatedBy', 'name username');
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create new item
router.post('/', async (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity !== undefined && parseInt(quantity) < 0) {
      return res.status(400).json({ success: false, message: 'Quantity cannot be negative' });
    }

    const newItem = new InventoryItem({
      ...req.body,
      createdBy: req.user._id,
      updatedBy: req.user._id
    });
    const savedItem = await newItem.save();
    
    // Populate user info for response
    await savedItem.populate('category', 'name color icon');
    await savedItem.populate('supplier', 'name contact_person email');
    await savedItem.populate('createdBy', 'name username');
    await savedItem.populate('updatedBy', 'name username');
    
    // check if stock is low after creation (send email async)
    if (isLowStock(savedItem.quantity, savedItem.min_stock_level)) {
      sendLowStockEmail(savedItem, process.env.OWNER_EMAIL).catch(err => 
        console.error('Email sending error:', err)
      );
    }
    
    res.status(201).json({ success: true, data: savedItem });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT update item
router.put('/:id', async (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity !== undefined && parseInt(quantity) < 0) {
      return res.status(400).json({ success: false, message: 'Quantity cannot be negative' });
    }

    const updatedItem = await InventoryItem.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedBy: req.user._id
      },
      { new: true, runValidators: true }
    )
      .populate('category', 'name color icon')
      .populate('supplier', 'name contact_person email')
      .populate('createdBy', 'name username')
      .populate('updatedBy', 'name username');
      
    if (!updatedItem) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    
    // Only alert if quantity was explicitly changed in this request and is now low
    if (req.body.quantity !== undefined && isLowStock(updatedItem.quantity, updatedItem.min_stock_level)) {
      sendLowStockEmail(updatedItem, process.env.OWNER_EMAIL).catch(err => 
        console.error('Email sending error:', err)
      );
    }
    
    res.json({ success: true, data: updatedItem });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', requireRole('admin'), async (req, res) => {
  try {
    const deletedItem = await InventoryItem.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
