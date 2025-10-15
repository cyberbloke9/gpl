import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GeneratorSectionProps {
  title: string;
  fieldCount: number;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export function GeneratorSection({
  title,
  fieldCount,
  isOpen,
  onToggle,
  children,
  disabled = false,
}: GeneratorSectionProps) {
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle} disabled={disabled}>
      <CollapsibleTrigger
        className={cn(
          'w-full flex items-center justify-between p-4 rounded-lg',
          'bg-blue-50 hover:bg-blue-100 transition-colors',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <div className="flex items-center gap-3">
          <ChevronDown
            className={cn(
              'h-5 w-5 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
          <span className="font-semibold text-base">{title}</span>
        </div>
        <Badge variant="secondary">{fieldCount} fields</Badge>
      </CollapsibleTrigger>

      <CollapsibleContent className="p-4 space-y-3">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}
