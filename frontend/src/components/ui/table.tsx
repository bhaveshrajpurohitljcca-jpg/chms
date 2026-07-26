import React from 'react';

export interface TableProps {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}

export const Table = ({ headers, children, className = '' }: TableProps) => {
  return (
    <div className={`w-full overflow-x-auto rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] ${className}`}>
      <table className="w-full text-left border-collapse font-manrope">
        <thead>
          <tr className="border-b border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]">
            {headers.map((header, idx) => (
              <th
                key={idx}
                className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.5)] select-none"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[rgba(255,255,255,0.05)] text-sm text-white">
          {children}
        </tbody>
      </table>
    </div>
  );
};

export interface TableRowProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const TableRow = ({ children, className = '', onClick }: TableRowProps) => {
  return (
    <tr
      onClick={onClick}
      className={`transition-colors duration-300 hover:bg-[rgba(255,255,255,0.03)] ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </tr>
  );
};

export interface TableCellProps {
  children: React.ReactNode;
  className?: string;
}

export const TableCell = ({ children, className = '' }: TableCellProps) => {
  return (
    <td className={`py-4 px-6 font-light ${className}`}>
      {children}
    </td>
  );
};
