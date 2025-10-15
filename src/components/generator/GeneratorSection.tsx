import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

interface GeneratorSectionProps {
  title: string;
  children: React.ReactNode;
  disabled?: boolean;
  value: string;
}

export function GeneratorSection({
  title,
  children,
  disabled = false,
  value,
}: GeneratorSectionProps) {
  return (
    <AccordionItem value={value} className="border rounded-lg">
      <AccordionTrigger 
        className={cn(
          'px-3 sm:px-4 py-2 sm:py-3 hover:no-underline',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        disabled={disabled}
      >
        <div className="flex items-center w-full pr-4">
          <h3 className="text-sm sm:text-base font-semibold">{title}</h3>
        </div>
      </AccordionTrigger>

      <AccordionContent className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-2 sm:space-y-3">
        {children}
      </AccordionContent>
    </AccordionItem>
  );
}
