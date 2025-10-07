import { Badge } from '@/components/ui/badge';
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';

type StatusType = 'normal' | 'warning' | 'danger' | 'problem';

interface StatusBadgeProps {
  status: StatusType;
  count?: number;
  showIcon?: boolean;
  label?: string;
}

export const StatusBadge = ({ status, count, showIcon = true, label }: StatusBadgeProps) => {
  const getConfig = () => {
    switch (status) {
      case 'normal':
        return {
          icon: CheckCircle,
          className: 'bg-green-100 text-green-800 border-green-200',
          text: label || 'Normal',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          text: label || 'Warning',
        };
      case 'danger':
      case 'problem':
        return {
          icon: AlertCircle,
          className: 'bg-red-100 text-red-800 border-red-200',
          text: label || (count !== undefined ? `${count} Problem${count !== 1 ? 's' : ''}` : 'Problem'),
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <Badge className={config.className}>
      {showIcon && <Icon className="h-3 w-3 mr-1" />}
      {config.text}
    </Badge>
  );
};

interface ProblemBadgeProps {
  count: number;
}

export const ProblemBadge = ({ count }: ProblemBadgeProps) => {
  if (count === 0) return null;
  return <StatusBadge status="problem" count={count} />;
};
