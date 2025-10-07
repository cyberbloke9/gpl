import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Module4Props {
  checklistId: string | null;
  data: any;
  onSave: (data: any) => void;
}

export const ChecklistModule4 = ({ checklistId, data, onSave }: Module4Props) => {
  const [formData, setFormData] = useState(data);

  useEffect(() => {
    setFormData(data);
  }, [data]);

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-2xl font-bold">Module 4: Final Inspection</h2>
      <div className="space-y-4">
        <div>
          <Label>Final Notes</Label>
          <Input
            value={formData.final_notes || ''}
            onChange={(e) => setFormData({ ...formData, final_notes: e.target.value })}
          />
        </div>
        <Button onClick={() => onSave(formData)}>Save Module 4</Button>
      </div>
    </div>
  );
};
