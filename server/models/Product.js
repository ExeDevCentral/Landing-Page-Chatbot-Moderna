// server/models/Product.js
const mongoose = require('mongoose');

const productVariantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nombre de variante es requerido'],
    trim: true
  },
  value: {
    type: String,
    required: [true, 'Valor de variante es requerido'],
    trim: true
  },
  sku: {
    type: String,
    required: [true, 'SKU es requerido'],
    unique: true,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Precio es requerido'],
    min: [0, 'El precio no puede ser negativo']
  },
  cost: {
    type: Number,
    required: [true, 'Costo es requerido'],
    min: [0, 'El costo no puede ser negativo']
  },
  stock: {
    type: Number,
    required: [true, 'Stock es requerido'],
    min: [0, 'El stock no puede ser negativo'],
    default: 0
  },
  minStock: {
    type: Number,
    min: [0, 'El stock mínimo no puede ser negativo'],
    default: 0
  },
  maxStock: {
    type: Number,
    min: [0, 'El stock máximo no puede ser negativo'],
    default: 1000
  },
  weight: {
    type: Number,
    min: [0, 'El peso no puede ser negativo']
  },
  dimensions: {
    length: { type: Number, min: 0 },
    width: { type: Number, min: 0 },
    height: { type: Number, min: 0 }
  },
  images: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, { _id: true });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nombre del producto es requerido'],
    trim: true,
    maxlength: [200, 'El nombre no puede tener más de 200 caracteres']
  },
  description: {
    type: String,
    required: [true, 'Descripción es requerida'],
    trim: true,
    maxlength: [2000, 'La descripción no puede tener más de 2000 caracteres']
  },
  category: {
    type: String,
    enum: [
      'clothing', 'accessories', 'shoes', 'electronics', 
      'home', 'beauty', 'sports', 'books', 'food', 'other'
    ],
    required: [true, 'Categoría es requerida']
  },
  brand: {
    type: String,
    trim: true,
    maxlength: [100, 'La marca no puede tener más de 100 caracteres']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'discontinued', 'out_of_stock'],
    default: 'active'
  },
  basePrice: {
    type: Number,
    required: [true, 'Precio base es requerido'],
    min: [0, 'El precio base no puede ser negativo']
  },
  baseCost: {
    type: Number,
    required: [true, 'Costo base es requerido'],
    min: [0, 'El costo base no puede ser negativo']
  },
  sku: {
    type: String,
    required: [true, 'SKU es requerido'],
    unique: true,
    trim: true,
    uppercase: true
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  variants: [productVariantSchema],
  images: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  specifications: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  supplier: {
    name: {
      type: String,
      trim: true
    },
    contact: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ status: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ barcode: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ 'variants.sku': 1 });

// Virtual for total stock
productSchema.virtual('totalStock').get(function() {
  return this.variants.reduce((total, variant) => total + variant.stock, 0);
});

// Virtual for profit margin
productSchema.virtual('profitMargin').get(function() {
  if (this.baseCost === 0) return 0;
  return ((this.basePrice - this.baseCost) / this.baseCost) * 100;
});

// Virtual for low stock variants
productSchema.virtual('lowStockVariants').get(function() {
  return this.variants.filter(variant => variant.stock <= variant.minStock);
});

// Virtual for out of stock variants
productSchema.virtual('outOfStockVariants').get(function() {
  return this.variants.filter(variant => variant.stock === 0);
});

// Pre-save middleware to update status based on stock
productSchema.pre('save', function(next) {
  const totalStock = this.totalStock;
  
  if (totalStock === 0) {
    this.status = 'out_of_stock';
  } else if (this.status === 'out_of_stock' && totalStock > 0) {
    this.status = 'active';
  }
  
  next();
});

// Static method to find products by category
productSchema.statics.findByCategory = function(category) {
  return this.find({ category, status: 'active' });
};

// Static method to find low stock products
productSchema.statics.findLowStock = function() {
  return this.find({
    'variants.stock': { $lte: '$variants.minStock' },
    status: 'active'
  });
};

// Static method to search products
productSchema.statics.search = function(query, options = {}) {
  const searchQuery = {
    $and: [
      { status: 'active' },
      {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } },
          { brand: { $regex: query, $options: 'i' } }
        ]
      }
    ]
  };

  if (options.category) {
    searchQuery.$and.push({ category: options.category });
  }

  if (options.brand) {
    searchQuery.$and.push({ brand: options.brand });
  }

  if (options.minPrice || options.maxPrice) {
    const priceFilter = {};
    if (options.minPrice) priceFilter.$gte = options.minPrice;
    if (options.maxPrice) priceFilter.$lte = options.maxPrice;
    searchQuery.$and.push({ basePrice: priceFilter });
  }

  return this.find(searchQuery);
};

// Method to update stock
productSchema.methods.updateStock = function(variantId, quantity, operation = 'set') {
  const variant = this.variants.id(variantId);
  if (!variant) throw new Error('Variante no encontrada');

  switch (operation) {
    case 'add':
      variant.stock += quantity;
      break;
    case 'subtract':
      variant.stock = Math.max(0, variant.stock - quantity);
      break;
    case 'set':
    default:
      variant.stock = Math.max(0, quantity);
      break;
  }

  return this.save();
};

module.exports = mongoose.model('Product', productSchema);
