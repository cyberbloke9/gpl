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
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                Overall Progress: {overallProgress}%
              </span>
              <div className="flex items-center gap-2">
                {problemCount > 0 && <ProblemBadge count={problemCount} />}
                {isSaving && <span className="text-xs text-muted-foreground">Saving...</span>}
              </div>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
          
          <Button
            onClick={onSubmit}
            disabled={!isComplete || isSaving}
            size="lg"
            className="gap-2"
          >
            {isComplete ? (
              <>
                <Send className="h-4 w-4" />
                Submit Complete Checklist
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Complete All Fields ({overallProgress}%)
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
