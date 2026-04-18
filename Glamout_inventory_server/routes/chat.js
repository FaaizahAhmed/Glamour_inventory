import express from 'express';
import InventoryItem from '../models/InventoryItem.js';
import Category from '../models/Category.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

// Build a live snapshot from MongoDB
const buildInventoryContext = async () => {
  const items = await InventoryItem.find()
    .populate('category', 'name')
    .populate('supplier', 'name')
    .lean();
  const categories = await Category.find().lean();

  const totalQuantity = items.reduce((s, i) => s + i.quantity, 0);
  const totalValue = items.reduce((s, i) => s + (i.total_value || 0), 0);
  const lowStockItems = items.filter(i => i.quantity <= (i.min_stock_level ?? 10));

  const categoryBreakdown = categories.map(cat => {
    const catItems = items.filter(i => i.category && i.category._id?.toString() === cat._id.toString());
    return { name: cat.name, itemCount: catItems.length, totalQuantity: catItems.reduce((s, i) => s + i.quantity, 0) };
  });

  return {
    totalProducts: items.length,
    totalQuantity,
    totalValue: parseFloat(totalValue.toFixed(2)),
    lowStockCount: lowStockItems.length,
    lowStockItems: lowStockItems.map(i => ({ name: i.name, quantity: i.quantity, minStockLevel: i.min_stock_level ?? 10, category: i.category?.name || 'N/A' })),
    topItemsByQuantity: [...items].sort((a, b) => b.quantity - a.quantity).slice(0, 5).map(i => ({ name: i.name, quantity: i.quantity, category: i.category?.name || 'N/A' })),
    mostExpensive: [...items].sort((a, b) => b.unit_price - a.unit_price).slice(0, 3).map(i => ({ name: i.name, unit_price: i.unit_price, category: i.category?.name || 'N/A' })),
    categoryBreakdown,
    allItems: items.map(i => ({ name: i.name, brand: i.brand || 'N/A', category: i.category?.name || 'N/A', quantity: i.quantity, minStockLevel: i.min_stock_level ?? 10, unit_price: i.unit_price, sku: i.sku || 'N/A' })),
  };
};

// Rule-based smart replies (works without Gemini key)
const smartReply = (question, data) => {
  const q = question.toLowerCase();

  if (q.includes('low stock') || q.includes('low on stock') || q.includes('running low') || q.includes('restock') || q.includes('below minimum') || q.includes('need restocking') || q.includes('out of stock')) {
    if (data.lowStockCount === 0) return '✅ Great news! All items are above their minimum stock levels. No restocking needed right now.';
    const list = data.lowStockItems.map(i => `• ${i.name} — ${i.quantity} units (min: ${i.minStockLevel}, category: ${i.category})`).join('\n');
    return `⚠️ ${data.lowStockCount} item(s) running low:\n\n${list}\n\nThese need restocking soon.`;
  }

  if (q.includes('total value') || q.includes('worth') || q.includes('inventory value') || q.includes('stock value')) {
    return `💰 Total inventory value is $${data.totalValue.toLocaleString()} across ${data.totalProducts} unique products (${data.totalQuantity} total units).`;
  }

  if (q.includes('how many') && (q.includes('product') || q.includes('item') || q.includes('stock'))) {
    return `📦 You have ${data.totalProducts} unique products with ${data.totalQuantity} total units in stock.`;
  }

  if (q.includes('categor')) {
    if (data.categoryBreakdown.length === 0) return 'No categories created yet. Add them from the Categories page.';
    const list = data.categoryBreakdown.map(c => `• ${c.name} — ${c.itemCount} product(s), ${c.totalQuantity} total units`).join('\n');
    return `🏷️ Breakdown by category:\n\n${list}`;
  }

  if (q.includes('most stock') || q.includes('highest quantity') || q.includes('top item') || q.includes('top 5') || q.includes('most stock')) {
    const list = data.topItemsByQuantity.map((i, idx) => `${idx + 1}. ${i.name} — ${i.quantity} units (${i.category})`).join('\n');
    return `📈 Top 5 items by quantity:\n\n${list}`;
  }

  if (q.includes('least stock') || q.includes('lowest') || q.includes('fewest')) {
    const sorted = [...data.allItems].sort((a, b) => a.quantity - b.quantity).slice(0, 5);
    const list = sorted.map((i, idx) => `${idx + 1}. ${i.name} — ${i.quantity} units`).join('\n');
    return `📉 Items with least stock:\n\n${list}`;
  }

  if (q.includes('expensive') || q.includes('highest price') || q.includes('priciest')) {
    const list = data.mostExpensive.map((i, idx) => `${idx + 1}. ${i.name} — $${i.unit_price} (${i.category})`).join('\n');
    return `💎 Most expensive items:\n\n${list}`;
  }

  const itemMatch = data.allItems.find(i => q.includes(i.name.toLowerCase()));
  if (itemMatch) {
    const status = itemMatch.quantity <= itemMatch.minStockLevel ? '⚠️ LOW STOCK' : '✅ Sufficient';
    return `🔍 ${itemMatch.name}\n• Brand: ${itemMatch.brand}\n• Category: ${itemMatch.category}\n• SKU: ${itemMatch.sku}\n• Quantity: ${itemMatch.quantity} units\n• Min Stock: ${itemMatch.minStockLevel}\n• Unit Price: $${itemMatch.unit_price}\n• Status: ${status}`;
  }

  if (q.includes('summary') || q.includes('overview') || q.includes('status') || q.includes('report')) {
    return `📊 Inventory Summary\n\n• Total Products: ${data.totalProducts}\n• Total Units: ${data.totalQuantity}\n• Total Value: $${data.totalValue.toLocaleString()}\n• Low Stock Alerts: ${data.lowStockCount}\n• Categories: ${data.categoryBreakdown.length}\n\n${data.lowStockCount > 0 ? `⚠️ ${data.lowStockCount} item(s) need restocking!` : '✅ All stock levels healthy.'}`;
  }

  return `I can answer questions about your inventory. Try:\n\n• "What items are low on stock?"\n• "What is the total inventory value?"\n• "How many products do we have?"\n• "Show top items by quantity"\n• "Give me an inventory summary"\n• "Which items are most expensive?"\n• "Show categories breakdown"`;
};

// Gemini API call
const callGemini = async (userMessage, history, inventoryContext) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const systemInstruction = `You are an intelligent inventory assistant for Glamour Inventory, a makeup product stock management system. You have access to live inventory data. Use it to answer questions accurately with real numbers.\n\nCurrent inventory snapshot:\n${JSON.stringify(inventoryContext, null, 2)}\n\nGuidelines:\n- Answer concisely and helpfully\n- Use real data from the snapshot above\n- Format lists with bullet points\n- Use emojis sparingly (📦 💰 ⚠️ ✅)\n- For low stock, always list the specific items\n- Keep responses under 200 words unless a detailed list is needed`;

  const recentHistory = history.slice(-6);
  const contents = [
    ...recentHistory.filter(m => m.role === 'user' || m.role === 'assistant').map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
    { role: 'user', parts: [{ text: userMessage }] },
  ];

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemInstruction }] },
      contents,
      generationConfig: { maxOutputTokens: 400, temperature: 0.7 },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gemini API error: ${res.status}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';
};

// POST /api/chat
router.post('/', async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const inventoryData = await buildInventoryContext();
    let reply, mode;

    if (process.env.GEMINI_API_KEY) {
      try {
        reply = await callGemini(message.trim(), history, inventoryData);
        mode = 'ai';
      } catch (geminiError) {
        console.warn('⚠️  Gemini failed, falling back to smart mode:', geminiError.message);
        reply = smartReply(message.trim(), inventoryData);
        mode = 'smart';
      }
    } else {
      reply = smartReply(message.trim(), inventoryData);
      mode = 'smart';
    }

    res.json({ success: true, data: { reply, mode } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
