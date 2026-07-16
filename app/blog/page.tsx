'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import ArticleCard from '@/components/articles/ArticleCard';
import AdBanner from '@/components/ads/AdBanner';

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function BlogPage() {
  const [hero, setHero] = useState<any>(null);
  const [sideList, setSideList] = useState<any[]>([]);
  const [latest, setLatest] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch Hero, Side List, and Latest Grid
    sb.from('articles').select('*').eq('featured', true).limit(1).maybeSingle().then(({data}) => setHero(data));
    sb.from('articles').select('*').limit(4).then(({data}) => setSideList(data || []));
    sb.from('articles').select('*').order('created_at', {ascending: false}).limit(6).then(({data}) => setLatest(data || []));
    loadMoreStories(); // Initial load for "More Stories"
  }, []);

  const loadMoreStories = async () => {
    setLoading(true);
    const { data } = await sb.from('articles')
      .select('*')
      .order('created_at', {ascending: false})
      .range(page * 10, (page + 1) * 10 - 1);
    
    if (data) {
      setStories(prev => [...prev, ...data]);
      setPage(prev => prev + 1);
    }
    setLoading(false);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2">
          {hero && <ArticleCard article={hero} variant="featured" />}
        </div>
        <div className="flex flex-col gap-4">
          {sideList.map(a => <ArticleCard key={a.id} article={a} variant="mini" />)}
        </div>
      </section>
      <AdBanner />

      {/* Latest Grid */}
      <section className="mb-12">
        <h2 className="text-sm font-bold uppercase tracking-widest mb-6">Latest Articles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {latest.map(a => <ArticleCard key={a.id} article={a} />)}
        </div>
      </section>

      <AdBanner />
      <AdBanner />

      {/* More Stories */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-widest mb-6">More Stories</h2>
        <div className="space-y-6">
          {stories.map(a => <ArticleCard key={a.id} article={a} variant="horizontal" />)}
        </div>
        <button onClick={loadMoreStories} disabled={loading} className="btn-outline mt-8 w-full">
          {loading ? 'Loading...' : 'Load More Stories'}
        </button>
      </section>
    </main>
  );
}