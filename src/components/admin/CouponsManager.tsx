import React, { useState } from 'react';
import { useCommerce } from '../../context/CommerceContext';
import { Tag, Plus, Trash2, CheckCircle2, Ticket } from 'lucide-react';

export const CouponsManager: React.FC = () => {
  const { coupons, addCoupon, deleteCoupon } = useCommerce();

  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [amount, setAmount] = useState('');
  const [minSpend, setMinSpend] = useState('');
  const [description, setDescription] = useState('');

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !amount) return;

    addCoupon({
      code: code.trim(),
      discountType,
      amount: parseFloat(amount) || 0,
      minSpend: minSpend ? parseFloat(minSpend) : undefined,
      description: description.trim() || `${amount}${discountType === 'percentage' ? '%' : '$'} discount coupon`,
    });

    setCode('');
    setAmount('');
    setMinSpend('');
    setDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
            <Tag className="w-5 h-5 text-neutral-800" />
            <span>Coupons & Discount Promotions</span>
          </h2>
          <p className="text-xs text-neutral-500">
            Create promotional codes applied seamlessly during shopper cart checkout.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Form */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-4">
          <h3 className="text-xs font-semibold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Create Promotional Code
          </h3>

          <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="font-medium text-neutral-700">Coupon Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. SPRING25"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 rounded-md border border-neutral-300 font-mono uppercase"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-medium text-neutral-700">Discount Type</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                  className="w-full px-3 py-2 rounded-md border border-neutral-300 bg-white"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Cart ($)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-neutral-700">Discount Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder={discountType === 'percentage' ? '15' : '20.00'}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-neutral-300 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-medium text-neutral-700">
                Minimum Spend ($) <span className="text-neutral-400 font-normal">(optional)</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="50.00"
                value={minSpend}
                onChange={(e) => setMinSpend(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-neutral-300 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-medium text-neutral-700">Promo Description</label>
              <input
                type="text"
                placeholder="e.g. 15% off seasonal spring arrival items"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-neutral-300"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-neutral-900 text-white rounded font-medium hover:bg-neutral-800 transition-colors mt-2"
            >
              Publish Coupon
            </button>
          </form>
        </div>

        {/* Active Coupons List */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
              <Ticket className="w-3.5 h-3.5" />
              Active Coupons in Store ({coupons.length})
            </h3>
          </div>

          <div className="divide-y divide-neutral-200 text-xs">
            {coupons.map((c) => (
              <div key={c.id} className="p-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                      {c.code}
                    </span>
                    <span className="text-neutral-500 font-medium">
                      {c.discountType === 'percentage' ? `${c.amount}% Discount` : `$${c.amount} Off`}
                    </span>
                    {c.minSpend && (
                      <span className="text-[11px] text-neutral-400">
                        (Min. order ${c.minSpend.toFixed(2)})
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-500">{c.description}</p>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <span className="text-[11px] text-neutral-500 font-mono">
                    Used {c.usageCount} time{c.usageCount === 1 ? '' : 's'}
                  </span>
                  <button
                    onClick={() => deleteCoupon(c.id)}
                    className="p-1 text-neutral-400 hover:text-red-600 rounded transition-colors"
                    title="Delete coupon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
