import React from 'react';

interface SkeletonBoxProps {
  className?: string;
}

export const SkeletonBox: React.FC<SkeletonBoxProps> = ({ className = 'h-4 w-full rounded-lg' }) => (
  <div aria-hidden="true" className={`skeleton-shimmer ${className}`} />
);

export const OrderRowSkeleton: React.FC = () => (
  <div
    aria-hidden="true"
    className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E4E8EE] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
  >
    <div className="space-y-2.5 flex-1">
      <div className="flex flex-wrap items-center gap-2">
        <SkeletonBox className="h-4 w-24 rounded-md" />
        <SkeletonBox className="h-3.5 w-20 rounded-md" />
        <SkeletonBox className="h-3.5 w-28 rounded-md" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <SkeletonBox className="h-3.5 w-32 rounded-md" />
        <SkeletonBox className="h-3.5 w-24 rounded-md" />
      </div>
    </div>
    <div className="flex items-center gap-2 shrink-0">
      <SkeletonBox className="h-9 w-24 rounded-lg" />
      <SkeletonBox className="h-9 w-28 rounded-lg" />
    </div>
  </div>
);

export const AccountPageSkeleton: React.FC = () => (
  <div
    role="status"
    aria-busy="true"
    aria-label="در حال بارگذاری حساب کاربری"
    data-testid="account-page-skeleton"
    className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8"
  >
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <aside className="lg:col-span-3 bg-white rounded-2xl border border-[#E4E8EE] p-5 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-[#E4E8EE]">
          <SkeletonBox className="w-12 h-12 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonBox className="h-4 w-28 rounded-md" />
            <SkeletonBox className="h-3 w-36 rounded-md" />
            <SkeletonBox className="h-3 w-20 rounded-md" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-col gap-2">
          {Array.from({ length: 6 }).map((_, idx) => (
            <SkeletonBox key={idx} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      </aside>

      <div className="lg:col-span-9 space-y-6">
        <section className="bg-white rounded-2xl border border-[#E4E8EE] p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <SkeletonBox className="h-7 w-44 rounded-lg" />
              <SkeletonBox className="h-4 w-64 rounded-md" />
            </div>
            <div className="flex items-center gap-2">
              <SkeletonBox className="h-10 w-28 rounded-lg" />
              <SkeletonBox className="h-10 w-28 rounded-lg" />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-[#E4E8EE]">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[#F7F8FA] space-y-2">
                <SkeletonBox className="h-3.5 w-24 rounded-md" />
                <SkeletonBox className="h-7 w-12 rounded-lg" />
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-[#E4E8EE] p-6 sm:p-8 space-y-4">
          <SkeletonBox className="h-5 w-32 rounded-md" />
          <div className="space-y-3">
            <OrderRowSkeleton />
            <OrderRowSkeleton />
          </div>
        </section>
      </div>
    </div>
  </div>
);

export const AuthPageSkeleton: React.FC = () => (
  <div
    role="status"
    aria-busy="true"
    aria-label="در حال بارگذاری ورود و ثبت‌نام"
    data-testid="auth-page-skeleton"
    className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8 space-y-8"
  >
    <div className="max-w-xl mx-auto bg-white rounded-2xl border border-[#E4E8EE] p-6 sm:p-8 space-y-5">
      <div className="space-y-2">
        <SkeletonBox className="h-6 w-48 rounded-lg" />
        <SkeletonBox className="h-4 w-72 max-w-full rounded-md" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <SkeletonBox className="h-10 rounded-lg" />
        <SkeletonBox className="h-10 rounded-lg" />
        <SkeletonBox className="h-10 rounded-lg" />
      </div>
      <div className="space-y-4 pt-2">
        <SkeletonBox className="h-11 w-full rounded-lg" />
        <SkeletonBox className="h-11 w-full rounded-lg" />
        <SkeletonBox className="h-11 w-full rounded-lg" />
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E4E8EE] p-6 sm:p-8 space-y-4">
        <SkeletonBox className="h-5 w-44 rounded-md" />
        <SkeletonBox className="h-28 w-full rounded-xl" />
      </div>
      <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E4E8EE] p-6 sm:p-8 space-y-4">
        <SkeletonBox className="h-5 w-44 rounded-md" />
        <SkeletonBox className="h-28 w-full rounded-xl" />
      </div>
    </div>
  </div>
);

export const TrackingPageSkeleton: React.FC = () => (
  <div
    role="status"
    aria-busy="true"
    aria-label="در حال دریافت اطلاعات مرسوله"
    data-testid="tracking-page-skeleton"
    className="space-y-6"
  >
    <section className="bg-white rounded-2xl border border-[#E4E8EE] p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E4E8EE] pb-4">
        <div className="space-y-2 flex-1 min-w-[200px]">
          <SkeletonBox className="h-3.5 w-32 rounded-md" />
          <SkeletonBox className="h-6 w-72 max-w-full rounded-lg" />
        </div>
        <SkeletonBox className="h-10 w-48 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E4E8EE] space-y-2">
            <SkeletonBox className="h-4 w-32 rounded-md" />
            <SkeletonBox className="h-3 w-24 rounded-md" />
          </div>
        ))}
      </div>
    </section>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E4E8EE] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <SkeletonBox className="h-5 w-44 rounded-md" />
          <SkeletonBox className="h-4 w-32 rounded-md" />
        </div>
        <SkeletonBox className="h-56 w-full rounded-xl" />
      </div>
      <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E4E8EE] p-6 space-y-5">
        <SkeletonBox className="h-28 w-full rounded-xl" />
        <div className="space-y-2.5">
          <SkeletonBox className="h-5 w-32 rounded-md" />
          <SkeletonBox className="h-12 w-full rounded-lg" />
          <SkeletonBox className="h-12 w-full rounded-lg" />
        </div>
      </div>
    </div>
  </div>
);

export const OrderConfirmationSkeleton: React.FC = () => (
  <div
    role="status"
    aria-busy="true"
    aria-label="در حال بارگذاری فاکتور سفارش"
    data-testid="order-confirmation-skeleton"
    className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8 space-y-6"
  >
    <section className="bg-white rounded-2xl border border-[#E4E8EE] p-6 sm:p-10 space-y-5">
      <SkeletonBox className="w-16 h-16 rounded-full mx-auto" />
      <SkeletonBox className="h-6 w-52 rounded-lg mx-auto" />
      <SkeletonBox className="h-8 w-96 max-w-full rounded-lg mx-auto" />
      <SkeletonBox className="h-4 w-80 max-w-full rounded-md mx-auto" />
      <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <SkeletonBox className="h-14 w-full rounded-xl" />
        <SkeletonBox className="h-14 w-full rounded-xl" />
      </div>
    </section>

    <section className="bg-white rounded-2xl border border-[#E4E8EE] p-6 space-y-5">
      <div className="flex items-center justify-between">
        <SkeletonBox className="h-5 w-48 rounded-md" />
        <SkeletonBox className="h-4 w-36 rounded-md" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <SkeletonBox key={idx} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    </section>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E4E8EE] p-6 space-y-3">
        <SkeletonBox className="h-5 w-36 rounded-md" />
        <SkeletonBox className="h-20 w-full rounded-xl" />
        <SkeletonBox className="h-20 w-full rounded-xl" />
      </div>
      <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E4E8EE] p-6 space-y-4">
        <SkeletonBox className="h-5 w-40 rounded-md" />
        <SkeletonBox className="h-14 w-full rounded-lg" />
        <SkeletonBox className="h-14 w-full rounded-lg" />
        <SkeletonBox className="h-11 w-full rounded-lg" />
      </div>
    </div>
  </div>
);

export const ReviewCardSkeleton: React.FC = () => (
  <div
    aria-hidden="true"
    className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E4E8EE] space-y-2.5"
  >
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <SkeletonBox className="h-3.5 w-24 rounded-md" />
        <SkeletonBox className="h-4 w-20 rounded-md" />
      </div>
      <SkeletonBox className="h-3 w-16 rounded-md" />
    </div>
    <SkeletonBox className="h-3.5 w-24 rounded-md" />
    <SkeletonBox className="h-3.5 w-full rounded-md" />
    <SkeletonBox className="h-3.5 w-3/4 rounded-md" />
  </div>
);

export const StatusDiagSkeleton: React.FC = () => (
  <div
    aria-busy="true"
    aria-label="در حال بررسی وضعیت پایگاه داده"
    className="p-5 rounded-xl bg-[#F7F8FA] border border-[#E4E8EE] space-y-3"
  >
    <div className="flex items-center justify-between gap-2">
      <SkeletonBox className="h-4 w-56 rounded-md" />
      <SkeletonBox className="h-5 w-36 rounded-md" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <SkeletonBox className="h-11 w-full rounded-lg" />
      <SkeletonBox className="h-11 w-full rounded-lg" />
      <SkeletonBox className="h-11 w-full rounded-lg" />
    </div>
  </div>
);

export const ProductCardSkeleton: React.FC<{ compact?: boolean }> = ({ compact = false }) => (
  <article
    aria-hidden="true"
    data-testid="product-card-skeleton"
    className="bg-white rounded-xl border border-[#E4E8EE] flex flex-col overflow-hidden"
  >
    <div className="relative bg-[#F3F5F8] p-4 aspect-[4/3] overflow-hidden">
      <SkeletonBox className="w-full h-full rounded-lg" />
    </div>
    <div className={`flex-1 flex flex-col ${compact ? 'p-4' : 'p-5'} gap-2.5`}>
      <div className="flex items-center justify-between gap-2">
        <SkeletonBox className="h-3.5 w-16 rounded-md" />
        <SkeletonBox className="h-3.5 w-14 rounded-md" />
      </div>
      <div className="space-y-1.5 min-h-[48px]">
        <SkeletonBox className="h-4 w-full rounded-md" />
        <SkeletonBox className="h-4 w-3/4 rounded-md" />
      </div>
      <SkeletonBox className="h-3.5 w-4/5 rounded-md" />
      <div className="mt-auto pt-3 border-t border-[#E4E8EE] flex items-end justify-between gap-2">
        <div className="space-y-1.5 flex-1">
          <SkeletonBox className="h-3 w-20 rounded-md" />
          <SkeletonBox className="h-5 w-28 rounded-md" />
        </div>
        <SkeletonBox className="h-9 w-16 rounded-lg shrink-0" />
      </div>
    </div>
  </article>
);

export const ProductBuyBoxSkeleton: React.FC = () => (
  <div
    role="status"
    aria-busy="true"
    aria-label="در حال بررسی موجودی و قیمت لحظه‌ای"
    data-testid="pdp-buybox-skeleton"
    className="space-y-4"
  >
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <SkeletonBox className="h-3.5 w-24 rounded-md" />
        <SkeletonBox className="h-4 w-20 rounded-md" />
      </div>
      <SkeletonBox className="h-8 w-44 rounded-lg" />
      <div className="flex items-center gap-2 pt-0.5">
        <SkeletonBox className="h-3.5 w-3.5 rounded-full shrink-0" />
        <SkeletonBox className="h-3.5 w-48 rounded-md" />
      </div>
      <SkeletonBox className="h-3 w-40 rounded-md" />
    </div>

    <div className="p-3 rounded-lg bg-white border border-[#E4E8EE] space-y-2">
      <div className="flex items-center justify-between">
        <SkeletonBox className="h-3.5 w-28 rounded-md" />
        <SkeletonBox className="h-3.5 w-16 rounded-md" />
      </div>
      <SkeletonBox className="h-3 w-full rounded-md" />
    </div>

    <div className="flex items-center justify-between bg-white rounded-lg border border-[#E4E8EE] p-2">
      <SkeletonBox className="h-4 w-12 rounded-md mr-2" />
      <div className="flex items-center gap-2">
        <SkeletonBox className="w-8 h-8 rounded-lg" />
        <SkeletonBox className="w-6 h-5 rounded-md" />
        <SkeletonBox className="w-8 h-8 rounded-lg" />
      </div>
    </div>

    <div className="space-y-2.5">
      <SkeletonBox className="h-12 w-full rounded-lg" />
      <SkeletonBox className="h-11 w-full rounded-lg" />
    </div>

    <p className="text-[11px] font-medium text-[#4A5464] text-center">
      در حال استعلام موجودی و قیمت لحظه‌ای از انبار...
    </p>
  </div>
);

export const ProductDetailSkeleton: React.FC = () => (
  <div
    role="status"
    aria-busy="true"
    aria-label="در حال بارگذاری مشخصات و موجودی محصول"
    data-testid="pdp-skeleton"
    className="max-w-[1440px] mx-auto px-4 lg:px-8 py-6 md:py-8 space-y-10"
  >
    {/* Breadcrumb skeleton */}
    <div className="flex items-center gap-2">
      <SkeletonBox className="h-3.5 w-28 rounded-md" />
      <SkeletonBox className="h-3.5 w-20 rounded-md" />
      <SkeletonBox className="h-3.5 w-48 rounded-md" />
    </div>

    {/* Main 3-Column PDP Skeleton */}
    <div className="bg-white rounded-2xl border border-[#E4E8EE] p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Col 1: Gallery + Thumbs */}
      <div className="lg:col-span-4 space-y-3">
        <SkeletonBox className="aspect-square w-full rounded-xl" />
        <div className="flex items-center gap-2 pb-1">
          {Array.from({ length: 4 }).map((_, idx) => (
            <SkeletonBox key={idx} className="w-16 h-16 rounded-lg shrink-0" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <SkeletonBox className="h-11 rounded-lg" />
          <SkeletonBox className="h-11 rounded-lg" />
        </div>
      </div>

      {/* Col 2: Title, Variants, Highlights */}
      <div className="lg:col-span-5 space-y-6">
        <div className="space-y-3 border-b border-[#E4E8EE] pb-5">
          <div className="flex items-center justify-between">
            <SkeletonBox className="h-4 w-20 rounded-md" />
            <SkeletonBox className="h-4 w-28 rounded-md" />
          </div>
          <SkeletonBox className="h-7 w-5/6 rounded-lg" />
          <SkeletonBox className="h-4 w-1/2 rounded-md" />
          <div className="flex items-center justify-between pt-1">
            <SkeletonBox className="h-3.5 w-44 rounded-md" />
            <SkeletonBox className="h-3.5 w-24 rounded-md" />
          </div>
        </div>

        {/* Color picker skeleton */}
        <div className="space-y-2.5">
          <SkeletonBox className="h-4 w-32 rounded-md" />
          <div className="flex flex-wrap gap-2.5">
            {Array.from({ length: 3 }).map((_, idx) => (
              <SkeletonBox key={idx} className="h-10 w-28 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Storage variants skeleton */}
        <div className="space-y-2.5">
          <SkeletonBox className="h-4 w-28 rounded-md" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {Array.from({ length: 3 }).map((_, idx) => (
              <SkeletonBox key={idx} className="h-16 rounded-lg" />
            ))}
          </div>
        </div>

        {/* 4 Hardware Highlights */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-[#F7F8FA] border border-[#E4E8EE] space-y-2"
            >
              <SkeletonBox className="h-3.5 w-20 rounded-md" />
              <SkeletonBox className="h-4 w-3/4 rounded-md" />
              <SkeletonBox className="h-3 w-full rounded-md" />
            </div>
          ))}
        </div>
      </div>

      {/* Col 3: Sticky Buy Box Skeleton */}
      <div className="lg:col-span-3">
        <div className="rounded-xl bg-[#F7F8FA] border border-[#E4E8EE] p-5 space-y-5">
          <div className="space-y-2.5 border-b border-[#E4E8EE] pb-4">
            <div className="flex items-center justify-between">
              <SkeletonBox className="h-3.5 w-16 rounded-md" />
              <SkeletonBox className="h-3.5 w-28 rounded-md" />
            </div>
            <SkeletonBox className="h-12 w-full rounded-lg" />
          </div>
          <div className="min-h-[388px]">
            <ProductBuyBoxSkeleton />
          </div>
        </div>
      </div>
    </div>

    {/* Specs Tabs Skeleton */}
    <section className="bg-white rounded-2xl border border-[#E4E8EE] overflow-hidden">
      <div className="flex items-center gap-4 border-b border-[#E4E8EE] px-6 py-4">
        <SkeletonBox className="h-5 w-32 rounded-md" />
        <SkeletonBox className="h-5 w-32 rounded-md" />
        <SkeletonBox className="h-5 w-28 rounded-md" />
      </div>
      <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, idx) => (
          <SkeletonBox key={idx} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    </section>
  </div>
);

export const ComparePageSkeleton: React.FC = () => (
  <div
    role="status"
    aria-busy="true"
    aria-label="در حال بارگذاری جدول مقایسه محصولات"
    data-testid="compare-page-skeleton"
    className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8 space-y-6"
  >
    <div className="bg-white rounded-2xl border border-[#E4E8EE] p-6 sm:p-8 space-y-3">
      <SkeletonBox className="h-6 w-44 rounded-lg" />
      <SkeletonBox className="h-7 w-72 max-w-full rounded-lg" />
      <SkeletonBox className="h-4 w-96 max-w-full rounded-md" />
    </div>
    <div className="bg-white rounded-2xl border border-[#E4E8EE] p-6 space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E4E8EE] space-y-3">
            <SkeletonBox className="aspect-[4/3] w-full rounded-lg" />
            <SkeletonBox className="h-4 w-5/6 rounded-md" />
            <SkeletonBox className="h-5 w-32 rounded-md" />
          </div>
        ))}
      </div>
      <div className="space-y-3 pt-2">
        {Array.from({ length: 5 }).map((_, idx) => (
          <SkeletonBox key={idx} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    </div>
  </div>
);

export const InstallmentsPageSkeleton: React.FC = () => (
  <div
    role="status"
    aria-busy="true"
    aria-label="در حال بارگذاری محاسبه‌گر خرید اقساطی"
    data-testid="installments-page-skeleton"
    className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8 space-y-8"
  >
    <section className="bg-white rounded-2xl border border-[#E4E8EE] p-6 sm:p-10 space-y-3">
      <SkeletonBox className="h-6 w-52 rounded-lg" />
      <SkeletonBox className="h-8 w-80 max-w-full rounded-lg" />
      <SkeletonBox className="h-4 w-full max-w-xl rounded-md" />
    </section>
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E4E8EE] p-6 sm:p-8 space-y-6">
        <SkeletonBox className="h-11 w-full rounded-lg" />
        <div className="grid grid-cols-4 gap-2.5">
          {Array.from({ length: 4 }).map((_, idx) => (
            <SkeletonBox key={idx} className="h-11 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-4 gap-2.5">
          {Array.from({ length: 4 }).map((_, idx) => (
            <SkeletonBox key={idx} className="h-11 rounded-lg" />
          ))}
        </div>
        <SkeletonBox className="h-36 w-full rounded-xl" />
      </div>
      <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E4E8EE] p-6 sm:p-8 space-y-4">
        <SkeletonBox className="h-6 w-44 rounded-lg" />
        <SkeletonBox className="h-24 w-full rounded-xl" />
        <SkeletonBox className="h-14 w-full rounded-lg" />
        <SkeletonBox className="h-14 w-full rounded-lg" />
        <SkeletonBox className="h-12 w-full rounded-lg" />
      </div>
    </div>
  </div>
);
