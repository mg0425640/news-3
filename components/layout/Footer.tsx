'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Send, Facebook, Youtube, Instagram, Twitter } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabase';

export default function Footer() {
  const { lang } = useLanguage();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      try {
        await supabase.from('newsletter_subscribers').insert({ email });
      } catch {}
      setSubscribed(true);
      setEmail('');
    }
  };

  const t = {
    newsletterTitle: lang === 'hi' ? 'VedaWell न्यूज़लेटर' : 'The VedaWell Newsletter',
    newsletterDesc: lang === 'hi' ? 'हर हफ्ते स्वास्थ्य ज्ञान। कोई स्पैम नहीं।' : 'Wellness wisdom delivered every week. No spam, ever.',
    thankYou: lang === 'hi' ? 'सब्सक्राइब करने के लिए धन्यवाद!' : 'Thank you for subscribing!',
    emailPlaceholder: lang === 'hi' ? 'अपना ईमेल दर्ज करें' : 'Enter your email',
    subscribe: lang === 'hi' ? 'सब्सक्राइब' : 'Subscribe',
    brandDesc: lang === 'hi'
      ? 'भारत का विश्वसनीय स्वास्थ्य और ज्ञान प्लेटफ़ॉर्म। स्वस्थ मन • स्वस्थ शरीर • सकारात्मक जीवन।'
      : "India's trusted wellness and knowledge platform. Healthy Mind • Healthy Body • Positive Life.",
    categories: lang === 'hi' ? 'श्रेणियाँ' : 'Categories',
    quickLinks: lang === 'hi' ? 'त्वरित लिंक' : 'Quick Links',
    shop: lang === 'hi' ? 'शॉप' : 'Shop',
    trending: lang === 'hi' ? 'ट्रेंडिंग' : 'Trending',
    home: lang === 'hi' ? 'होम' : 'Home',
    blog: lang === 'hi' ? 'ब्लॉग' : 'Blog',
    aboutUs: lang === 'hi' ? 'हमारे बारे में' : 'About Us',
    contact: lang === 'hi' ? 'संपर्क' : 'Contact',
    privacy: lang === 'hi' ? 'गोपनीयता नीति' : 'Privacy Policy',
    terms: lang === 'hi' ? 'उपयोग की शर्तें' : 'Terms of Use',
    disclaimer: lang === 'hi' ? 'डिस्क्लेमर' : 'Disclaimer',
    copyright: lang === 'hi' ? '© 2026 VedaWell। सर्वाधिकार सुरक्षित।' : '© 2026 VedaWell. All Rights Reserved.',
    medicalDisclaimer: lang === 'hi'
      ? 'इस साइट पर दी गई जानकारी केवल सूचना के उद्देश्यों के लिए है और चिकित्सा सलाह नहीं है।'
      : 'The content on this site is for informational purposes only and does not constitute medical advice.',
  };

  const categoriesList = [
    { en: 'Dream Meanings', hi: 'स्वप्न अर्थ', slug: 'dreams' },
    { en: 'Health & Wellness', hi: 'स्वास्थ्य एवं कल्याण', slug: 'health' },
    { en: 'Ayurveda', hi: 'आयुर्वेद', slug: 'ayurveda' },
    { en: 'Yoga', hi: 'योग', slug: 'yoga' },
    { en: 'Beauty', hi: 'सौंदर्य', slug: 'beauty' },
    { en: 'Nutrition', hi: 'पोषण', slug: 'nutrition' },
    { en: 'Spirituality', hi: 'अध्यात्म', slug: 'spirituality' },
    { en: 'Home Remedies', hi: 'घरेलू उपचार', slug: 'home-remedies' },
  ];

  const quickLinks = [
    { label: t.home, href: '/' },
    { label: lang === 'hi' ? 'शॉप' : 'Shop', href: '/shop' },
    { label: t.blog, href: '/blog' },
    { label: t.aboutUs, href: '/about' },
    { label: t.contact, href: '/contact' },
    { label: t.privacy, href: '/privacy' },
    { label: t.terms, href: '/terms' },
    { label: t.disclaimer, href: '/disclaimer' },
  ];

  const shopItems = [
    { en: 'Supplements', hi: 'सप्लीमेंट्स' },
    { en: 'Hair Care', hi: 'बालों की देखभाल' },
    { en: 'Skin Care', hi: 'त्वचा की देखभाल' },
    { en: 'Yoga Accessories', hi: 'योग सामग्री' },
    { en: 'Organic Foods', hi: 'ऑर्गेनिक खाद्य पदार्थ' },
    { en: 'Spirituality', hi: 'अध्यात्म' },
    { en: 'Essential Oils', hi: 'तेल' },
    { en: 'Books', hi: 'किताबें' },
  ];

  const trendingItems = [
    { en: 'Dream About Cow', hi: 'गाय का सपना', href: '/dreams/dream-about-cow-meaning' },
    { en: 'Dream About Snake', hi: 'साँप का सपना', href: '/dreams/dream-about-snake-meaning' },
    { en: 'Ashwagandha Benefits', hi: 'अश्वगंधा के फायदे', href: '/ayurveda/ashwagandha-benefits-dosage' },
    { en: 'Yoga for Back Pain', hi: 'पीठ दर्द के लिए योग', href: '/yoga/yoga-for-back-pain-beginners' },
    { en: 'Dark Circles Remedy', hi: 'डार्क सर्कल का उपचार', href: '/beauty/remove-dark-circles-naturally' },
    { en: 'Giloy Benefits', hi: 'गिलोय के फायदे', href: '/ayurveda/giloy-benefits-immunity' },
  ];

  return (
    <footer className="bg-[#111111] text-white">
      {/* Newsletter Bar */}
      <div className="border-b border-[#2A2A2A] py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold font-display">{t.newsletterTitle}</h3>
            <p className="text-white text-sm mt-0.5">{t.newsletterDesc}</p>
          </div>
          {subscribed ? (
            <p className="text-green-400 font-medium text-sm">{t.thankYou}</p>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                required
                className="flex-1 md:w-72 px-4 py-2.5 bg-[#222] border border-[#333] text-sm text-white placeholder-[#666] focus:outline-none focus:border-brand transition-colors"
              />
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 bg-brand text-white text-sm font-semibold hover:bg-[#C93D0E] transition-colors"
              >
                <Send size={14} />
                {t.subscribe}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="block mb-4">
              <span className="text-2xl font-bold tracking-tight font-display">
                Veda<span className="text-brand">Well</span>
              </span>
            </Link>
            <p className="text-white text-sm leading-relaxed mb-4">{t.brandDesc}</p>
            <div className="flex items-center gap-3 text-white hover:text-brand transition-colors">
              {[
                { Icon: Facebook, href: '#' },
                { Icon: Instagram, href: '#' },
                { Icon: Youtube, href: '#' },
                { Icon: Twitter, href: '#' },
              ].map(({ Icon, href }, i) => (
                <a key={i} href={href} className="w-8 h-8 bg-[#222] flex items-center justify-center hover:bg-brand transition-colors">
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-body text-xs font-bold uppercase tracking-widest text-[#AAA] mb-4">{t.categories}</h4>
            <ul className="space-y-2">
              {categoriesList.map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/${cat.slug}`} className="text-white hover:text-brand text-sm transition-colors">
                    {lang === 'hi' ? cat.hi : cat.en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-body text-xs font-bold uppercase tracking-widest text-[#AAA] mb-4">{t.quickLinks}</h4>
            <ul className="space-y-2">
              {quickLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-white hover:text-brand text-sm transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-body text-xs font-bold uppercase tracking-widest text-[#AAA] mb-4">{t.shop}</h4>
            <ul className="space-y-2">
              {shopItems.map((item) => (
                <li key={item.en}>
                  <Link href={`/shop?cat=${item.en.toLowerCase().replace(/ /g, '-')}`} className="text-white hover:text-brand text-sm transition-colors">
                    {lang === 'hi' ? item.hi : item.en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Trending */}
          <div>
            <h4 className="font-body text-xs font-bold uppercase tracking-widest text-[#AAA] mb-4">{t.trending}</h4>
            <ul className="space-y-2">
              {trendingItems.map((item) => (
                <li key={item.en}>
                  <Link href={item.href} className="text-white hover:text-brand text-sm transition-colors">
                    {lang === 'hi' ? item.hi : item.en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#222] py-5">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-[#555] text-xs">
            {t.copyright} |
            <span className="text-[#444] ml-1">{t.medicalDisclaimer}</span>
          </p>
          <div className="flex items-center gap-4 text-[#555] text-xs">
            <Link href="/privacy" className="hover:text-white transition-colors">{lang === 'hi' ? 'गोपनीयता' : 'Privacy'}</Link>
            <Link href="/terms" className="hover:text-white transition-colors">{lang === 'hi' ? 'शर्तें' : 'Terms'}</Link>
            <Link href="/disclaimer" className="hover:text-white transition-colors">{lang === 'hi' ? 'डिस्क्लेमर' : 'Disclaimer'}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
