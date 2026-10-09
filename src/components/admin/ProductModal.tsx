import React, { useState } from 'react';
import { Product } from '../../types';
import { useCommerce } from '../../context/CommerceContext';
import { X, Image as ImageIcon, Plus, Trash2, Check, Upload, Sparkles } from 'lucide-react';

interface ProductModalProps {
  product?: Product | null;
  onClose: () => void;
}

const PRESET_SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1608248597359-28c93540d571?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=80',
];

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const { addProduct, updateProduct } = useCommerce();

  const isEditing = !!product;

  const [name, setName] = useState(product?.name || '');
  const [sku, setSku] = useState(product?.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`);
  const [regularPrice, setRegularPrice] = useState<string>(product ? String(product.regularPrice) : '');
  const [salePrice, setSalePrice] = useState<string>(product?.salePrice ? String(product.salePrice) : '');
  const [category, setCategory] = useState(product?.category || 'Apparel');
  const [tagsInput, setTagsInput] = useState(product?.tags.join(', ') || 'Featured, New Arrival');
  const [shortDescription, setShortDescription] = useState(product?.shortDescription || '');
  const [description, setDescription] = useState(product?.description || '');

  // Inventory Management
  const [manageStock, setManageStock] = useState(product ? product.manageStock : true);
  const [stockQuantity, setStockQuantity] = useState<string>(product ? String(product.stockQuantity) : '20');
  const [lowStockAmount, setLowStockAmount] = useState<string>(product ? String(product.lowStockAmount) : '5');
  const [allowBackorders, setAllowBackorders] = useState(product ? product.allowBackorders : false);
  const [featured, setFeatured] = useState(product ? product.featured : false);

  // Multi-image management
  const [images, setImages] = useState<string[]>(
    product?.images && product.images.length > 0
      ? product.images
      : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80']
  );
  const [newImageUrl, setNewImageUrl] = useState('');
  const [showPresetPicker, setShowPresetPicker] = useState(false);

  // Attributes / Variations
  const [attributes, setAttributes] = useState<{ name: string; options: string[] }[]>(
    product?.attributes || [
      { name: 'Color', options: ['Black', 'Sand', 'Olive'] },
      { name: 'Size', options: ['Small', 'Medium', 'Large'] },
    ]
  );
  const [newAttrKey, setNewAttrKey] = useState('');
  const [newAttrOptions, setNewAttrOptions] = useState('');

  const handleAddImageByUrl = () => {
    if (!newImageUrl.trim()) return;
    setImages((prev) => [...prev, newImageUrl.trim()]);
    setNewImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSetPrimaryImage = (index: number) => {
    setImages((prev) => {
      const copy = [...prev];
      const [selected] = copy.splice(index, 1);
      return [selected, ...copy];
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImages((prev) => [...prev, reader.result as string]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddAttribute = () => {
    if (!newAttrKey.trim() || !newAttrOptions.trim()) return;
    const options = newAttrOptions.split(',').map((o) => o.trim()).filter(Boolean);
    setAttributes((prev) => [...prev, { name: newAttrKey.trim(), options }]);
    setNewAttrKey('');
    setNewAttrOptions('');
  };

  const handleRemoveAttribute = (idx: number) => {
    setAttributes((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedRegular = parseFloat(regularPrice) || 0;
    const parsedSale = salePrice ? parseFloat(salePrice) : undefined;
    const finalPrice = parsedSale && parsedSale < parsedRegular ? parsedSale : parsedRegular;
    const parsedStock = parseInt(stockQuantity, 10) || 0;
    const parsedLowStock = parseInt(lowStockAmount, 10) || 5;

    let stockStatus: Product['stockStatus'] = 'instock';
    if (parsedStock <= 0) stockStatus = 'outofstock';
    else if (parsedStock <= parsedLowStock) stockStatus = 'lowstock';

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const productPayload = {
      name: name.trim() || 'Untitled Product',
      sku: sku.trim() || `SKU-${Date.now().toString().slice(-4)}`,
      price: finalPrice,
      regularPrice: parsedRegular,
      salePrice: parsedSale,
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80'],
      category: category.trim() || 'General',
      tags,
      description: description.trim() || shortDescription.trim(),
      shortDescription: shortDescription.trim() || description.trim().slice(0, 100),
      stockQuantity: parsedStock,
      manageStock,
      stockStatus,
      lowStockAmount: parsedLowStock,
      allowBackorders,
      attributes,
      featured,
      rating: product?.rating || 5.0,
      reviewCount: product?.reviewCount || 1,
    };

    if (isEditing && product) {
      updateProduct(product.id, productPayload);
    } else {
      addProduct(productPayload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white text-neutral-900 rounded-xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-neutral-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50/70">
          <div>
            <h2 className="text-base font-semibold text-neutral-900">
              {isEditing ? `Edit Product: ${product.name}` : 'Add New WooCommerce Product'}
            </h2>
            <p className="text-xs text-neutral-500">
              Manage product images, pricing, inventory thresholds, and customer attributes
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1. Basic Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">
              General Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-medium text-neutral-700">Product Title *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Artisanal Linen Field Shirt"
                  className="w-full text-sm px-3 py-2 rounded-md border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-700">SKU (Stock Keeping Unit)</label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="e.g. LIN-SHRT-01"
                  className="w-full text-sm px-3 py-2 rounded-md border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-neutral-900 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-700">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-md border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-neutral-900 bg-white"
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Apparel">Apparel</option>
                  <option value="Living">Living & Home</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Wellness">Wellness & Beauty</option>
                  <option value="Stationery">Stationery</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-700">Tags (comma separated)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e.g. Handmade, Organic, Linen"
                  className="w-full text-sm px-3 py-2 rounded-md border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                />
              </div>
            </div>
          </div>

          <hr className="border-neutral-200" />

          {/* 2. Multi-Image Management */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" />
                  Product Gallery & Images ({images.length})
                </h3>
                <p className="text-[11px] text-neutral-500">
                  First image is used as the primary catalog cover. Add multiple angles or variations.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPresetPicker(!showPresetPicker)}
                className="text-xs text-neutral-700 hover:text-black font-medium flex items-center gap-1 bg-neutral-100 hover:bg-neutral-200 px-2.5 py-1 rounded"
              >
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>Preset Gallery</span>
              </button>
            </div>

            {/* Preset Picker Drawer */}
            {showPresetPicker && (
              <div className="p-3 bg-neutral-100 rounded-lg border border-neutral-200 space-y-2">
                <p className="text-xs text-neutral-600 font-medium">Click to add curated product photo:</p>
                <div className="grid grid-cols-5 gap-2">
                  {PRESET_SAMPLE_IMAGES.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setImages((prev) => [...prev, url]);
                        setShowPresetPicker(false);
                      }}
                      className="group relative aspect-square rounded overflow-hidden border border-neutral-300 hover:ring-2 hover:ring-neutral-900"
                    >
                      <img src={url} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs">
                        + Add
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Current Images List */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {images.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="relative group aspect-square rounded-lg border border-neutral-300 overflow-hidden bg-neutral-100"
                >
                  <img src={imgUrl} alt={`Product ${idx}`} className="w-full h-full object-cover" />
                  {idx === 0 && (
                    <span className="absolute top-1.5 left-1.5 bg-neutral-900/90 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                      Primary
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-1">
                    {idx !== 0 && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryImage(idx)}
                        className="bg-white/90 text-neutral-900 text-[10px] px-2 py-1 rounded hover:bg-white"
                        title="Set as primary"
                      >
                        Make Primary
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                      title="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Add Image Box */}
              <label className="cursor-pointer border-2 border-dashed border-neutral-300 hover:border-neutral-500 rounded-lg aspect-square flex flex-col items-center justify-center text-neutral-500 hover:text-neutral-800 transition-colors p-3 text-center">
                <Upload className="w-5 h-5 mb-1" />
                <span className="text-[11px] font-medium">Upload File</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            {/* Add by URL input */}
            <div className="flex gap-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Or paste external image URL (https://...)"
                className="flex-1 text-xs px-3 py-2 rounded-md border border-neutral-300 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
              />
              <button
                type="button"
                onClick={handleAddImageByUrl}
                className="px-3 py-2 bg-neutral-800 text-white rounded-md text-xs hover:bg-neutral-900 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add URL</span>
              </button>
            </div>
          </div>

          <hr className="border-neutral-200" />

          {/* 3. Pricing & Discounts */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">
              Pricing & Discounts ($ USD)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-700">Regular Price ($) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-neutral-400 text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={regularPrice}
                    onChange={(e) => setRegularPrice(e.target.value)}
                    placeholder="120.00"
                    className="w-full text-sm pl-7 pr-3 py-2 rounded-md border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-neutral-900 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-700">
                  Sale Price ($) <span className="text-neutral-400 font-normal">(optional promotion)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-neutral-400 text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    placeholder="95.00"
                    className="w-full text-sm pl-7 pr-3 py-2 rounded-md border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-neutral-900 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-neutral-200" />

          {/* 4. Inventory Management */}
          <div className="space-y-4 bg-neutral-50 p-4 rounded-lg border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                  Inventory & Stock Management
                </h3>
                <p className="text-[11px] text-neutral-500">
                  Real-time inventory deduction and low-stock alerts
                </p>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-neutral-700">
                <input
                  type="checkbox"
                  checked={manageStock}
                  onChange={(e) => setManageStock(e.target.checked)}
                  className="rounded text-neutral-900 focus:ring-neutral-900 w-4 h-4"
                />
                <span>Track Stock Quantity</span>
              </label>
            </div>

            {manageStock && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-700">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-md border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-neutral-900 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-700">Low Stock Threshold</label>
                  <input
                    type="number"
                    min="1"
                    value={lowStockAmount}
                    onChange={(e) => setLowStockAmount(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-md border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-neutral-900 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-700">Backorders</label>
                  <select
                    value={allowBackorders ? 'allow' : 'do_not_allow'}
                    onChange={(e) => setAllowBackorders(e.target.value === 'allow')}
                    className="w-full text-sm px-3 py-2 rounded-md border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-neutral-900 bg-white"
                  >
                    <option value="do_not_allow">Do Not Allow</option>
                    <option value="allow">Allow Backorders</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <hr className="border-neutral-200" />

          {/* 5. Attributes & Variations */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">
              Product Attributes (Variations)
            </h3>
            <p className="text-[11px] text-neutral-500">
              Customers can pick their preferred options during checkout (e.g. Size, Color, Switch Type).
            </p>

            <div className="space-y-2">
              {attributes.map((attr, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-neutral-100 rounded border border-neutral-200 text-xs"
                >
                  <div>
                    <span className="font-semibold text-neutral-900">{attr.name}: </span>
                    <span className="text-neutral-600">{attr.options.join(', ')}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttribute(idx)}
                    className="text-neutral-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <input
                type="text"
                placeholder="Attribute (e.g., Size)"
                value={newAttrKey}
                onChange={(e) => setNewAttrKey(e.target.value)}
                className="w-full sm:w-1/3 text-xs px-3 py-2 rounded-md border border-neutral-300 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
              />
              <input
                type="text"
                placeholder="Options separated by comma (e.g., S, M, L)"
                value={newAttrOptions}
                onChange={(e) => setNewAttrOptions(e.target.value)}
                className="w-full sm:w-2/3 text-xs px-3 py-2 rounded-md border border-neutral-300 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
              />
              <button
                type="button"
                onClick={handleAddAttribute}
                className="px-3 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-md text-xs font-medium whitespace-nowrap"
              >
                Add Option
              </button>
            </div>
          </div>

          <hr className="border-neutral-200" />

          {/* 6. Descriptions */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-700">Short Description (Summary)</label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Brief 1-2 sentence highlight for catalog cards"
                className="w-full text-sm px-3 py-2 rounded-md border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-700">Detailed Description *</label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Elaborate on materials, craftsmanship, dimensions, and maintenance..."
                className="w-full text-sm px-3 py-2 rounded-md border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-neutral-700 pt-1">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="rounded text-neutral-900 focus:ring-neutral-900 w-4 h-4"
              />
              <span>Feature this product on Storefront Hero section</span>
            </label>
          </div>
        </form>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-200 bg-neutral-50/70">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-200 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white rounded-md transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Save Changes' : 'Publish Product'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
