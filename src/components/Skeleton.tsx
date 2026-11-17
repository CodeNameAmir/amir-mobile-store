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
    className="p-4 rounded-2xl bg-[#f8f9ff] border border-[#eff4ff] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
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
      <SkeletonBox className="h-9 w-24 rounded-xl" />
      <SkeletonBox className="h-9 w-28 rounded-xl" />
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
      <aside className="lg:col-span-3 bg-white rounded-3xl border border-[#e5eeff] p-5 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-[#eff4ff]">
          <SkeletonBox className="w-12 h-12 rounded-2xl shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonBox className="h-4 w-28 rounded-md" />
            <SkeletonBox className="h-3 w-36 rounded-md" />
            <SkeletonBox className="h-3 w-20 rounded-md" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-col gap-2">
          {Array.from({ length: 6 }).map((_, idx) => (
            <SkeletonBox key={idx} className="h-10 w-full rounded-xl" />
          ))}
        </div>
      </aside>

      <div className="lg:col-span-9 space-y-6">
        <section className="bg-white rounded-3xl border border-[#e5eeff] p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <SkeletonBox className="h-7 w-44 rounded-lg" />
              <SkeletonBox className="h-4 w-64 rounded-md" />
            </div>
            <div className="flex items-center gap-2">
              <SkeletonBox className="h-10 w-28 rounded-xl" />
              <SkeletonBox className="h-10 w-28 rounded-xl" />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-[#eff4ff]">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-[#f8f9ff] space-y-2">
                <SkeletonBox className="h-3.5 w-24 rounded-md" />
                <SkeletonBox className="h-7 w-12 rounded-lg" />
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-3xl border border-[#e5eeff] p-6 sm:p-8 space-y-4">
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

export const TrackingPageSkeleton: React.FC = () => (
  <div
    role="status"
    aria-busy="true"
    aria-label="در حال دریافت اطلاعات مرسوله"
    data-testid="tracking-page-skeleton"
    className="space-y-6"
  >
    <section className="bg-white rounded-3xl border border-[#e5eeff] p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#eff4ff] pb-4">
        <div className="space-y-2 flex-1 min-w-[200px]">
          <SkeletonBox className="h-3.5 w-32 rounded-md" />
          <SkeletonBox className="h-6 w-72 max-w-full rounded-lg" />
        </div>
        <SkeletonBox className="h-10 w-48 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="p-4 rounded-2xl bg-[#f8f9ff] border border-[#eff4ff] space-y-2">
            <SkeletonBox className="h-4 w-32 rounded-md" />
            <SkeletonBox className="h-3 w-24 rounded-md" />
          </div>
        ))}
      </div>
    </section>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 bg-white rounded-3xl border border-[#e5eeff] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <SkeletonBox className="h-5 w-44 rounded-md" />
          <SkeletonBox className="h-4 w-32 rounded-md" />
        </div>
        <SkeletonBox className="h-56 w-full rounded-2xl" />
      </div>
      <div className="lg:col-span-5 bg-white rounded-3xl border border-[#e5eeff] p-6 space-y-5">
        <SkeletonBox className="h-28 w-full rounded-2xl" />
        <div className="space-y-2.5">
          <SkeletonBox className="h-5 w-32 rounded-md" />
          <SkeletonBox className="h-12 w-full rounded-xl" />
          <SkeletonBox className="h-12 w-full rounded-xl" />
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
    <section className="bg-white rounded-3xl border border-[#e5eeff] p-6 sm:p-10 space-y-5">
      <SkeletonBox className="w-16 h-16 rounded-full mx-auto" />
      <SkeletonBox className="h-6 w-52 rounded-xl mx-auto" />
      <SkeletonBox className="h-8 w-96 max-w-full rounded-lg mx-auto" />
      <SkeletonBox className="h-4 w-80 max-w-full rounded-md mx-auto" />
      <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <SkeletonBox className="h-14 w-full rounded-2xl" />
        <SkeletonBox className="h-14 w-full rounded-2xl" />
      </div>
    </section>

    <section className="bg-white rounded-3xl border border-[#e5eeff] p-6 space-y-5">
      <div className="flex items-center justify-between">
        <SkeletonBox className="h-5 w-48 rounded-md" />
        <SkeletonBox className="h-4 w-36 rounded-md" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <SkeletonBox key={idx} className="h-24 w-full rounded-2xl" />
        ))}
      </div>
    </section>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 bg-white rounded-3xl border border-[#e5eeff] p-6 space-y-3">
        <SkeletonBox className="h-5 w-36 rounded-md" />
        <SkeletonBox className="h-20 w-full rounded-2xl" />
        <SkeletonBox className="h-20 w-full rounded-2xl" />
      </div>
      <div className="lg:col-span-5 bg-white rounded-3xl border border-[#e5eeff] p-6 space-y-4">
        <SkeletonBox className="h-5 w-40 rounded-md" />
        <SkeletonBox className="h-14 w-full rounded-xl" />
        <SkeletonBox className="h-14 w-full rounded-xl" />
        <SkeletonBox className="h-11 w-full rounded-xl" />
      </div>
    </div>
  </div>
);

export const ReviewCardSkeleton: React.FC = () => (
  <div
    aria-hidden="true"
    className="p-4 rounded-2xl bg-[#f8f9ff] border border-[#eff4ff] space-y-2.5"
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
    className="p-5 rounded-2xl bg-[#f8f9ff] border border-[#e5eeff] space-y-3"
  >
    <div className="flex items-center justify-between gap-2">
      <SkeletonBox className="h-4 w-56 rounded-md" />
      <SkeletonBox className="h-5 w-36 rounded-md" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <SkeletonBox className="h-11 w-full rounded-xl" />
      <SkeletonBox className="h-11 w-full rounded-xl" />
      <SkeletonBox className="h-11 w-full rounded-xl" />
    </div>
  </div>
);
