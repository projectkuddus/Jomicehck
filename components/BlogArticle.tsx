import React, { useEffect, useState } from 'react';
import { BlogPost, BLOG_CATEGORIES } from '../types/blog';
import { getPostBySlug } from '../services/blogService';

interface BlogArticleProps {
  slug: string;
  onBack: () => void;
  onBackToList: () => void;
}

const BlogArticle: React.FC<BlogArticleProps> = ({ slug, onBack, onBackToList }) => {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPost();
  }, [slug]);

  const loadPost = async () => {
    setLoading(true);
    const data = await getPostBySlug(slug);
    setPost(data);
    setLoading(false);

    // Update page title for SEO
    if (data) {
      document.title = `${data.title} | JomiCheck Blog`;
    }
  };

  const getCategoryName = (catSlug: string) => {
    const cat = BLOG_CATEGORIES.find(c => c.slug === catSlug);
    return cat?.name || catSlug;
  };

  const sharePost = (platform: 'facebook' | 'twitter' | 'whatsapp' | 'copy') => {
    const url = window.location.href;
    const title = post?.title || 'JomiCheck Blog';

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(title + ' - ' + url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        alert('লিংক কপি হয়েছে!');
        break;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-bold text-slate-700 mb-4 bangla-text">আর্টিকেল পাওয়া যায়নি</h2>
        <button
          onClick={onBackToList}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
        >
          সব আর্টিকেল দেখুন
        </button>
      </div>
    );
  }

  // Convert content to HTML (simple markdown-like parsing)
  const renderContent = (content: string) => {
    return content.split('\n\n').map((paragraph, index) => {
      // Headers
      if (paragraph.startsWith('# ')) {
        return <h1 key={index} className="text-3xl font-bold text-slate-800 mt-8 mb-4 bangla-text">{paragraph.slice(2)}</h1>;
      }
      if (paragraph.startsWith('## ')) {
        return <h2 key={index} className="text-2xl font-bold text-slate-800 mt-6 mb-3 bangla-text">{paragraph.slice(3)}</h2>;
      }
      if (paragraph.startsWith('### ')) {
        return <h3 key={index} className="text-xl font-bold text-slate-700 mt-4 mb-2 bangla-text">{paragraph.slice(4)}</h3>;
      }

      // Emoji headers (like 📌, ✅, ⚠️)
      if (/^[📌✅⚠️🔎📱👉1️⃣2️⃣3️⃣4️⃣]/.test(paragraph)) {
        const lines = paragraph.split('\n');
        return (
          <div key={index} className="my-6">
            {lines.map((line, i) => {
              if (line.startsWith('📌') || line.startsWith('✅') || line.startsWith('📱') || line.startsWith('🔎') || line.startsWith('⚠️')) {
                return <h3 key={i} className="text-xl font-bold text-green-700 mb-3 bangla-text">{line}</h3>;
              }
              if (line.startsWith('👉')) {
                return <p key={i} className="text-slate-600 bg-green-50 p-3 rounded-lg border-l-4 border-green-500 mb-2 bangla-text">{line}</p>;
              }
              if (/^[1️⃣2️⃣3️⃣4️⃣]/.test(line)) {
                return <div key={i} className="bg-slate-100 p-3 rounded-lg mb-2 bangla-text font-medium">{line}</div>;
              }
              return <p key={i} className="text-slate-600 mb-2 bangla-text">{line}</p>;
            })}
          </div>
        );
      }

      // Lists
      if (paragraph.includes('\n') && (paragraph.includes('•') || paragraph.includes('-') || paragraph.includes('*'))) {
        const items = paragraph.split('\n').filter(l => l.trim());
        return (
          <ul key={index} className="list-disc list-inside space-y-2 my-4 text-slate-600 bangla-text">
            {items.map((item, i) => (
              <li key={i}>{item.replace(/^[•\-*]\s*/, '')}</li>
            ))}
          </ul>
        );
      }

      // Regular paragraph
      return <p key={index} className="text-slate-600 leading-relaxed mb-4 bangla-text">{paragraph}</p>;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={onBackToList}
            className="flex items-center gap-2 text-slate-600 hover:text-green-600 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="bangla-text">সব আর্টিকেল</span>
          </button>
          
          {/* Share buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => sharePost('whatsapp')}
              className="p-2 hover:bg-green-50 rounded-full transition"
              title="WhatsApp-এ শেয়ার করুন"
            >
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </button>
            <button
              onClick={() => sharePost('facebook')}
              className="p-2 hover:bg-blue-50 rounded-full transition"
              title="Facebook-এ শেয়ার করুন"
            >
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>
            <button
              onClick={() => sharePost('copy')}
              className="p-2 hover:bg-slate-100 rounded-full transition"
              title="লিংক কপি করুন"
            >
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Article */}
      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Meta */}
        <div className="flex items-center gap-3 mb-6">
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm bangla-text">
            {getCategoryName(post.category)}
          </span>
          <span className="text-slate-400 text-sm">•</span>
          <span className="text-slate-500 text-sm">
            {new Date(post.created_at).toLocaleDateString('bn-BD')}
          </span>
          <span className="text-slate-400 text-sm">•</span>
          <span className="text-slate-500 text-sm">
            {post.reading_time} মিনিট পড়া
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6 leading-tight bangla-text">
          {post.title}
        </h1>

        {/* Author & Views */}
        <div className="flex items-center justify-between mb-8 pb-8 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-700 font-bold">{post.author.charAt(0)}</span>
            </div>
            <div>
              <p className="font-medium text-slate-700">{post.author}</p>
              <p className="text-sm text-slate-500">JomiCheck Team</p>
            </div>
          </div>
          <div className="text-slate-400 text-sm">
            👁 {post.views || 0} বার পড়া হয়েছে
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          {renderContent(post.content)}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t">
            <h4 className="text-sm font-medium text-slate-500 mb-3">ট্যাগ:</h4>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, i) => (
                <span key={i} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4 bangla-text">
            আপনার দলিল যাচাই করতে চান?
          </h3>
          <p className="text-green-100 mb-6 bangla-text">
            JomiCheck দিয়ে মাত্র ৫ মিনিটে আপনার দলিলের ঝুঁকি বিশ্লেষণ করুন
          </p>
          <button
            onClick={onBack}
            className="bg-white text-green-700 px-8 py-3 rounded-lg font-bold hover:bg-green-50 transition"
          >
            এখনই যাচাই করুন →
          </button>
        </div>
      </article>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-slate-400 bangla-text">
            © {new Date().getFullYear()} JomiCheck – বাংলাদেশের প্রথম AI দলিল যাচাই সেবা
          </p>
        </div>
      </footer>
    </div>
  );
};

export default BlogArticle;

