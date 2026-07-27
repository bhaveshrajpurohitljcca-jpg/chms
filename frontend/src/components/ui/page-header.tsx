import type { ReactNode } from 'react';
import Breadcrumb from './breadcrumb';
import type { BreadcrumbItem } from './breadcrumb';

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  className?: string;
}

export const PageHeader = ({
  title,
  description,
  breadcrumbs,
  actions,
  className = ''
}: PageHeaderProps) => {
  return (
    <div className={`flex flex-col gap-3 pb-6 border-b border-white/5 font-manrope ${className}`}>
      {/* Breadcrumbs */}
      {breadcrumbs && <Breadcrumb items={breadcrumbs} className="mb-1" />}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-archivo text-2xl md:text-3xl font-black uppercase tracking-wider text-white">
            {title}
          </h1>
          {description && (
            <p className="text-xs md:text-sm text-[rgba(255,255,255,0.5)] leading-relaxed max-w-2xl">
              {description}
            </p>
          )}
        </div>

        {/* Action Panel */}
        {actions && (
          <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
