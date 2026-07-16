import ArticleDetailLayout from '@/components/shared/ArticleDetailLayout';
import { createClient } from '@supabase/supabase-js';

interface Props { params: { slug: string } }

// Helper to fetch data safely
async function getArticle(slug: string) {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data } = await sb.from('articles').select('*').eq('slug', slug).maybeSingle();
  return data;
}

export async function generateMetadata({ params }: Props) {
  const a = await getArticle(params.slug);
  return {
    title: a?.meta_title || a?.title || 'Blog – VedaWell',
    description: a?.meta_description || a?.excerpt,
    openGraph: {
      images: a?.og_image ? [{ url: a.og_image }] : [],
    },
  };
}

export default async function BlogArticlePage({ params }: Props) {
  const article = await getArticle(params.slug);
  
  if (!article) return <div>Article not found.</div>;

  return <ArticleDetailLayout {...article} />;
}