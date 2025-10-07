import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Module3Props {
  checklistId: string | null;
  data: any;
  onSave: (data: any) => void;
}

export const ChecklistModule3 = ({ checklistId, data, onSave }: Module3Props) => {
  const [formData, setFormData] = useState(data);

  useEffect(() => {
    setFormData(data);
  }, [data]);

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-2xl font-bold">Module 3: Performance Checks</h2>
      <div className="space-y-4">
        <div>
          <Label>Performance Metrics</Label>
          <Input
            value={formData.performance || ''}
            onChange={(e) => setFormData({ ...formData, performance: e.target.value })}
          />
        </div>
        <Button onClick={() => onSave(formData)}>Save Module 3</Button>
      </div>
    </div>
  );
};
