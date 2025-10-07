import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Module2Props {
  checklistId: string | null;
  data: any;
  onSave: (data: any) => void;
}

export const ChecklistModule2 = ({ checklistId, data, onSave }: Module2Props) => {
  const [formData, setFormData] = useState(data);

  useEffect(() => {
    setFormData(data);
  }, [data]);

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-2xl font-bold">Module 2: Safety Checks</h2>
      <div className="space-y-4">
        <div>
          <Label>Safety Equipment</Label>
          <Input
            value={formData.safety_equipment || ''}
            onChange={(e) => setFormData({ ...formData, safety_equipment: e.target.value })}
          />
        </div>
        <Button onClick={() => onSave(formData)}>Save Module 2</Button>
      </div>
    </div>
  );
};
