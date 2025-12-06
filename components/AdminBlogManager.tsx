import React, { useEffect, useState } from 'react';
import { BlogPost, BLOG_CATEGORIES } from '../types/blog';
import { 
  getAllPosts, 
  createPost, 
  updatePost, 
  deletePost,
  generateSlug,
  calculateReadingTime 
} from '../services/blogService';

interface AdminBlogManagerProps {
  onClose: () => void;
}

const AdminBlogManager: React.FC<AdminBlogManagerProps> = ({ onClose }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('land-verification');
  const [author, setAuthor] = useState('JomiCheck Team');
  const [tags, setTags] = useState('');
  const [published, setPublished] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [coverImage, setCoverImage] = useState('');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    const data = await getAllPosts();
    setPosts(data);
    setLoading(false);
  };

  const resetForm = () => {
    setTitle('');
    setExcerpt('');
    setContent('');
    setCategory('land-verification');
    setAuthor('JomiCheck Team');
    setTags('');
    setPublished(true);
    setFeatured(false);
    setCoverImage('');
    setEditingPost(null);
  };

  const openNewPost = () => {
    resetForm();
    setShowEditor(true);
  };

  const openEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setTitle(post.title);
    setExcerpt(post.excerpt);
    setContent(post.content);
    setCategory(post.category);
    setAuthor(post.author);
    setTags(post.tags.join(', '));
    setPublished(post.published);
    setFeatured(post.featured);
    setCoverImage(post.cover_image || '');
    setShowEditor(true);
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      alert('টাইটেল এবং কন্টেন্ট আবশ্যক!');
      return;
    }

    setSaving(true);

    const postData = {
      title: title.trim(),
      slug: editingPost?.slug || generateSlug(title),
      excerpt: excerpt.trim() || content.substring(0, 200) + '...',
      content: content.trim(),
      category,
      author,
      tags: tags.split(',').map(t => t.trim()).filter(t => t),
      published,
      featured,
      cover_image: coverImage || undefined,
      reading_time: calculateReadingTime(content),
    };

    let success: boolean;

    if (editingPost) {
      success = await updatePost(editingPost.id, postData);
    } else {
      const newPost = await createPost(postData as any);
      success = !!newPost;
    }

    setSaving(false);

    if (success) {
      alert(editingPost ? 'আপডেট সফল!' : 'আর্টিকেল তৈরি হয়েছে!');
      setShowEditor(false);
      resetForm();
      loadPosts();
    } else {
      alert('সমস্যা হয়েছে! আবার চেষ্টা করুন।');
    }
  };

  const handleDelete = async (post: BlogPost) => {
    if (!confirm(`"${post.title}" ডিলিট করতে চান?`)) return;

    const success = await deletePost(post.id);
    if (success) {
      loadPosts();
    } else {
      alert('ডিলিট করা যায়নি!');
    }
  };

  const togglePublish = async (post: BlogPost) => {
    await updatePost(post.id, { published: !post.published });
    loadPosts();
  };

  if (showEditor) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 bangla-text">
              {editingPost ? 'আর্টিকেল এডিট করুন' : 'নতুন আর্টিকেল'}
            </h2>
            <button
              onClick={() => { setShowEditor(false); resetForm(); }}
              className="text-slate-400 hover:text-slate-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 bangla-text">
                টাইটেল *
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bangla-text"
                placeholder="আর্টিকেলের টাইটেল লিখুন..."
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 bangla-text">
                সংক্ষিপ্ত বিবরণ (Excerpt)
              </label>
              <textarea
                value={excerpt}
                onChange={e => setExcerpt(e.target.value)}
                rows={2}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bangla-text"
                placeholder="আর্টিকেলের সংক্ষিপ্ত বিবরণ (লিস্টে দেখাবে)..."
              />
            </div>

            {/* Category & Author */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 bangla-text">
                  ক্যাটাগরি
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {BLOG_CATEGORIES.map(cat => (
                    <option key={cat.slug} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Author
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={e => setAuthor(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 bangla-text">
                কন্টেন্ট * (আপনার সম্পূর্ণ আর্টিকেল এখানে পেস্ট করুন)
              </label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={15}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bangla-text font-mono text-sm"
                placeholder="আর্টিকেল কন্টেন্ট এখানে পেস্ট করুন...

📌 হেডিং ইমোজি দিয়ে শুরু করলে সেকশন হবে
👉 এভাবে নোট/টিপস দেখাবে
✅ এভাবে চেকলিস্ট আইটেম

সাধারণ প্যারাগ্রাফ এভাবে লিখুন..."
              />
              <p className="text-xs text-slate-500 mt-1">
                পড়তে সময় লাগবে: {calculateReadingTime(content)} মিনিট
              </p>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 bangla-text">
                ট্যাগ (কমা দিয়ে আলাদা করুন)
              </label>
              <input
                type="text"
                value={tags}
                onChange={e => setTags(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="জমি, দলিল, মামলা, খতিয়ান"
              />
            </div>

            {/* Cover Image URL */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Cover Image URL (optional)
              </label>
              <input
                type="text"
                value={coverImage}
                onChange={e => setCoverImage(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Options */}
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={e => setPublished(e.target.checked)}
                  className="w-5 h-5 text-green-600 rounded"
                />
                <span className="text-slate-700 bangla-text">পাবলিশ করুন</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={e => setFeatured(e.target.checked)}
                  className="w-5 h-5 text-green-600 rounded"
                />
                <span className="text-slate-700">⭐ Featured</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="sticky bottom-0 bg-slate-50 border-t px-6 py-4 flex justify-end gap-3">
            <button
              onClick={() => { setShowEditor(false); resetForm(); }}
              className="px-6 py-2 border rounded-lg hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : (editingPost ? 'Update' : 'Create')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800 bangla-text">
            📚 ব্লগ ম্যানেজমেন্ট
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={openNewPost}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              নতুন আর্টিকেল
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-slate-600 bangla-text">কোনো আর্টিকেল নেই</h3>
              <p className="text-slate-500 mb-4 bangla-text">প্রথম আর্টিকেল তৈরি করুন!</p>
              <button
                onClick={openNewPost}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                নতুন আর্টিকেল তৈরি করুন
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map(post => (
                <div
                  key={post.id}
                  className="border rounded-lg p-4 hover:bg-slate-50 transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {!post.published && (
                          <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded">
                            Draft
                          </span>
                        )}
                        {post.featured && (
                          <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded">
                            ⭐ Featured
                          </span>
                        )}
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded bangla-text">
                          {BLOG_CATEGORIES.find(c => c.slug === post.category)?.name || post.category}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-800 bangla-text">{post.title}</h3>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-1 bangla-text">{post.excerpt}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        <span>👁 {post.views || 0}</span>
                        <span>{post.reading_time} min read</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => togglePublish(post)}
                        className={`px-3 py-1 text-sm rounded ${
                          post.published
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {post.published ? 'Published' : 'Publish'}
                      </button>
                      <button
                        onClick={() => openEditPost(post)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(post)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBlogManager;

