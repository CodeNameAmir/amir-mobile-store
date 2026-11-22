// TEMPORARY COMPONENT: Displays the active GitHub commit / build metadata in CI deployments.
import React, { useMemo, useState } from 'react';
import {
  Check,
  Clock,
  Copy,
  ExternalLink,
  GitBranch,
  GitCommitHorizontal,
  X,
} from 'lucide-react';
import { formatIsoToFaDateTime, getCurrentBuildInfo } from '../utils/buildInfo';
import { toPersianDigits } from '../utils/storeLogic';

export const TempCommitBanner: React.FC = () => {
  const info = useMemo(() => getCurrentBuildInfo(), []);
  const [collapsed, setCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!info.hasCommit) {
    return null;
  }

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
        className="bg-[#F1F3F6] border-b border-[#E4E8EE] no-print"
        data-testid="temp-commit-banner-collapsed"
      >
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-1.5 flex items-center justify-between gap-2 text-[11px] text-[#4A5464]">
          <span className="inline-flex items-center gap-1.5 min-w-0">
            <GitCommitHorizontal className="w-3.5 h-3.5 text-[#1453D6] shrink-0" strokeWidth={1.5} />
            <span className="truncate">اطلاعات کامیت بیلد</span>
            {info.shortSha && (
              <code dir="ltr" className="font-mono font-medium text-[#11161E] shrink-0">
                {info.shortSha}
              </code>
            )}
          </span>
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="text-[#1453D6] hover:underline font-medium shrink-0"
          >
            نمایش
          </button>
        </div>
      </div>
    );
  }

  return (
    <section
      aria-label="اطلاعات کامیت گیت‌هاب"
      data-testid="temp-commit-banner"
      className="bg-[#F1F3F6] border-b border-[#E4E8EE] text-[#11161E] no-print"
    >
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-1.5 flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] min-w-0 flex-1 text-[#4A5464]">
          <div className="inline-flex items-center gap-1.5 font-medium text-[#11161E] shrink-0">
            <GitCommitHorizontal className="w-3.5 h-3.5 text-[#1453D6] shrink-0" strokeWidth={1.5} />
            <span>بیلد:</span>
            <code
              dir="ltr"
              title={info.commitSha || undefined}
              data-testid="temp-commit-sha"
              className="px-1.5 py-0.5 rounded bg-white border border-[#E4E8EE] font-mono text-[11px] text-[#11161E]"
            >
              {info.shortSha}
            </code>
          </div>

          {info.branch && (
            <span className="inline-flex items-center gap-1 text-[11px] text-[#4A5464] shrink-0">
              <GitBranch className="w-3 h-3" strokeWidth={1.5} />
              <span dir="ltr">{info.branch}</span>
            </span>
          )}

          {info.runNumber && (
            <span className="text-[11px] text-[#4A5464] tabular-nums-fa shrink-0">
              شماره {toPersianDigits(info.runNumber)}
            </span>
          )}

          {info.commitMessage && (
            <span title={info.commitMessage} className="max-w-xs lg:max-w-md truncate">
              {info.commitMessage}
            </span>
          )}

          <span className="inline-flex items-center gap-1 text-[11px] text-[#6E7889] tabular-nums-fa shrink-0">
            <Clock className="w-3 h-3" strokeWidth={1.5} />
            <span>
              {info.commitDate
                ? formatIsoToFaDateTime(info.commitDate)
                : formatIsoToFaDateTime(info.builtAt)}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {info.commitSha && (
            <button
              type="button"
              onClick={handleCopy}
              aria-label="کپی شناسه کامل کامیت"
              className="h-7 px-2 rounded-md bg-white hover:bg-[#EAECEF] border border-[#E4E8EE] text-[11px] font-medium text-[#11161E] inline-flex items-center gap-1 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-[#147A4B]" strokeWidth={1.5} />
                  <span className="text-[#147A4B]">کپی شد</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-[#4A5464]" strokeWidth={1.5} />
                  <span className="hidden sm:inline">کپی</span>
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
              className="h-7 px-2 rounded-md bg-white hover:bg-[#EAECEF] border border-[#E4E8EE] text-[#11161E] text-[11px] font-medium inline-flex items-center gap-1 transition-colors"
            >
              <span className="hidden sm:inline">گیت‌هاب</span>
              <ExternalLink className="w-3 h-3" strokeWidth={1.5} />
            </a>
          )}

          <button
            type="button"
            onClick={() => setCollapsed(true)}
            aria-label="بستن نوار کامیت"
            className="h-7 w-7 rounded-md hover:bg-[#EAECEF] text-[#6E7889] hover:text-[#11161E] inline-flex items-center justify-center transition-colors"
          >
            <X className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </section>
  );
};
