import mongoose from 'mongoose';

const inventoryItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    brand: {
      type: String,
      trim: true,
      default: null
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    sku: {
      type: String,
      trim: true,
      default: null,
      unique: true,
      sparse: true
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    min_stock_level: {
      type: Number,
      default: 10,
      min: 0
    },
    unit_price: {
      type: Number,
      required: true,
      min: 0
    },
    total_value: {
      type: Number,
      default: 0,
      get: function() {
        return this.quantity * this.unit_price;
      }
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: { getters: true }
  }
);

inventoryItemSchema.pre('save', function(next) {
  this.total_value = this.quantity * this.unit_price;
  next();
});

inventoryItemSchema.index({ createdAt: -1 });
inventoryItemSchema.index({ category: 1 });
inventoryItemSchema.index({ supplier: 1 });
inventoryItemSchema.index({ quantity: 1 });

const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);

export default InventoryItem;
