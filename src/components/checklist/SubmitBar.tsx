import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ProblemBadge } from '@/components/ui/status-badge';
import { CheckCircle, Send } from 'lucide-react';

interface SubmitBarProps {
  overallProgress: number;
  problemCount: number;
  isComplete: boolean;
  onSubmit: () => void;
  isSaving: boolean;
}

export const SubmitBar = ({ 
  overallProgress, 
  problemCount, 
  isComplete, 
  onSubmit,
  isSaving 
}: SubmitBarProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-50">
      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2 gap-2">
              <span className="text-xs sm:text-sm font-medium truncate">
                Progress: {overallProgress}%
              </span>
              <div className="flex items-center gap-2 flex-shrink-0">
                {problemCount > 0 && <ProblemBadge count={problemCount} />}
                {isSaving && <span className="text-xs text-muted-foreground hidden sm:inline">Saving...</span>}
              </div>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
          
          <Button
            onClick={onSubmit}
            disabled={!isComplete || isSaving}
            size="lg"
            className="gap-2 w-full sm:w-auto text-sm sm:text-base whitespace-nowrap"
          >
            {isComplete ? (
              <>
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">Submit Complete Checklist</span>
                <span className="sm:hidden">Submit</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Complete All Fields ({overallProgress}%)</span>
                <span className="sm:hidden">{overallProgress}%</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
