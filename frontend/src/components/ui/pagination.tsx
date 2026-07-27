
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './button';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className = ''
}: PaginationProps) => {
  if (totalPages <= 1) return null;

  // Generate page numbers
  const pages = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className={`flex items-center justify-center gap-2 font-manrope ${className}`}>
      {/* Prev Button */}
      <Button
        variant="secondary"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-10 h-10 p-0 rounded-full flex items-center justify-center border border-white/10"
      >
        <ChevronLeft size={16} />
      </Button>

      {/* Page Numbers */}
      {start > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="w-10 h-10 rounded-full text-xs font-semibold hover:bg-white/5 transition-all text-white/60 hover:text-white"
          >
            1
          </button>
          {start > 2 && <span className="text-zinc-500 text-xs px-1 select-none">...</span>}
        </>
      )}

      {pages.map((p) => {
        const isCurrent = p === currentPage;
        return (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-10 h-10 rounded-full text-xs font-bold transition-all duration-300 ${
              isCurrent
                ? 'bg-accent-primary text-black shadow-[0_0_12px_rgba(0,243,255,0.25)]'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            {p}
          </button>
        );
      })}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="text-zinc-500 text-xs px-1 select-none">...</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            className="w-10 h-10 rounded-full text-xs font-semibold hover:bg-white/5 transition-all text-white/60 hover:text-white"
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next Button */}
      <Button
        variant="secondary"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-10 h-10 p-0 rounded-full flex items-center justify-center border border-white/10"
      >
        <ChevronRight size={16} />
      </Button>
    </div>
  );
};

export default Pagination;
