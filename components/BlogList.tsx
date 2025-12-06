import React, { useEffect, useState } from 'react';
import { BlogPost, BLOG_CATEGORIES } from '../types/blog';
import { getPublishedPosts } from '../services/blogService';

interface BlogListProps {
  onSelectPost: (slug: string) => void;
  onBack: () => void;
}

const BlogList: React.FC<BlogListProps> = ({ onSelectPost, onBack }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    const data = await getPublishedPosts();
    setPosts(data);
    setLoading(false);
  };

  const filteredPosts = selectedCategory
    ? posts.filter(p => p.category === selectedCategory)
    : posts;

  const getCategoryName = (slug: string) => {
    const cat = BLOG_CATEGORIES.find(c => c.slug === slug);
    return cat?.name || slug;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-green-600 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>ফিরে যান</span>
          </button>
          <h1 className="text-xl font-bold text-slate-800 bangla-text">
            📚 জমি ও দলিল গাইড
          </h1>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4 bangla-text">
            জমি ও সম্পত্তি বিষয়ক আর্টিকেল
          </h2>
          <p className="text-slate-600 text-lg bangla-text max-w-2xl mx-auto">
            জমি কেনা, দলিল যাচাই, মামলা থেকে মুক্তি – সবকিছু সহজ ভাষায় বুঝুন
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              !selectedCategory
                ? 'bg-green-600 text-white'
                : 'bg-white text-slate-600 hover:bg-green-50 border'
            }`}
          >
            সব আর্টিকেল
          </button>
          {BLOG_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition bangla-text ${
                selectedCategory === cat.slug
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-green-50 border'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Posts Grid */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-medium text-slate-600 bangla-text">
              কোনো আর্টিকেল পাওয়া যায়নি
            </h3>
            <p className="text-slate-500 mt-2 bangla-text">
              শীঘ্রই নতুন আর্টিকেল যোগ হবে
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map(post => (
              <article
                key={post.id}
                onClick={() => onSelectPost(post.slug)}
                className="bg-white rounded-xl shadow-sm border hover:shadow-lg transition cursor-pointer overflow-hidden group"
              >
                {/* Cover Image */}
                <div className="h-48 bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center relative overflow-hidden">
                  {post.cover_image ? (
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  ) : (
                    <div className="text-white text-6xl opacity-30">📄</div>
                  )}
                  {post.featured && (
                    <span className="absolute top-3 right-3 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                      ⭐ Featured
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full bangla-text">
                      {getCategoryName(post.category)}
                    </span>
                    <span className="text-xs text-slate-400">
                      {post.reading_time} মিনিট পড়া
                    </span>
                  </div>

                  <h3 className="font-bold text-lg text-slate-800 mb-2 line-clamp-2 bangla-text group-hover:text-green-600 transition">
                    {post.title}
                  </h3>

                  <p className="text-slate-600 text-sm line-clamp-3 bangla-text mb-4">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{new Date(post.created_at).toLocaleDateString('bn-BD')}</span>
                    <span>{post.views || 0} বার পড়া হয়েছে</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-8 text-center text-white">
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
      </main>

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

export default BlogList;

