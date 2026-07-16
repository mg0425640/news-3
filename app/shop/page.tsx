'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import AdBanner from '@/components/ads/AdBanner';
import { products } from '@/lib/data';

const shopCategories = ['All', 'Supplements', 'Hair Care', 'Skin Care', 'Yoga Accessories', 'Organic Foods', 'Spirituality', 'Wellness'];

const sortOptions = [
  { label: 'Default Sorting', value: 'default' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Best Rated', value: 'rating' },
  { label: 'Most Reviews', value: 'reviews' },
  { label: 'Newest', value: 'newest' },
];

export default function ShopPage() {
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('default');
  const [priceMax, setPriceMax] = useState(2000);

  const filtered = useMemo(() => {
    let items = [...products];
    if (category !== 'All') items = items.filter((p) => p.category === category);
    items = items.filter((p) => p.price <= priceMax);
    switch (sort) {
      case 'price-asc': items.sort((a, b) => a.price - b.price); break;
      case 'price-desc': items.sort((a, b) => b.price - a.price); break;
      case 'rating': items.sort((a, b) => b.rating - a.rating); break;
      case 'reviews': items.sort((a, b) => b.reviews - a.reviews); break;
    }
    return items;
  }, [category, sort, priceMax]);

  return (
    <>
      <div className="bg-[#F8F8F8] border-b border-[#E8E8E8] py-3">
        <div className="max-w-7xl mx-auto px-4 text-xs font-body text-[#999]">
          <Link href="/" className="hover:text-brand">Home</Link>
          <span className="mx-2">›</span>
          <span className="text-[#111]">Shop</span>
        </div>
      </div>

      <div className="bg-[#111] text-white py-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <span className="text-3xl mb-3 block">🛒</span>
          <h1 className="font-display text-3xl text-white md:text-4xl font-bold mb-3">Wellness Shop</h1>
          <p className="text-[#AAA] font-body max-w-2xl mx-auto">
            Curated Ayurvedic supplements, natural beauty products, yoga accessories, and organic foods — all carefully selected for quality and authenticity.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        <AdBanner slot="shop-top" size="leaderboard" />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-56 flex-shrink-0">
            <div className="border border-[#E8E8E8] p-4 mb-4">
              <h3 className="font-body text-[11px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                <SlidersHorizontal size={12} />
                Categories
              </h3>
              {shopCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`block w-full text-left py-2 text-sm font-body border-b border-[#F5F5F5] last:border-0 transition-colors ${
                    category === cat ? 'text-brand font-semibold' : 'text-[#555] hover:text-brand'
                  }`}
                >
                  {cat}
                  <span className="float-right text-[#AAA] text-xs">
                    {cat === 'All' ? products.length : products.filter((p) => p.category === cat).length}
                  </span>
                </button>
              ))}
            </div>

            {/* Price Filter */}
            <div className="border border-[#E8E8E8] p-4 mb-4">
              <h3 className="font-body text-[11px] font-bold uppercase tracking-widest mb-3">Price Range</h3>
              <input
                type="range"
                min="100"
                max="2000"
                step="50"
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-full accent-brand"
              />
              <div className="flex justify-between text-xs text-[#999] font-body mt-1">
                <span>₹100</span>
                <span className="font-semibold text-[#111]">Up to ₹{priceMax.toLocaleString()}</span>
              </div>
            </div>

            {/* Badge Filter */}
            <div className="border border-[#E8E8E8] p-4">
              <h3 className="font-body text-[11px] font-bold uppercase tracking-widest mb-3">Offers</h3>
              {['NEW', 'SALE', 'HOT'].map((badge) => (
                <label key={badge} className="flex items-center gap-2 py-1.5 cursor-pointer text-sm text-[#555] hover:text-brand font-body">
                  <input type="checkbox" className="accent-brand" />
                  {badge}
                  <span className="text-[#AAA] text-xs">({products.filter((p) => p.badge === badge).length})</span>
                </label>
              ))}
            </div>
          </div>

          {/* Products */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E8E8E8]">
              <p className="text-sm text-[#666] font-body">
                Showing <span className="font-semibold text-[#111]">{filtered.length}</span> of{' '}
                <span className="font-semibold text-[#111]">{products.length}</span> products
              </p>
              <div className="flex items-center gap-2">
                <ChevronDown size={14} className="text-[#999]" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="px-3 py-2 border border-[#E8E8E8] text-sm bg-white focus:outline-none focus:border-brand font-body"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16 text-[#999] font-body">
                <p className="text-lg mb-2">No products found</p>
                <p className="text-sm">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            <AdBanner slot="shop-infeed" size="leaderboard" className="mt-10" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 pb-8">
        <AdBanner slot="shop-bottom" size="leaderboard" />
      </div>
    </>
  );
}
