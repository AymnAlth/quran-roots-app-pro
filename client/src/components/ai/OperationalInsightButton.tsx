import React from 'react';
import { Sparkles } from 'lucide-react';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface OperationalInsightButtonProps {
  surahNo: number;
  ayahNo: number;
  ayahText: string;
  size?: 'default' | 'compact';
  className?: string;
  stopPropagation?: boolean;
}

export const OperationalInsightButton: React.FC<OperationalInsightButtonProps> = ({
  surahNo,
  ayahNo,
  ayahText,
  size = 'default',
  className,
  stopPropagation = false,
}) => {
  const [, setLocation] = useLocation();

  const handleNavigate = (event: React.MouseEvent) => {
    if (stopPropagation) {
      event.stopPropagation();
    }

    const payload = {
      surahNo,
      ayahNo,
      ayahText,
    };

    const cacheKey = `op_insight_${surahNo}_${ayahNo}_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 8)}`;

    try {
      sessionStorage.setItem(cacheKey, JSON.stringify(payload));
    } catch {
      // no-op: fallback query params below still allow page rendering
    }

    const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    const query = new URLSearchParams({
      k: cacheKey,
      s: String(surahNo),
      a: String(ayahNo),
      t: ayahText,
      from: currentPath,
    });

    setLocation(`/insights/operational?${query.toString()}`);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={handleNavigate}
          className={cn(
            'inline-flex items-center justify-center rounded-full border border-primary/20 bg-gradient-to-b from-background to-background/70 text-primary shadow-sm backdrop-blur-sm transition-all hover:-translate-y-[1px] hover:border-primary/45 hover:bg-primary/10 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
            size === 'compact' ? 'h-6 w-6' : 'h-8 w-8',
            className
          )}
          aria-label="فتح صفحة التحليل التشغيلي"
          title="فتح صفحة التحليل التشغيلي"
        >
          <Sparkles className={cn(size === 'compact' ? 'h-3.5 w-3.5' : 'h-4 w-4')} />
        </button>
      </TooltipTrigger>
      <TooltipContent sideOffset={6}>
        فتح صفحة التحليل التشغيلي
      </TooltipContent>
    </Tooltip>
  );
};

