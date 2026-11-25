import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  ChevronLeft,
  Clock,
  Search,
  Tag,
  User,
  X,
} from 'lucide-react';
import { SmartImage } from '../components/SmartImage';
import { useStore } from '../context/StoreContext';
import { resolveBlogCoverImage } from '../data/catalog';
import { storeApi } from '../lib/authApi';
import type { BlogPostItem } from '../types/store';
import { formatPersianDate, toPersianDigits } from '../utils/storeLogic';

export const BlogListPage: React.FC = () => {
  const { buildHref, handleLinkClick } = useStore();

  const initialUrlParams =
    typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialUrlParams?.get('category') || 'all'
  );
  const [selectedTag, setSelectedTag] = useState<string>(initialUrlParams?.get('tag') || '');
  const [searchInput, setSearchInput] = useState<string>(initialUrlParams?.get('q') || '');
  const [submittedSearch, setSubmittedSearch] = useState<string>(initialUrlParams?.get('q') || '');
  const [page, setPage] = useState(1);

  const [posts, setPosts] = useState<BlogPostItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setErrorMessage(null);

    storeApi
      .getBlogPosts({
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        tag: selectedTag || undefined,
        q: submittedSearch || undefined,
        page,
        limit: 9,
      })
      .then((res) => {
        if (!active) return;
        setPosts(Array.isArray(res.posts) ? res.posts : []);
        setCategories(Array.isArray(res.categories) ? res.categories : []);
        setTotal(Number(res.total) || 0);
        setTotalPages(Math.max(1, Number(res.totalPages) || 1));
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setErrorMessage(
          err instanceof Error ? err.message : 'خطا در دریافت مقالات مجله تخصصی.'
        );
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page, selectedCategory, selectedTag, submittedSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSubmittedSearch(searchInput.trim());
  };

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedTag('');
    setSearchInput('');
    setSubmittedSearch('');
    setPage(1);
  };

  const hasActiveFilters =
    selectedCategory !== 'all' || Boolean(selectedTag) || Boolean(submittedSearch);

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav aria-label="مسیر صفحه" className="flex items-center gap-2 text-xs text-[#576071]">
        <a
          href={buildHref('/')}
          onClick={(e) => handleLinkClick(e, '/')}
          className="hover:text-[#1453D6] transition-colors"
        >
          صفحه اصلی
        </a>
        <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
        <span className="text-[#11161E] font-medium">مجله تخصصی موبایل امیر</span>
      </nav>

      {/* Editorial Header + Search */}
      <section className="bg-white rounded-2xl border border-[#E4E8EE] p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#EEF3FC] text-[#1453D6] text-xs font-medium">
            <BookOpen className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span>بررسی تخصصی و راهنمای خرید</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#11161E]">
            مجله تخصصی موبایل امیر
          </h1>
          <p className="text-xs sm:text-sm text-[#4A5464] leading-7">
            مقایسه‌های میدانی دوربین پرچمداران، راهنمای انتخاب لوازم جانبی اورجینال، آموزش رجیستری همتا و بررسی فناوری‌های نوین موبایل.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="w-full lg:w-96 flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="جستجو در عنوان یا برچسب مقالات"
              aria-label="جستجو در مقالات مجله"
              className="w-full h-11 pr-10 pl-3 rounded-lg bg-[#F7F8FA] border border-[#E4E8EE] text-xs sm:text-sm text-[#11161E] placeholder:text-[#576071] focus:outline-none focus:border-[#1453D6]"
            />
            <Search
              className="w-4 h-4 text-[#576071] absolute right-3 top-1/2 -translate-y-1/2"
              strokeWidth={1.5}
            />
          </div>
          <button
            type="submit"
            className="h-11 px-4 rounded-lg bg-[#1453D6] hover:bg-[#0F44B5] text-white text-xs sm:text-sm font-medium shrink-0 transition-colors"
          >
            جستجو
          </button>
        </form>
      </section>

      {/* Filter Bar */}
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              setPage(1);
            }}
            className={`h-9 px-3.5 rounded-lg text-xs font-medium border transition-colors ${
              selectedCategory === 'all'
                ? 'bg-[#1453D6] text-white border-[#1453D6]'
                : 'bg-white text-[#4A5464] border-[#E4E8EE] hover:border-[#C5CEDB]'
            }`}
          >
            همه مقالات
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setSelectedCategory(cat);
                setPage(1);
              }}
              className={`h-9 px-3.5 rounded-lg text-xs font-medium border transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#1453D6] text-white border-[#1453D6]'
                  : 'bg-white text-[#4A5464] border-[#E4E8EE] hover:border-[#C5CEDB]'
              }`}
            >
              {cat}
            </button>
          ))}

          {selectedTag && (
            <button
              type="button"
              onClick={() => {
                setSelectedTag('');
                setPage(1);
              }}
              className="h-9 px-3 rounded-lg text-xs font-medium bg-[#EEF3FC] text-[#1453D6] border border-[#D4E2FC] inline-flex items-center gap-1.5"
            >
              <Tag className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>برچسب: {selectedTag}</span>
              <X className="w-3.5 h-3.5" strokeWidth={1.75} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-[#576071] tabular-nums-fa">
          {!loading && <span>{toPersianDigits(total)} مقاله منتشرشده</span>}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-[#1453D6] hover:underline font-medium"
            >
              پاک کردن فیلترها
            </button>
          )}
        </div>
      </section>

      {/* Articles Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white rounded-xl border border-[#E4E8EE] overflow-hidden animate-pulse"
            >
              <div className="aspect-[16/9] bg-[#EEF1F5]" />
              <div className="p-5 space-y-3">
                <div className="h-4 w-24 bg-[#EEF1F5] rounded" />
                <div className="h-5 w-full bg-[#EEF1F5] rounded" />
                <div className="h-4 w-5/6 bg-[#EEF1F5] rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : errorMessage ? (
        <div className="bg-white rounded-2xl border border-[#E4E8EE] p-8 text-center space-y-4">
          <p className="text-sm text-[#B42318] font-medium">{errorMessage}</p>
          <button
            type="button"
            onClick={() => setPage((p) => p)}
            className="h-10 px-5 rounded-lg bg-[#1453D6] text-white text-xs font-medium"
          >
            تلاش مجدد
          </button>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E4E8EE] p-10 text-center space-y-4">
          <p className="text-sm font-medium text-[#11161E]">
            مقاله‌ای با این مشخصات یافت نشد.
          </p>
          <p className="text-xs text-[#4A5464]">
            عبارت جستجو یا دسته‌بندی انتخاب‌شده را تغییر دهید تا سایر مقالات نمایش داده شوند.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="h-10 px-5 rounded-lg bg-[#EEF3FC] text-[#1453D6] text-xs font-medium"
          >
            نمایش همه مقالات
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <article
              key={post.id}
              data-testid={`blog-card-${post.slug}`}
              className="group card-lift bg-white rounded-xl border border-[#E4E8EE] overflow-hidden flex flex-col hover:border-[#C5CEDB] hover:shadow-md transition-[border-color,box-shadow]"
            >
              <a
                href={buildHref(`/blog/${post.slug}`)}
                onClick={(e) => handleLinkClick(e, `/blog/${post.slug}`)}
                className="aspect-[16/9] bg-[#F3F5F8] overflow-hidden block"
              >
                <SmartImage
                  src={resolveBlogCoverImage(post.coverImage)}
                  alt={post.title}
                  optimizeWidth={640}
                  className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                />
              </a>

              <div className="p-5 flex-1 flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#576071]">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#EEF3FC] text-[#1453D6] font-medium">
                    {post.category}
                  </span>
                  <span className="inline-flex items-center gap-1 tabular-nums-fa">
                    <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>{toPersianDigits(post.readingTimeMinutes)} دقیقه مطالعه</span>
                  </span>
                </div>

                <h2 className="text-base font-semibold text-[#11161E] leading-7">
                  <a
                    href={buildHref(`/blog/${post.slug}`)}
                    onClick={(e) => handleLinkClick(e, `/blog/${post.slug}`)}
                    className="hover:text-[#1453D6] transition-colors"
                  >
                    {post.title}
                  </a>
                </h2>

                <p className="text-xs text-[#4A5464] leading-6 flex-1 line-clamp-3">
                  {post.excerpt}
                </p>

                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {post.tags.slice(0, 3).map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          setSelectedTag(tag);
                          setPage(1);
                        }}
                        className="px-2 py-0.5 rounded bg-[#F7F8FA] hover:bg-[#EEF3FC] border border-[#E4E8EE] text-[11px] text-[#4A5464] hover:text-[#1453D6] transition-colors"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                )}

                <div className="pt-3 border-t border-[#E4E8EE] flex items-center justify-between text-[11px] text-[#576071]">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1">
                      <User className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>{post.authorName}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 tabular-nums-fa">
                      <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>{formatPersianDate(post.publishedAt)}</span>
                    </span>
                  </div>

                  <a
                    href={buildHref(`/blog/${post.slug}`)}
                    onClick={(e) => handleLinkClick(e, `/blog/${post.slug}`)}
                    className="text-xs font-medium text-[#1453D6] hover:underline inline-flex items-center gap-1 shrink-0"
                  >
                    <span>ادامه مطلب</span>
                    <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setPage(num)}
              className={`w-9 h-9 rounded-lg text-xs font-medium border tabular-nums-fa transition-colors ${
                page === num
                  ? 'bg-[#1453D6] text-white border-[#1453D6]'
                  : 'bg-white text-[#11161E] border-[#E4E8EE] hover:border-[#C5CEDB]'
              }`}
            >
              {toPersianDigits(num)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
