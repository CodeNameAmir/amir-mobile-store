import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  Clock,
  Share2,
  Tag,
  User,
} from 'lucide-react';
import { SmartImage } from '../components/SmartImage';
import { useStore } from '../context/StoreContext';
import { resolveBlogCoverImage } from '../data/catalog';
import { storeApi } from '../lib/authApi';
import type { BlogPostItem } from '../types/store';
import {
  applyDocumentSeoMeta,
  buildBlogPostingJsonLd,
  buildBreadcrumbJsonLd,
  removeJsonLdScript,
  resolveAbsoluteAssetUrl,
  resolveCanonicalUrl,
  SITE_ORIGIN,
  upsertJsonLdScript,
} from '../utils/seo';
import { formatPersianDate, toPersianDigits } from '../utils/storeLogic';

interface BlogDetailPageProps {
  slug: string;
}

const BLOG_JSONLD_ID = 'blog-posting-jsonld';
const BLOG_BREADCRUMB_ID = 'blog-breadcrumb-jsonld';

export const BlogDetailPage: React.FC<BlogDetailPageProps> = ({ slug }) => {
  const { buildHref, handleLinkClick, navigate, showToast } = useStore();
  const [post, setPost] = useState<BlogPostItem | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setNotFound(false);

    storeApi
      .getBlogPostBySlug(slug)
      .then((res) => {
        if (!active) return;
        setPost(res.post);
        setRelatedPosts(Array.isArray(res.relatedPosts) ? res.relatedPosts : []);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setPost(null);
        setRelatedPosts([]);
        setNotFound(true);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!post) {
      removeJsonLdScript(BLOG_JSONLD_ID);
      removeJsonLdScript(BLOG_BREADCRUMB_ID);
      return;
    }

    const canonicalUrl = resolveCanonicalUrl(`/blog/${encodeURIComponent(post.slug)}`, SITE_ORIGIN);
    const resolvedCover = resolveBlogCoverImage(post.coverImage);
    const ogImage = resolveAbsoluteAssetUrl(resolvedCover, SITE_ORIGIN);

    applyDocumentSeoMeta({
      title: `${post.title} | مجله تخصصی موبایل امیر`,
      description: post.excerpt,
      canonicalPath: `/blog/${encodeURIComponent(post.slug)}`,
      canonicalUrl,
      ogTitle: post.title,
      ogDescription: post.excerpt,
      ogType: 'article',
      ogUrl: canonicalUrl,
      ogImage,
    });

    upsertJsonLdScript(
      BLOG_JSONLD_ID,
      buildBlogPostingJsonLd(post, { siteOrigin: SITE_ORIGIN, resolvedCoverImage: ogImage })
    );
    upsertJsonLdScript(
      BLOG_BREADCRUMB_ID,
      buildBreadcrumbJsonLd(
        [
          { name: 'فروشگاه موبایل امیر', url: '/' },
          { name: 'مجله تخصصی', url: '/blog' },
          { name: post.title, url: `/blog/${encodeURIComponent(post.slug)}` },
        ],
        SITE_ORIGIN
      )
    );

    return () => {
      removeJsonLdScript(BLOG_JSONLD_ID);
      removeJsonLdScript(BLOG_BREADCRUMB_ID);
    };
  }, [post]);

  const contentBlocks = useMemo(() => {
    if (!post?.content) return [];
    return post.content
      .split(/\n{2,}/)
      .map((block) => block.trim())
      .filter(Boolean);
  }, [post?.content]);

  const handleShare = async () => {
    if (!post || typeof window === 'undefined') return;
    const shareUrl = `${window.location.origin}/blog/${encodeURIComponent(post.slug)}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast('لینک مقاله کپی شد.', 'success');
    } catch {
      showToast('امکان کپی خودکار لینک در این مرورگر فراهم نیست.', 'info');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 lg:px-8 py-10 space-y-6 animate-pulse">
        <div className="h-4 w-48 bg-[#E4E8EE] rounded" />
        <div className="bg-white rounded-2xl border border-[#E4E8EE] p-6 sm:p-10 space-y-6">
          <div className="h-7 w-3/4 bg-[#EEF1F5] rounded" />
          <div className="aspect-[16/9] bg-[#EEF1F5] rounded-xl" />
          <div className="space-y-3">
            <div className="h-4 w-full bg-[#EEF1F5] rounded" />
            <div className="h-4 w-5/6 bg-[#EEF1F5] rounded" />
            <div className="h-4 w-4/6 bg-[#EEF1F5] rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl border border-[#E4E8EE] p-8 sm:p-12 text-center space-y-5">
          <h1 className="text-xl font-semibold text-[#11161E]">مقاله مورد نظر یافت نشد</h1>
          <p className="text-xs sm:text-sm text-[#4A5464] leading-7">
            ممکن است این مقاله حذف یا آدرس آن جابه‌جا شده باشد. می‌توانید جدیدترین نقدها و راهنماهای خرید را در مجله تخصصی مشاهده کنید.
          </p>
          <a
            href={buildHref('/blog')}
            onClick={(e) => handleLinkClick(e, '/blog')}
            className="h-11 px-5 rounded-lg bg-[#1453D6] hover:bg-[#0F44B5] text-white text-xs sm:text-sm font-medium inline-flex items-center gap-2 transition-colors"
          >
            <span>بازگشت به مجله تخصصی</span>
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8 space-y-10">
      {/* Breadcrumb */}
      <nav aria-label="مسیر صفحه" className="max-w-4xl mx-auto flex flex-wrap items-center gap-2 text-xs text-[#6E7889]">
        <a
          href={buildHref('/')}
          onClick={(e) => handleLinkClick(e, '/')}
          className="hover:text-[#1453D6] transition-colors"
        >
          صفحه اصلی
        </a>
        <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
        <a
          href={buildHref('/blog')}
          onClick={(e) => handleLinkClick(e, '/blog')}
          className="hover:text-[#1453D6] transition-colors"
        >
          مجله تخصصی
        </a>
        <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
        <span className="text-[#11161E] font-medium line-clamp-1">{post.title}</span>
      </nav>

      {/* Main Article */}
      <article className="max-w-4xl mx-auto bg-white rounded-2xl border border-[#E4E8EE] p-5 sm:p-8 lg:p-10 space-y-6">
        <header className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="px-3 py-1 rounded-md bg-[#EEF3FC] text-[#1453D6] text-xs font-medium">
              {post.category}
            </span>
            <button
              type="button"
              onClick={handleShare}
              className="h-9 px-3 rounded-lg bg-[#F7F8FA] hover:bg-[#EEF3FC] border border-[#E4E8EE] text-xs font-medium text-[#11161E] inline-flex items-center gap-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>کپی لینک مقاله</span>
            </button>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-[26px] font-semibold text-[#11161E] leading-9 sm:leading-10">
            {post.title}
          </h1>

          <p className="text-sm text-[#4A5464] leading-7">{post.excerpt}</p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-[#6E7889] border-t border-[#E4E8EE]">
            <span className="inline-flex items-center gap-1.5">
              <User className="w-4 h-4" strokeWidth={1.5} />
              <span>نویسنده: {post.authorName}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 tabular-nums-fa">
              <Calendar className="w-4 h-4" strokeWidth={1.5} />
              <span>{formatPersianDate(post.publishedAt)}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 tabular-nums-fa">
              <Clock className="w-4 h-4" strokeWidth={1.5} />
              <span>{toPersianDigits(post.readingTimeMinutes)} دقیقه زمان مطالعه</span>
            </span>
          </div>
        </header>

        <div className="aspect-[16/9] rounded-xl overflow-hidden bg-[#F3F5F8] border border-[#E4E8EE]">
          <SmartImage
            src={resolveBlogCoverImage(post.coverImage)}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-5 text-sm sm:text-[15px] text-[#242B35] leading-8">
          {contentBlocks.map((block, idx) => {
            if (block.startsWith('## ')) {
              return (
                <h2
                  key={idx}
                  className="text-base sm:text-lg font-semibold text-[#11161E] pt-3"
                >
                  {block.replace(/^##\s+/, '')}
                </h2>
              );
            }
            return <p key={idx}>{block}</p>;
          })}
        </div>

        {post.tags.length > 0 && (
          <div className="pt-5 border-t border-[#E4E8EE] flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-[#4A5464]">
              <Tag className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>برچسب‌ها:</span>
            </span>
            {post.tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => navigate(`/blog?tag=${encodeURIComponent(tag)}`)}
                className="px-2.5 py-1 rounded-lg bg-[#F7F8FA] hover:bg-[#EEF3FC] border border-[#E4E8EE] text-xs text-[#4A5464] hover:text-[#1453D6] transition-colors"
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </article>

      {/* Related Articles */}
      {relatedPosts.length > 0 && (
        <section className="max-w-4xl mx-auto space-y-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg sm:text-xl font-semibold text-[#11161E]">مقالات مرتبط</h2>
            <a
              href={buildHref('/blog')}
              onClick={(e) => handleLinkClick(e, '/blog')}
              className="text-xs font-medium text-[#1453D6] hover:underline inline-flex items-center gap-1"
            >
              <span>همه مقالات مجله</span>
              <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {relatedPosts.map((rel) => (
              <article
                key={rel.id}
                className="group bg-white rounded-xl border border-[#E4E8EE] overflow-hidden flex flex-col hover:border-[#C5CEDB] transition-colors"
              >
                <a
                  href={buildHref(`/blog/${rel.slug}`)}
                  onClick={(e) => handleLinkClick(e, `/blog/${rel.slug}`)}
                  className="aspect-[16/9] bg-[#F3F5F8] overflow-hidden block"
                >
                  <SmartImage
                    src={resolveBlogCoverImage(rel.coverImage)}
                    alt={rel.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </a>
                <div className="p-4 flex-1 flex flex-col gap-2">
                  <span className="self-start px-2 py-0.5 rounded bg-[#EEF3FC] text-[#1453D6] text-[11px] font-medium">
                    {rel.category}
                  </span>
                  <h3 className="text-sm font-semibold text-[#11161E] leading-6">
                    <a
                      href={buildHref(`/blog/${rel.slug}`)}
                      onClick={(e) => handleLinkClick(e, `/blog/${rel.slug}`)}
                      className="hover:text-[#1453D6] transition-colors"
                    >
                      {rel.title}
                    </a>
                  </h3>
                  <span className="text-[11px] text-[#6E7889] tabular-nums-fa mt-auto pt-1">
                    {toPersianDigits(rel.readingTimeMinutes)} دقیقه مطالعه
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
