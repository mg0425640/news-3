'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, Facebook, Twitter, Instagram } from 'lucide-react';
import AdBanner from '../ads/AdBanner';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';

interface StoryArticle {
  id: string;
  slug: string;
  title: string;
  title_hi: string | null;
  category: string;
  published_at: string;
  comments_count?: number;
}

interface DbAd {
  id: string;
  image_url: string;
  target_url: string;
  title?: string;
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

const CATEGORIES = [
  { name: 'Dream Meanings', name_hi: 'स्वप्न अर्थ', slug: 'dreams', icon: '🌙' },
  { name: 'Health & Wellness', name_hi: 'स्वास्थ्य एवं कल्याण', slug: 'health', icon: '❤️' },
  { name: 'Ayurveda', name_hi: 'आयुर्वेद', slug: 'ayurveda', icon: '🌿' },
  { name: 'Yoga & Meditation', name_hi: 'योग एवं ध्यान', slug: 'yoga', icon: '🧘' },
  { name: 'Beauty', name_hi: 'सौंदर्य', slug: 'beauty', icon: '💄' },
  { name: 'Nutrition', name_hi: 'पोषण', slug: 'nutrition', icon: '🥗' },
  { name: 'Spirituality', name_hi: 'अध्यात्म', slug: 'spirituality', icon: '🙏' },
  { name: 'Home Remedies', name_hi: 'घरेलू उपचार', slug: 'home-remedies', icon: '🏠' },
];

export default function Sidebar() {
  const { lang } = useLanguage();
  const [latestStories, setLatestStories] = useState<StoryArticle[]>([]);
  const [dbAds, setDbAds] = useState<DbAd[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSidebarData();
  }, []);

  const loadSidebarData = async () => {
    try {
      setLoading(true);

      // Fetch Latest Stories
      const { data: articlesData } = await supabase
        .from('articles')
        .select('id, slug, title, title_hi, category, published_at')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(4);

      if (articlesData) setLatestStories(articlesData as StoryArticle[]);

      // Fetch 3 Ads from Supabase 'ads' table
      const { data: adsData } = await supabase
        .from('ads')
        .select('id, image_url, target_url, title')
        .eq('is_active', true)
        .limit(3);

      if (adsData) setDbAds(adsData as DbAd[]);
    } catch (e) {
      console.error('Error loading sidebar data:', e);
    }
    setLoading(false);
  };

  const getCategorySlug = (category: string) => CATEGORY_SLUGS[category] || category.toLowerCase();

  const getRelativeTime = (dateString: string) => {
    const pubDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - pubDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (lang === 'hi') {
      if (diffDays === 0) return 'आज';
      return `${diffDays} दिन पहले`;
    }

    if (diffDays === 0) return 'Today';
    return `${diffDays} days ago`;
  };

  const t = {
    latestStories: lang === 'hi' ? 'नवीनतम कहानियाँ' : 'Latest Stories',
    categories: lang === 'hi' ? 'श्रेणियाँ' : 'Categories',
    popularTags: lang === 'hi' ? 'लोकप्रिय टैग' : 'Popular Tags',
    newsletterTitle: lang === 'hi' ? 'हमारे न्यूज़लेटर से जुड़ें' : 'Join Our Newsletter',
    newsletterDesc: lang === 'hi'
      ? 'नवीनतम समाचार प्राप्त करने के लिए हमारे मुफ्त न्यूज़लेटर के लिए साइन अप करें। चिंता न करें हम स्पैम नहीं करेंगे।'
      : 'Sign up for our free newsletters to receive the latest news. Don\'t worry we won\'t do spam.',
    emailPlaceholder: lang === 'hi' ? 'आपका ईमेल पता' : 'Enter Your Email Address',
    subscribe: lang === 'hi' ? 'सब्सक्राइब करें' : 'SUBSCRIBE',
    comments: lang === 'hi' ? 'कमेंट्स' : 'comments',
    fbFollowers: lang === 'hi' ? '25k लाइक्स' : '25k likes',
    twFollowers: lang === 'hi' ? '31k फॉलोअर्स' : '31k followers',
    igFollowers: lang === 'hi' ? '31k फॉलोअर्स' : '31k followers',
    sponsor: lang === 'hi' ? 'प्रायोजित' : 'Sponsor',
  };

  const tags = lang === 'hi'
    ? ['आयुर्वेद', 'सपने', 'योग', 'ध्यान', 'अश्वगंधा', 'इम्युनिटी', 'मधुमेह', 'वजन घटाना', 'त्वचा', 'बाल', 'तनाव', 'घरेलू उपचार', 'अध्यात्म', 'पोषण']
    : ['ayurveda', 'dreams', 'yoga', 'meditation', 'ashwagandha', 'immunity', 'diabetes', 'weight loss', 'skin care', 'hair fall', 'stress', 'home remedies', 'spirituality', 'nutrition'];

  // Sub-component for rendering Database Ads cleanly
  const RenderDbAd = ({ ad }: { ad?: DbAd }) => {
    if (!ad) return null;
    return (
      <div className="bg-[#FAF9F9] p-2 border border-[#F0F0F0] text-center relative">
        <span className="absolute top-3 right-3 bg-black/60 text-white text-[9px] uppercase px-1.5 py-0.5 font-body">
          {t.sponsor}
        </span>
        <a href={ad.target_url} target="_blank" rel="noopener noreferrer" className="block">
          <img
            src={ad.image_url}
            alt={ad.title || 'Advertisement'}
            className="w-full h-auto max-h-60 object-cover mx-auto"
          />
        </a>
      </div>
    );
  };

  return (
    <aside className="w-full space-y-6">

      {dbAds.length > 0 && (
        <RenderDbAd ad={dbAds[0]} />
      )}

      {/* 1. SOCIAL MEDIA WIDGET */}
      <div className="grid grid-cols-3 gap-1 bg-[#FAF9F9] p-3 text-center border border-[#F0F0F0]">
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center py-3 hover:bg-white transition-colors">
          <Facebook size={20} className="text-[#1877F2] mb-1" />
          <span className="text-xs font-semibold text-[#333] font-body lowercase">facebook</span>
          <span className="text-[11px] text-[#A0A0A0] font-body mt-0.5">{t.fbFollowers}</span>
        </a>

        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center py-3 hover:bg-white transition-colors border-x border-[#F0F0F0]">
          <Twitter size={20} className="text-[#1DA1F2] mb-1" />
          <span className="text-xs font-semibold text-[#333] font-body lowercase">twitter</span>
          <span className="text-[11px] text-[#A0A0A0] font-body mt-0.5">{t.twFollowers}</span>
        </a>

        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center py-3 hover:bg-white transition-colors">
          <Instagram size={20} className="text-[#E4405F] mb-1" />
          <span className="text-xs font-semibold text-[#333] font-body lowercase">instagram</span>
          <span className="text-[11px] text-[#A0A0A0] font-body mt-0.5">{t.igFollowers}</span>
        </a>
      </div>

      {/* 🟢 DB AD 1: AFTER SOCIAL MEDIA (rendered above conditionally) */}

      {/* 2. LATEST STORIES WIDGET */}
      <div className="bg-[#FAF9F9] p-6 border border-[#F0F0F0]">
        <h2 className="text-lg font-bold font-display text-[#222] mb-4">
          {t.latestStories}
        </h2>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 size={24} className="animate-spin text-brand" />
          </div>
        ) : (
          <div className="divide-y divide-[#EAEAEA]">
            {latestStories.map((article) => {
              const title = lang === 'hi' && article.title_hi ? article.title_hi : article.title;
              const relativeTime = getRelativeTime(article.published_at);
              const commentCount = article.comments_count || 0;

              return (
                <div key={article.id} className="py-4 first:pt-0 last:pb-0">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-[#FF6B6B] font-body block mb-1">
                    {article.category}
                  </span>
                  <Link
                    href={`/${getCategorySlug(article.category)}/${article.slug}`}
                    className="group"
                  >
                    <h3 className="text-sm font-semibold text-[#333] group-hover:text-brand transition-colors leading-snug font-body line-clamp-2">
                      {title}
                    </h3>
                  </Link>
                  <p className="text-xs text-[#A0A0A0] font-body mt-2">
                    {relativeTime} &nbsp;|&nbsp; {commentCount} {t.comments}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 🔵 GOOGLE AD 1: ABOVE NEWSLETTER */}
      <AdBanner slot="sidebar-above-newsletter" size="rectangle" />

      {/* 3. NEWSLETTER WIDGET */}
      <div 
        className="bg-[#FAF9F9] p-6 border border-[#F0F0F0] relative overflow-hidden bg-no-repeat bg-right-bottom"
        style={{
          backgroundImage: `radial-gradient(circle at right bottom, rgba(255, 182, 193, 0.25), transparent 70%)`
        }}
      >
        <h3 className="font-display text-xl font-bold text-[#222] mb-3">{t.newsletterTitle}</h3>
        <p className="text-[#777] text-xs leading-relaxed mb-6 font-body">
          {t.newsletterDesc}
        </p>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-3 relative z-10">
          <input
            type="email"
            placeholder={t.emailPlaceholder}
            className="w-full px-4 py-3 bg-white border border-[#E8E8E8] text-xs text-[#333] placeholder-[#A0A0A0] focus:outline-none focus:border-[#FF6B6B] font-body shadow-sm"
          />
          <button 
            type="submit" 
            className="w-full py-3 bg-white border border-[#E8E8E8] text-xs font-bold text-[#FF6B6B] hover:bg-[#FF6B6B] hover:text-white transition-all duration-300 font-body uppercase tracking-wider shadow-sm"
          >
            {t.subscribe}
          </button>
        </form>
      </div>

      {/* 🟢 DB AD 2: AFTER NEWSLETTER */}
      <RenderDbAd ad={dbAds[1]} />

      {/* 4. CATEGORIES */}
      <div>
        <div className="divider-title mb-3">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#222]">{t.categories}</h2>
        </div>
        <div className="space-y-1">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/${cat.slug}`}
              className="flex items-center justify-between py-2 border-b border-[#F5F5F5] hover:text-brand transition-colors group"
            >
              <span className="flex items-center gap-2 text-sm text-[#333] group-hover:text-brand font-body">
                <span>{cat.icon}</span>
                {lang === 'hi' ? cat.name_hi : cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* 5. POPULAR TAGS */}
      <div>
        <div className="divider-title mb-3">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#222]">{t.popularTags}</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`/search?q=${encodeURIComponent(tag)}`}
              className="px-3 py-1 border border-[#E8E8E8] text-xs text-[#555] hover:border-brand hover:text-brand transition-all capitalize font-body"
            >
              {tag}
            </Link>
          ))}
        </div>
      </div>

      {/* 🟢 DB AD 3: BOTTOM DB AD */}
      <RenderDbAd ad={dbAds[2]} />

      {/* 🔵 GOOGLE AD 2: BOTTOM GOOGLE AD */}
      <AdBanner slot="sidebar-bottom" size="rectangle" />

    </aside>
  );
}