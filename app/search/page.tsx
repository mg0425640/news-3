'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Loader2, TrendingUp, Filter } from 'lucide-react';
import ArticleCard from '@/components/articles/ArticleCard';
import ProductCard from '@/components/products/ProductCard';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';
import { Product } from '@/lib/types';

interface DbArticle {
  id: string;
  slug: string;
  title: string;
  title_hi: string | null;
  excerpt: string;
  excerpt_hi: string | null;
  image_url: string;
  category: string;
  subcategory: string | null;
  author: string;
  published_at: string;
  read_count: number;
  like_count: number;
  share_count?: number;
}

const CATEGORY_SLUGS: Record<string, string> = {
  'Dream Meanings': 'dreams',
  'Health & Wellness': 'health',
  'Ayurveda': 'ayurveda',
  'Yoga & Meditation': 'yoga',
  'Beauty': 'beauty',
  'Nutrition': 'nutrition',
  'Spirituality': 'spirituality',
  'Home Remedies': 'home-remedies',
};

const POPULAR_SEARCHES = [
  'dream about snake', 'ashwagandha', 'yoga for back pain', 'dark circles',
  'weight loss', 'diabetes diet', 'immunity', 'turmeric benefits',
  'hair growth', 'stress relief', 'meditation', 'pranayama'
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { lang } = useLanguage();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [articles, setArticles] = useState<DbArticle[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [searchType, setSearchType] = useState<'all' | 'articles' | 'products'>('all');

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setArticles([]);
      setProducts([]);
      setTotalResults(0);
      return;
    }

    setLoading(true);
    try {
      const searchTerm = `%${searchQuery.toLowerCase()}%`;
      const selectCols = 'id,slug,title,title_hi,excerpt,excerpt_hi,image_url,category,subcategory,author,published_at,read_count,like_count,share_count';

      // Text-match query and tag-match query run in parallel, then merge & dedupe
      const textMatchQuery = supabase
        .from('articles')
        .select(selectCols)
        .eq('is_published', true)
        .or(`title.ilike.${searchTerm},excerpt.ilike.${searchTerm},category.ilike.${searchTerm},subcategory.ilike.${searchTerm}`)
        .order('read_count', { ascending: false })
        .limit(20);

      const tagMatchQuery = supabase
        .from('articles')
        .select(selectCols)
        .eq('is_published', true)
        .contains('tags', [searchQuery.toLowerCase()])
        .order('read_count', { ascending: false })
        .limit(20);

      // Search products
      const productQuery = supabase
        .from('products')
        .select('id,slug,name,price,original_price,image_url,category,rating,review_count,badge,discount,in_stock')
        .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},category.ilike.${searchTerm}`)
        .limit(10);

      const [textRes, tagRes, productRes] = await Promise.all([textMatchQuery, tagMatchQuery, productQuery]);

      // Merge text and tag results, deduping by id
      const articleMap = new Map<string, DbArticle>();
      for (const a of (textRes.data as DbArticle[]) || []) articleMap.set(a.id, a);
      for (const a of (tagRes.data as DbArticle[]) || []) if (!articleMap.has(a.id)) articleMap.set(a.id, a);
      const mergedArticles = Array.from(articleMap.values()).sort((a, b) => b.read_count - a.read_count).slice(0, 20);

      setArticles(mergedArticles);

      if (productRes.data) {
        setProducts(productRes.data.map(p => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          price: Number(p.price),
          originalPrice: p.original_price ? Number(p.original_price) : undefined,
          image: p.image_url,
          category: p.category,
          rating: Number(p.rating),
          reviews: p.review_count,
          badge: p.badge as 'NEW' | 'SALE' | 'HOT' | undefined,
          discount: p.discount || undefined,
          inStock: p.in_stock,
          tags: [],
        })));
      }

      setTotalResults(mergedArticles.length + (productRes.data?.length || 0));
    } catch (e) {
      console.error('Search error:', e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery, performSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      performSearch(query.trim());
    }
  };

  const getCategorySlug = (category: string) => CATEGORY_SLUGS[category] || category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');

  const filteredArticles = searchType === 'products' ? [] : articles;
  const filteredProducts = searchType === 'articles' ? [] : products;

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-[#F8F8F8] border-b border-[#E8E8E8] py-3">
        <div className="max-w-7xl mx-auto px-4 text-xs font-body text-[#999]">
          <Link href="/" className="hover:text-brand">Home</Link>
          <span className="mx-2">›</span>
          <span className="text-[#111]">{lang === 'hi' ? 'खोजें' : 'Search'}</span>
          {initialQuery && <><span className="mx-2">›</span><span className="text-brand">"{initialQuery}"</span></>}
        </div>
      </div>

      {/* Search Hero */}
      <section className="bg-[#111] text-white py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-6">
            {lang === 'hi' ? 'कुछ भी खोजें' : 'Search Anything'}
          </h1>

          <form onSubmit={handleSubmit} className="relative flex">
            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#666] z-10" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              placeholder={lang === 'hi' ? 'स्वप्न, आयुर्वेद, योग, उत्पाद खोजें...' : 'Search dreams, Ayurveda, yoga, products...'}
              className="flex-1 pl-12 pr-4 py-4 bg-white text-[#111] border-0 text-sm focus:outline-none focus:ring-2 focus:ring-brand font-body"
            />
            <button type="submit" className="px-8 bg-brand text-white text-sm font-semibold hover:bg-[#C93D0E] transition-colors">
              {lang === 'hi' ? 'खोजें' : 'Search'}
            </button>
          </form>

          {/* Popular Searches */}
          <div className="mt-6">
            <p className="text-xs text-[#999] mb-2 flex items-center justify-center gap-1">
              <TrendingUp size={12} /> {lang === 'hi' ? 'लोकप्रिय खोजें:' : 'Popular Searches:'}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {POPULAR_SEARCHES.slice(0, 8).map((term) => (
                <Link
                  key={term}
                  href={`/search?q=${encodeURIComponent(term)}`}
                  className="text-xs px-3 py-1.5 bg-[#222] border border-[#333] text-white/80 hover:border-brand hover:text-brand transition-all font-body"
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-brand" />
          </div>
        ) : !initialQuery ? (
          <div className="text-center py-16">
            <Search size={48} className="mx-auto text-[#DDD] mb-4" />
            <h2 className="font-display text-xl font-semibold text-[#111] mb-2">
              {lang === 'hi' ? 'क्या खोजना चाहते हैं?' : 'What would you like to find?'}
            </h2>
            <p className="text-[#666] font-body">
              {lang === 'hi' ? 'स्वप्न अर्थ, आयुर्वेद, योग, स्वास्थ्य लेख और उत्पाद खोजें।' : 'Search for dream meanings, Ayurveda, yoga, health articles, and products.'}
            </p>
          </div>
        ) : totalResults === 0 ? (
          <div className="text-center py-16">
            <Search size={48} className="mx-auto text-[#DDD] mb-4" />
            <h2 className="font-display text-xl font-semibold text-[#111] mb-2">
              {lang === 'hi' ? `"${initialQuery}" के लिए कोई परिणाम नहीं` : `No results for "${initialQuery}"`}
            </h2>
            <p className="text-[#666] font-body mb-6">
              {lang === 'hi' ? 'अलग शब्दों से खोजने का प्रयास करें।' : 'Try different keywords or check spelling.'}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {POPULAR_SEARCHES.slice(0, 4).map((term) => (
                <Link
                  key={term}
                  href={`/search?q=${encodeURIComponent(term)}`}
                  className="text-xs px-3 py-1.5 bg-[#F8F8F8] border border-[#E8E8E8] text-[#555] hover:border-brand hover:text-brand transition-all font-body"
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Filter Tabs */}
            <div className="flex items-center gap-4 mb-6 border-b border-[#E8E8E8] pb-4">
              <span className="text-sm text-[#666] font-body flex items-center gap-1">
                <Filter size={14} /> {lang === 'hi' ? 'फ़िल्टर:' : 'Filter:'}
              </span>
              <button
                onClick={() => setSearchType('all')}
                className={`px-4 py-1.5 text-sm font-semibold font-body transition-all ${searchType === 'all' ? 'bg-brand text-white' : 'bg-[#F8F8F8] border border-[#E8E8E8] hover:border-brand'}`}
              >
                {lang === 'hi' ? 'सभी' : 'All'} ({totalResults})
              </button>
              <button
                onClick={() => setSearchType('articles')}
                className={`px-4 py-1.5 text-sm font-semibold font-body transition-all ${searchType === 'articles' ? 'bg-brand text-white' : 'bg-[#F8F8F8] border border-[#E8E8E8] hover:border-brand'}`}
              >
                {lang === 'hi' ? 'लेख' : 'Articles'} ({articles.length})
              </button>
              <button
                onClick={() => setSearchType('products')}
                className={`px-4 py-1.5 text-sm font-semibold font-body transition-all ${searchType === 'products' ? 'bg-brand text-white' : 'bg-[#F8F8F8] border border-[#E8E8E8] hover:border-brand'}`}
              >
                {lang === 'hi' ? 'उत्पाद' : 'Products'} ({products.length})
              </button>
            </div>

            {/* Articles Results */}
            {filteredArticles.length > 0 && (
              <div className="mb-12">
                <h2 className="font-display text-xl font-bold text-[#111] mb-6 flex items-center gap-2">
                  📚 {lang === 'hi' ? 'लेख' : 'Articles'}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredArticles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              </div>
            )}

            {/* Products Results */}
            {filteredProducts.length > 0 && (
              <div>
                <h2 className="font-display text-xl font-bold text-[#111] mb-6 flex items-center gap-2">
                  🛍️ {lang === 'hi' ? 'उत्पाद' : 'Products'}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
