// TEMPORARY COMPONENT: Displays the active GitHub commit / build metadata.
// Delete this file and remove <TempCommitBanner /> from src/App.tsx when no longer needed.

import React, { useMemo, useState } from 'react';
import {
  Check,
  Clock,
  Copy,
  ExternalLink,
  GitBranch,
  GitCommitHorizontal,
  Info,
  X,
} from 'lucide-react';
import { formatIsoToFaDateTime, getCurrentBuildInfo } from '../utils/buildInfo';
import { toPersianDigits } from '../utils/storeLogic';

export const TempCommitBanner: React.FC = () => {
  const info = useMemo(() => getCurrentBuildInfo(), []);
  const [collapsed, setCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!info.commitSha) return;
    try {
      await navigator.clipboard.writeText(info.commitSha);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  if (collapsed) {
    return (
      <div
        className="bg-[#EEF3FC] border-b border-[#DCE1E8] no-print"
        data-testid="temp-commit-banner-collapsed"
      >
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-1.5 flex items-center justify-between gap-2 text-[11px] text-[#4A5464]">
          <span className="inline-flex items-center gap-1.5 min-w-0">
            <GitCommitHorizontal className="w-3.5 h-3.5 text-[#1453D6] shrink-0" />
            <span className="truncate">اطلاعات موقت کامیت گیت‌هاب پنهان شد</span>
            {info.shortSha && (
              <code dir="ltr" className="font-mono font-bold text-[#1453D6] shrink-0">
                {info.shortSha}
              </code>
            )}
          </span>
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="text-[#1453D6] hover:text-[#0F44B5] hover:underline font-semibold shrink-0"
          >
            نمایش مجدد
          </button>
        </div>
      </div>
    );
  }

  return (
    <section
      aria-label="اطلاعات موقت کامیت گیت‌هاب"
      data-testid="temp-commit-banner"
      className="bg-[#FDF1E8] border-b border-[#F5D0B5] text-[#11161E] no-print"
    >
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-2 flex items-start sm:items-center justify-between gap-3">
        {/* Primary commit details */}
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs min-w-0 flex-1">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F9DFCC] text-[#A84500] text-[11px] font-bold shrink-0">
            <Info className="w-3 h-3" />
            بخش موقت
          </span>

          <div className="inline-flex items-center gap-1.5 font-semibold text-[#11161E] shrink-0">
            <GitCommitHorizontal className="w-4 h-4 text-[#1453D6] shrink-0" />
            <span>کامیت فعال:</span>
            {info.hasCommit && info.shortSha ? (
              <code
                dir="ltr"
                title={info.commitSha || undefined}
                data-testid="temp-commit-sha"
                className="px-2 py-0.5 rounded-md bg-white border border-[#DCE1E8] font-mono text-xs font-bold text-[#1453D6]"
              >
                {info.shortSha}
              </code>
            ) : (
              <span
                data-testid="temp-commit-sha"
                className="px-2 py-0.5 rounded-md bg-white border border-[#F5D0B5] text-[11px] font-semibold text-[#A84500]"
              >
                پیش‌نمایش محلی (بدون Git)
              </span>
            )}
          </div>

          {info.branch && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-[#E4E8EE] text-[11px] font-medium text-[#4A5464] shrink-0">
              <GitBranch className="w-3 h-3 text-[#1453D6]" />
              <span dir="ltr">{info.branch}</span>
            </span>
          )}

          {info.runNumber && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-[#E4E8EE] text-[11px] font-medium text-[#4A5464] tabular-nums-fa shrink-0">
              بیلد #{toPersianDigits(info.runNumber)}
            </span>
          )}

          {info.commitMessage ? (
            <span
              title={info.commitMessage}
              className="max-w-full sm:max-w-xs lg:max-w-md truncate text-[11px] text-[#4A5464] font-medium"
            >
              «{info.commitMessage}»
            </span>
          ) : !info.hasCommit ? (
            <span className="hidden md:inline text-[11px] text-[#4A5464]">
              در بیلد گیت‌هاب شناسه و لینک کامیت به‌صورت خودکار نمایش داده می‌شود
            </span>
          ) : null}

          <span className="inline-flex items-center gap-1 text-[11px] text-[#4A5464] tabular-nums-fa shrink-0">
            <Clock className="w-3 h-3 text-[#6E7889]" />
            <span>
              {info.commitDate
                ? `زمان کامیت: ${formatIsoToFaDateTime(info.commitDate)}`
                : `زمان بیلد: ${formatIsoToFaDateTime(info.builtAt)}`}
            </span>
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {info.hasCommit && info.commitSha && (
            <button
              type="button"
              onClick={handleCopy}
              aria-label="کپی شناسه کامل کامیت"
              className="h-7 px-2.5 rounded-lg bg-white hover:bg-[#EEF3FC] border border-[#DCE1E8] text-[11px] font-semibold text-[#11161E] inline-flex items-center gap-1 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-700">کپی شد</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-[#1453D6]" />
                  <span className="hidden sm:inline">کپی هش</span>
                </>
              )}
            </button>
          )}

          {info.commitUrl && (
            <a
              href={info.commitUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="مشاهده کامیت در گیت‌هاب"
              className="h-7 px-2.5 rounded-lg bg-[#1453D6] hover:bg-[#0F44B5] text-white text-[11px] font-semibold inline-flex items-center gap-1 transition-colors"
            >
              <span className="hidden sm:inline">مشاهده در گیت‌هاب</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}

          <button
            type="button"
            onClick={() => setCollapsed(true)}
            aria-label="بستن موقت نوار کامیت"
            className="h-7 w-7 rounded-lg bg-white/85 hover:bg-white border border-[#F5D0B5] text-[#4A5464] hover:text-[#11161E] inline-flex items-center justify-center transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};
