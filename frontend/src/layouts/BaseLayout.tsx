import React from 'react';

export interface BaseLayoutProps {
  children: React.ReactNode;
}

export const BaseLayout = ({ children }: BaseLayoutProps) => {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-manrope selection:bg-accent-primary selection:text-black">
      {children}
    </div>
  );
};

export default BaseLayout;
