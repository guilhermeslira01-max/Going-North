interface BadgeProps {
  role: 'admin' | 'pro' | 'free';
}

export function RoleBadge({ role }: BadgeProps) {
  if (role === 'admin') return <span className="badge-admin">Admin</span>;
  if (role === 'pro') return <span className="badge-pro">Pro</span>;
  return null;
}

interface StatusBadgeProps {
  status: string;
}

const statusStyles: Record<string, string> = {
  ativo: 'bg-green-100 text-green-700',
  concluido: 'bg-blue-100 text-blue-700',
  cancelado: 'bg-red-100 text-red-600',
  receita: 'bg-emerald-100 text-emerald-700',
  despesa: 'bg-red-100 text-red-600',
};

const statusLabels: Record<string, string> = {
  ativo: 'Ativo',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
  receita: 'Receita',
  despesa: 'Despesa',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-600'}`}>
      {statusLabels[status] || status}
    </span>
  );
}
