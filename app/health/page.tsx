'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Search, Filter, ChevronLeft, ChevronRight, Clock, Sparkles } from 'lucide-react';
import AdBanner from '@/components/ads/AdBanner';
import Sidebar from '@/components/layout/Sidebar';
import { createClient } from '@supabase/supabase-js';
import { useLanguage } from '@/context/LanguageContext';

const POSTS_OPTIONS = [20, 40, 60, 100];

const SUBCATEGORIES_CONFIG = [
  { key: 'All', en: 'All', hi: 'सभी' },
  { key: 'Nutrition', en: 'Nutrition & Diet', hi: 'पोषण एवं आहार' },
  { key: 'Diseases', en: 'Diseases & Conditions', hi: 'रोग एवं निदान' },
  { key: 'Mental Health', en: 'Mental Wellness', hi: 'मानसिक स्वास्थ्य' },
  { key: 'Fitness', en: 'Fitness & Exercise', hi: 'फिटネス एवं व्यायाम' },
  { key: 'Lifestyle', en: 'Healthy Lifestyle', hi: 'जीवनशैली' },
  { key: 'Ayurveda', en: 'Ayurveda & Home Remedies', hi: 'आयुर्वेद एवं घरेलू उपाय' },
];

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface AdItem {
  id: string;
  image_url: string;
  target_url: string;
  title?: string;
}

export default function HealthPage() {
  const { lang } = useLanguage();
  const isHi = lang === 'hi';

  const [posts, setPosts] = useState<any[]>([]);
  const [dbAds, setDbAds] = useState<AdItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subcatKey, setSubcatKey] = useState('All');
  const [perPage, setPerPage] = useState(20);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('newest');

  const t = {
    breadcrumbHome: isHi ? 'होम' : 'Home',
    breadcrumbHealth: isHi ? 'स्वास्थ्य एवं वेलनेस' : 'Health & Wellness',
    badge: isHi ? '🏥 स्वास्थ्य एवं चिकित्सा' : '🏥 Medical & Health Guide',
    pageTitle: isHi ? 'स्वास्थ्य एवं वेलनेस ज्ञानकोश' : 'Health & Clinical Care Encyclopedia',
    pageDesc: isHi
      ? 'रोगों के लक्षण, घरेलू उपचार, पोषण, फिटनेस और विशेषज्ञ चिकित्सा सलाह की जानकारी प्राप्त करें।'
      : 'Explore medical guides, clinical Insights, nutrition advice, disease prevention, and wellness tips.',
    searchPlaceholder: isHi ? 'स्वास्थ्य संबंधी विषय या लक्षण खोजें...' : 'Search health conditions, symptoms & tips...',
    show: isHi ? 'दिखाएं:' : 'Show:',
    postsLabel: isHi ? 'लेख' : 'posts',
    newest: isHi ? 'नवीनतम' : 'Newest First',
    popular: isHi ? 'लोकप्रिय' : 'Most Popular',
    az: isHi ? 'अ → ज' : 'A → Z',
    showing: isHi ? 'दिखा रहा है' : 'Showing',
    of: isHi ? 'में से' : 'of',
    healthCount: isHi ? 'लेख' : 'articles',
    lucky: isHi ? 'स्वास्थ्य कोड' : 'Health Tip',
    read: isHi ? 'पढ़ें →' : 'Read →',
    noResults: isHi ? 'आपकी खोज के अनुसार कोई स्वास्थ्य लेख नहीं मिला।' : 'No health articles found matching your criteria.',
    loadingText: isHi ? 'स्वास्थ्य गाइड लोड हो रही है...' : 'Loading health & medical articles...',
    minRead: isHi ? 'मिनट' : 'min',
    promotedTitle: isHi ? 'प्रमुख स्वास्थ्य गाइड' : 'Featured Medical Articles',
    sponsor: isHi ? 'प्रायोजित' : 'Sponsor',
  };

  // Fetch articles and Database Ads from Supabase
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      
      // Fetch Health Category Articles
      let query = supabase
        .from('articles')
        .select('*')
        .eq('category', 'health')
        .eq('is_published', true);

      if (sortBy === 'newest') {
        query = query.order('published_at', { ascending: false });
      } else if (sortBy === 'popular') {
        query = query.order('read_count', { ascending: false });
      } else if (sortBy === 'az') {
        query = query.order('title', { ascending: true });
      }

      const { data: articlesData, error: articlesError } = await query;
      if (articlesError) console.error('Error fetching articles:', articlesError);
      else setPosts(articlesData || []);

      // Fetch Ads from 'ads' table
      const { data: adsData, error: adsError } = await supabase
        .from('ads')
        .select('*')
        .eq('is_active', true)
        .limit(3); // Fetching unique items to distribute across layout banners

      if (adsError) console.error('Error fetching ads:', adsError);
      else setDbAds(adsData || []);

      setLoading(false);
    }

    fetchData();
  }, [sortBy]);

  // Client-side filtering
  const filtered = useMemo(() => {
    let result = [...posts];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => {
        const titleMatch = (p.title?.toLowerCase() || '').includes(q) || (p.title_hi?.toLowerCase() || '').includes(q);
        const excerptMatch = (p.excerpt?.toLowerCase() || '').includes(q) || (p.excerpt_hi?.toLowerCase() || '').includes(q);
        const tagMatch = (p.tags || []).some((tag: string) => tag.toLowerCase().includes(q));
        return titleMatch || excerptMatch || tagMatch;
      });
    }

    if (subcatKey !== 'All') {
      result = result.filter(
        (p) =>
          p.subcategory?.toLowerCase() === subcatKey.toLowerCase() ||
          (p.tags || []).map((t: string) => t.toLowerCase()).includes(subcatKey.toLowerCase())
      );
    }

    return result;
  }, [posts, search, subcatKey]);

  const totalPages = Math.ceil(filtered.length / perPage) || 1;
  const pagePosts = filtered.slice((page - 1) * perPage, page * perPage);

  // Slicing post segments for layout balance
  const heroPost = pagePosts[0];
  const rightListPosts = pagePosts.slice(1, 5);
  const fourSquarePosts1 = pagePosts.slice(5, 9);
  const sixGridPosts = pagePosts.slice(9, 15);
  const twoLargePosts = pagePosts.slice(15, 17);
  const promotedPosts = pagePosts.slice(17, 19);
  const fourSquarePosts2 = pagePosts.slice(19, 23);

  const defaultHealthImage = 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80';

  // Sub-component to cleanly render unique Database Ads without interval rotation
  const RenderDbAdLayout = ({ ad }: { ad?: AdItem }) => {
    if (!ad) return null;
    return (
      <div className="mb-10 p-3 bg-[#F8F8F8] border border-[#E8E8E8] text-center">
        <a href={ad.target_url} target="_blank" rel="noopener noreferrer" className="block relative">
          <span className="absolute top-2 right-2 bg-black/60 text-white text-[9px] uppercase px-1.5 py-0.5 font-body">
            {t.sponsor}
          </span>
          <img
            src={ad.image_url}
            alt={ad.title || 'Sponsored Advertisement'}
            className="w-full max-h-36 object-cover mx-auto"
          />
        </a>
      </div>
    );
  };

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-[#F8F8F8] border-b border-[#E8E8E8] py-3">
        <div className="max-w-7xl mx-auto px-4 text-xs font-body text-[#999]">
          <Link href="/" className="hover:text-brand">{t.breadcrumbHome}</Link>
          <span className="mx-2">›</span>
          <span className="text-[#111]">{t.breadcrumbHealth}</span>
        </div>
      </div>

      {/* Page Header */}
      <div className="bg-[#111] text-white py-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <span className="tag-pill mb-3 inline-block">{t.badge}</span>
          <h1 className="font-display text-white text-3xl md:text-4xl font-bold mb-3">{t.pageTitle}</h1>
          <p className="text-[#AAA] font-body max-w-2xl mx-auto">{t.pageDesc}</p>
        </div>
      </div>

      {/* Top Google Ad */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <AdBanner slot="health-top" size="leaderboard" />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Main Content Stream */}
          <div className="flex-1 min-w-0">

            {/* Filters Bar */}
            <div className="bg-[#F8F8F8] border border-[#E8E8E8] p-4 mb-8">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    placeholder={t.searchPlaceholder}
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E8E8E8] text-sm focus:outline-none focus:border-brand font-body"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#999] font-body whitespace-nowrap">{t.show}</span>
                  <select
                    value={perPage}
                    onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
                    className="px-3 py-2 border border-[#E8E8E8] text-sm bg-white focus:outline-none focus:border-brand font-body"
                  >
                    {POSTS_OPTIONS.map((n) => (
                      <option key={n} value={n}>{n} {t.postsLabel}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <Filter size={14} className="text-[#999]" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-[#E8E8E8] text-sm bg-white focus:outline-none focus:border-brand font-body"
                  >
                    <option value="newest">{t.newest}</option>
                    <option value="popular">{t.popular}</option>
                    <option value="az">{t.az}</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-[#E8E8E8]">
                {SUBCATEGORIES_CONFIG.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => { setSubcatKey(cat.key); setPage(1); }}
                    className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-all font-body ${
                      subcatKey === cat.key
                        ? 'bg-brand text-white'
                        : 'bg-white border border-[#E8E8E8] text-[#555] hover:border-brand hover:text-brand'
                    }`}
                  >
                    {isHi ? cat.hi : cat.en}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <p className="text-center text-sm text-[#777] py-12 font-body">{t.loadingText}</p>
            ) : filtered.length === 0 ? (
              <p className="text-center text-sm text-[#777] py-12 font-body">{t.noResults}</p>
            ) : (
              <>
                {/* 1. HERO SECTION: Left Big Post + Right 4 Small Image List */}
                {heroPost && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-10 pb-8 border-b border-[#E8E8E8]">
                    {/* Big Post (Left 7 cols) */}
                    <div className="md:col-span-7 group">
                      <Link href={`/health/${heroPost.slug}${isHi ? '?lang=hi' : ''}`}>
                        <div className="overflow-hidden mb-3 relative aspect-[16/10]">
                          <img
                            src={heroPost.image_url || defaultHealthImage}
                            alt={isHi && heroPost.title_hi ? heroPost.title_hi : heroPost.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {heroPost.lucky_number && (
                            <span className="absolute top-3 left-3 bg-brand text-white text-xs font-bold px-2.5 py-1">
                              {t.lucky}: {heroPost.lucky_number}
                            </span>
                          )}
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold font-display text-[#111] group-hover:text-brand transition-colors line-clamp-2">
                          {isHi && heroPost.title_hi ? heroPost.title_hi : heroPost.title}
                        </h2>
                        <p className="text-sm text-[#666] font-body line-clamp-3 mt-2">
                          {isHi && heroPost.excerpt_hi ? heroPost.excerpt_hi : heroPost.excerpt}
                        </p>
                      </Link>
                    </div>

                    {/* 4 Small List View Posts (Right 5 cols) */}
                    <div className="md:col-span-5 flex flex-col gap-4">
                      {rightListPosts.map((post) => (
                        <Link
                          key={post.id}
                          href={`/health/${post.slug}${isHi ? '?lang=hi' : ''}`}
                          className="group flex gap-3 pb-3 border-b border-[#F0F0F0] last:border-0"
                        >
                          <img
                            src={post.image_url || defaultHealthImage}
                            alt={isHi && post.title_hi ? post.title_hi : post.title}
                            className="w-20 h-20 object-cover flex-shrink-0 group-hover:opacity-90"
                          />
                          <div className="flex-1">
                            <h3 className="text-xs font-semibold font-body text-[#111] group-hover:text-brand line-clamp-2">
                              {isHi && post.title_hi ? post.title_hi : post.title}
                            </h3>
                            <span className="text-[10px] text-[#999] flex items-center gap-1 mt-1 font-body">
                              <Clock size={10} /> {post.read_time || 5} {t.minRead}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. DATABASE AD WIDGET 1 (Displays DB Ad Array Index 0) */}
                <RenderDbAdLayout ad={dbAds[0]} />

                {/* 3. SECTION: 4 Square Posts */}
                {fourSquarePosts1.length > 0 && (
                  <div className="mb-10 pb-8 border-b border-[#E8E8E8]">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {fourSquarePosts1.map((post) => (
                        <Link key={post.id} href={`/health/${post.slug}${isHi ? '?lang=hi' : ''}`} className="group block">
                          <div className="aspect-square overflow-hidden mb-2 relative">
                            <img
                              src={post.image_url || defaultHealthImage}
                              alt={isHi && post.title_hi ? post.title_hi : post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <h3 className="text-xs font-semibold font-body text-[#111] group-hover:text-brand line-clamp-2">
                            {isHi && post.title_hi ? post.title_hi : post.title}
                          </h3>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. SECTION: Card Grid (2 Rows x 3 Columns) */}
                {sixGridPosts.length > 0 && (
                  <div className="mb-10 pb-8 border-b border-[#E8E8E8]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {sixGridPosts.map((post) => (
                        <Link key={post.id} href={`/health/${post.slug}${isHi ? '?lang=hi' : ''}`} className="group block border border-[#E8E8E8] bg-white p-3">
                          <div className="aspect-[16/10] overflow-hidden mb-3">
                            <img
                              src={post.image_url || defaultHealthImage}
                              alt={isHi && post.title_hi ? post.title_hi : post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <h3 className="text-sm font-bold font-body text-[#111] group-hover:text-brand line-clamp-2">
                            {isHi && post.title_hi ? post.title_hi : post.title}
                          </h3>
                          <p className="text-xs text-[#777] font-body line-clamp-2 mt-1">
                            {isHi && post.excerpt_hi ? post.excerpt_hi : post.excerpt}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* DATABASE AD WIDGET 2 (Displays DB Ad Array Index 1) */}
                <RenderDbAdLayout ad={dbAds[1]} />

                {/* 5. SECTION: 2 Posts in a Row (Large Size) */}
                {twoLargePosts.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 pb-8 border-b border-[#E8E8E8]">
                    {twoLargePosts.map((post) => (
                      <Link key={post.id} href={`/health/${post.slug}${isHi ? '?lang=hi' : ''}`} className="group block">
                        <div className="aspect-[16/9] overflow-hidden mb-3">
                          <img
                            src={post.image_url || defaultHealthImage}
                            alt={isHi && post.title_hi ? post.title_hi : post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <h3 className="text-lg font-bold font-display text-[#111] group-hover:text-brand line-clamp-2">
                          {isHi && post.title_hi ? post.title_hi : post.title}
                        </h3>
                        <p className="text-xs text-[#666] font-body line-clamp-2 mt-1">
                          {isHi && post.excerpt_hi ? post.excerpt_hi : post.excerpt}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}

                {/* 6. GOOGLE AD BANNER */}
                <div className="my-8">
                  <AdBanner slot="health-infeed-1" size="leaderboard" />
                </div>

                {/* 7. SECTION: Promoted Articles */}
                {promotedPosts.length > 0 && (
                  <div className="bg-[#FFFDF5] border border-[#F5E6B3] p-6 mb-10">
                    <div className="flex items-center gap-2 mb-4 text-brand font-semibold text-sm">
                      <Sparkles size={16} />
                      <span>{t.promotedTitle}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {promotedPosts.map((post) => (
                        <Link key={post.id} href={`/health/${post.slug}${isHi ? '?lang=hi' : ''}`} className="group flex gap-4">
                          <img
                            src={post.image_url || defaultHealthImage}
                            alt={isHi && post.title_hi ? post.title_hi : post.title}
                            className="w-24 h-24 object-cover flex-shrink-0"
                          />
                          <div>
                            <h4 className="text-sm font-bold font-body text-[#111] group-hover:text-brand line-clamp-2">
                              {isHi && post.title_hi ? post.title_hi : post.title}
                            </h4>
                            <p className="text-xs text-[#666] font-body line-clamp-2 mt-1">
                              {isHi && post.excerpt_hi ? post.excerpt_hi : post.excerpt}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* DATABASE AD WIDGET 3 (Displays DB Ad Array Index 2) */}
                <RenderDbAdLayout ad={dbAds[2]} />

                <div className="my-8">
                  <AdBanner slot="health-infeed-2" size="leaderboard" />
                </div>

                {/* 8. SECTION: Final 4 Square Posts */}
                {fourSquarePosts2.length > 0 && (
                  <div className="mb-10">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {fourSquarePosts2.map((post) => (
                        <Link key={post.id} href={`/health/${post.slug}${isHi ? '?lang=hi' : ''}`} className="group block">
                          <div className="aspect-square overflow-hidden mb-2">
                            <img
                              src={post.image_url || defaultHealthImage}
                              alt={isHi && post.title_hi ? post.title_hi : post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <h3 className="text-xs font-semibold font-body text-[#111] group-hover:text-brand line-clamp-2">
                            {isHi && post.title_hi ? post.title_hi : post.title}
                          </h3>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1 mt-8">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="page-num disabled:opacity-30 disabled:cursor-not-allowed border px-3 py-1"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i + 1)}
                        className={`page-num border px-3 py-1 ${page === i + 1 ? 'bg-brand text-white' : ''}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="page-num disabled:opacity-30 disabled:cursor-not-allowed border px-3 py-1"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </>
            )}

          </div>

          {/* Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="sticky-sidebar">
              <Sidebar />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Ad */}
      <div className="max-w-7xl mx-auto px-4 py-4 pb-8">
        <AdBanner slot="health-bottom" size="leaderboard" />
      </div>
    </>
  );
}