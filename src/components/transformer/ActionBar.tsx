import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Save, Trash2 } from 'lucide-react';

interface ActionBarProps {
  selectedHour: number;
  onPreviousHour: () => void;
  onNextHour: () => void;
  onSave: () => void;
  onClear: () => void;
  isSaving: boolean;
  isFormValid: boolean;
  isNextHourDisabled: boolean;
  autoSaveStatus?: string;
}

export function ActionBar({
  selectedHour,
  onPreviousHour,
  onNextHour,
  onSave,
  onClear,
  isSaving,
  isFormValid,
  isNextHourDisabled,
  autoSaveStatus,
}: ActionBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-2xl z-40">
      <div className="container mx-auto px-4 py-3">
        {autoSaveStatus && (
          <div className="text-center text-xs text-muted-foreground mb-2">
            {autoSaveStatus}
          </div>
        )}
        <div className="flex items-center gap-2">
          {/* Previous Hour */}
          <Button
            size="sm"
            variant="outline"
            onClick={onPreviousHour}
            disabled={selectedHour === 0}
            className="w-12 h-12 p-0"
            title="Previous Hour"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          {/* Clear */}
          <Button
            size="sm"
            variant="outline"
            onClick={onClear}
            className="flex-1 sm:flex-none sm:w-28"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
          
          {/* Save */}
          <Button
            size="sm"
            onClick={onSave}
            disabled={isSaving || !isFormValid}
            className="flex-[2] sm:flex-none sm:w-40 bg-green-600 hover:bg-green-700 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          
          {/* Next Hour */}
          <Button
            size="sm"
            variant="outline"
            onClick={onNextHour}
            disabled={selectedHour === 23 || isNextHourDisabled}
            className="w-12 h-12 p-0"
            title="Next Hour"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
