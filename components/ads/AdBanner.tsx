'use client';

import { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';

type AdSlot = 'banner-1' | 'banner-2' | 'banner-3' | 'side-image-1' | 'side-image-2' | 'side-image-3' | 'leaderboard' | 'rectangle' | 'global' | string;
type AdType = 'banner' | 'in_feed' | 'sidebar' | 'sticky';
type AdPosition = 'content' | 'top' | 'sidebar' | 'bottom';
type AdSize = 'leaderboard' | 'rectangle' | 'banner' | 'sidebar' | 'sticky' | 'large_rectangle';

interface CategoryAd {
  id: string;
  title: string;
  title_hi: string | null;
  description: string;
  description_hi: string | null;
  image_url: string;
  link_url: string | null;
  click_count: number;
  view_count: number;
  ad_type: AdType;
  position: AdPosition;
  size: AdSize;
}

interface AdBannerProps {
  slot?: AdSlot;
  category?: string;
  subcategory?: string;
  isGlobal?: boolean;
  className?: string;
  adType?: AdType;
  position?: AdPosition;
  size?: AdSize;
  googleSlot?: string;
  showGoogleFallback?: boolean;
}

const categoryTargetMap: Record<string, string> = {
  health: 'target_health',
  ayurveda: 'target_ayurveda',
  yoga: 'target_yoga',
  beauty: 'target_beauty',
  nutrition: 'target_nutrition',
  'home-remedies': 'target_home_remedies',
  spirituality: 'target_spirituality',
  dreams: 'target_dreams',
  blog: 'target_blog',
};

const isSidebar = (slot: AdSlot, adType?: AdType) => adType === 'sidebar' || slot.startsWith('side-image');
const isBanner = (slot: AdSlot, adType?: AdType) => adType === 'banner' || slot.startsWith('banner') || slot === 'leaderboard';

const sizeDimensions: Record<AdSize, { w: string; h: string }> = {
  leaderboard: { w: 'w-full', h: 'h-[90px]' },
  rectangle: { w: 'w-full', h: 'h-[250px]' },
  banner: { w: 'w-full', h: 'h-[90px]' },
  sidebar: { w: 'w-[300px]', h: 'h-[250px]' },
  sticky: { w: 'w-full', h: 'h-[50px]' },
  large_rectangle: { w: 'w-full', h: 'h-[280px]' },
};

export default function AdBanner({
  slot = 'banner-1',
  category,
  subcategory,
  isGlobal = false,
  className = '',
  adType,
  position,
  size,
  googleSlot,
  showGoogleFallback = false,
}: AdBannerProps) {
  const { lang } = useLanguage();
  const [ads, setAds] = useState<CategoryAd[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAds();
  }, [slot, category, subcategory, isGlobal, adType, position, size]);

  const loadAds = async () => {
    setLoading(true);
    try {
      if (isGlobal || slot === 'global') {
        const { data } = await supabase
          .from('global_ads')
          .select('id, title, title_hi, description, description_hi, image_url, link_url, click_count, view_count, ad_type, position, size')
          .eq('is_active', true)
          .eq('show_on_all_pages', true)
          .order('sort_order')
          .limit(2);
        setAds((data as CategoryAd[]) || []);
      } else {
        let query = supabase
          .from('category_ads')
          .select('id, title, title_hi, description, description_hi, image_url, link_url, click_count, view_count, ad_type, position, size')
          .eq('is_active', true)
          .eq('slot', slot);

        if (category && categoryTargetMap[category]) {
          const col = categoryTargetMap[category];
          query = query.or(`${col}.eq.true,target_all_categories.eq.true`);
        } else {
          query = query.eq('target_all_categories', true);
        }

        const { data } = await query.order('sort_order').limit(1);
        setAds((data as CategoryAd[]) || []);

        // Track view — increment view_count (was incorrectly using click_count)
        if (data && data.length > 0) {
          const ad = data[0] as CategoryAd;
          await supabase
            .from('category_ads')
            .update({ view_count: (ad.view_count || 0) + 1 })
            .eq('id', ad.id);
        }
      }
    } catch (e) {
      console.error('AdBanner error:', e);
    }
    setLoading(false);
  };

  const handleClick = async (adId: string, linkUrl: string | null, table: string) => {
    if (!linkUrl) return;
    try {
      const ad = ads.find(a => a.id === adId);
      await supabase.from(table).update({ click_count: (ad?.click_count || 0) + 1 }).eq('id', adId);
    } catch {}
    window.open(linkUrl, '_blank', 'noopener,noreferrer');
  };

  const tableName = isGlobal || slot === 'global' ? 'global_ads' : 'category_ads';

  if (loading) return null;

  // Determine display size: explicit prop > ad data > slot-based default
  const effectiveSize: AdSize = size || (ads[0]?.size as AdSize) || (isSidebar(slot, adType) ? 'sidebar' : 'leaderboard');
  const dims = sizeDimensions[effectiveSize] || sizeDimensions.leaderboard;

  if (ads.length === 0) {
    if (!showGoogleFallback) return null;
    return (
      <div className={`flex flex-col items-center gap-1 ${className}`}>
        <span className="text-[9px] font-medium uppercase tracking-widest text-[#BBBBBB] font-body">Advertisement</span>
        <div className={`ad-placeholder flex items-center justify-center text-center bg-[#F8F8F8] border border-[#E8E8E8] ${dims.w} ${dims.h}`} style={{ maxWidth: '100%' }}>
          <div>
            <div className="text-[11px] text-[#CCCCCC] font-body mb-1">Google AdSense</div>
            {googleSlot && <div className="text-[9px] text-[#DDD] font-body">Slot: {googleSlot}</div>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <span className="text-[9px] font-medium uppercase tracking-widest text-[#BBBBBB] font-body">Advertisement</span>
      {ads.map((ad) => (
        <div
          key={ad.id}
          onClick={() => handleClick(ad.id, ad.link_url, tableName)}
          className={`relative overflow-hidden cursor-pointer group border border-[#E8E8E8] hover:border-brand transition-all hover:shadow-md ${dims.w} ${dims.h}`}
          style={{ maxWidth: '100%' }}
        >
          {ad.image_url ? (
            <img
              src={ad.image_url}
              alt={lang === 'hi' && ad.title_hi ? ad.title_hi : ad.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-[#FFF8F6]">
              <p className="text-sm font-semibold text-center text-[#111] font-body">
                {lang === 'hi' && ad.title_hi ? ad.title_hi : ad.title}
              </p>
              {ad.description && (
                <p className="text-[11px] text-[#666] text-center font-body mt-1 line-clamp-2">
                  {lang === 'hi' && ad.description_hi ? ad.description_hi : ad.description}
                </p>
              )}
              {ad.link_url && (
                <span className="flex items-center gap-1 text-[10px] text-brand font-body mt-2 font-semibold">
                  Learn More <ExternalLink size={10} />
                </span>
              )}
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
          <span className="absolute bottom-1 right-1 text-[8px] text-white bg-black/40 px-1 font-body rounded">Ad</span>
        </div>
      ))}
    </div>
  );
}
