import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div className={`${hover ? 'card-hover' : 'card'} ${className}`}>
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: ReactNode;
  trend?: number;
  color?: string;
}

export function StatCard({ label, value, sub, icon, trend, color = '#368547' }: StatCardProps) {
  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-brand-text2">{label}</span>
        {icon && (
          <span className="p-2 rounded-xl" style={{ background: `${color}18` }}>
            <span style={{ color }}>{icon}</span>
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold font-sora text-brand-text">{value}</p>
        {sub && <p className="text-xs text-brand-text3 mt-0.5">{sub}</p>}
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          <span>{trend >= 0 ? '▲' : '▼'}</span>
          <span>{Math.abs(trend).toFixed(2)}% este mês</span>
        </div>
      )}
    </div>
  );
}
