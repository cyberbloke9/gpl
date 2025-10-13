import { useEffect, useRef, useState } from 'react';

interface UseAutoSaveOptions {
  data: any;
  onSave: () => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

export function useAutoSave({ 
  data, 
  onSave, 
  delay = 2000, 
  enabled = true 
}: UseAutoSaveOptions) {
  const [status, setStatus] = useState<string>('');
  const timeoutRef = useRef<NodeJS.Timeout>();
  const previousDataRef = useRef(data);

  useEffect(() => {
    if (!enabled) return;

    // Check if data actually changed
    const dataChanged = JSON.stringify(data) !== JSON.stringify(previousDataRef.current);
    
    if (!dataChanged) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(async () => {
      setStatus('Saving...');
      try {
        await onSave();
        setStatus('Saved ✓');
        previousDataRef.current = data;
        
        // Clear status after 2 seconds
        setTimeout(() => setStatus(''), 2000);
      } catch (error) {
        setStatus('Failed to save');
        setTimeout(() => setStatus(''), 3000);
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, onSave, delay, enabled]);

  return { status };
}
