import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Module1Props {
  checklistId: string | null;
  data: any;
  onSave: (data: any) => void;
}

export const ChecklistModule1 = ({ checklistId, data, onSave }: Module1Props) => {
  const [formData, setFormData] = useState(data);

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
  };

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-2xl font-bold">Module 1: Basic Inspection</h2>
      
      <div className="space-y-4">
        <div>
          <Label>Equipment Status</Label>
          <Input
            value={formData.equipment_status || ''}
            onChange={(e) => handleChange('equipment_status', e.target.value)}
          />
        </div>
        
        <div>
          <Label>Notes</Label>
          <Textarea
            value={formData.notes || ''}
            onChange={(e) => handleChange('notes', e.target.value)}
          />
        </div>

        <Button onClick={() => onSave(formData)}>Save Module 1</Button>
      </div>
    </div>
  );
};
