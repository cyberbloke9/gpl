import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PhotoUpload } from './PhotoUpload';
import { NumericInput } from './NumericInput';

interface Module3Props {
  checklistId: string | null;
  userId: string;
  data: any;
  onSave: (data: any) => void;
}

export const ChecklistModule3 = ({ checklistId, userId, data, onSave }: Module3Props) => {
  const [formData, setFormData] = useState(data);

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-2xl font-bold">Module 3: De-watering Sump</h2>
      
      <div className="space-y-4">
        <PhotoUpload
          label="Sump Level & Condition"
          value={formData.sump_level_photo}
          onChange={(url) => updateField('sump_level_photo', url)}
          required
          userId={userId}
          checklistId={checklistId || ''}
          fieldName="sump_level"
        />

        <div>
          <Label>Sump Condition Assessment</Label>
          <Select
            value={formData.sump_condition || ''}
            onValueChange={(v) => updateField('sump_condition', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="fair">Fair</SelectItem>
              <SelectItem value="poor">Poor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>1 Hp Motors Condition</Label>
          <Select
            value={formData.motor_1hp_status || ''}
            onValueChange={(v) => updateField('motor_1hp_status', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="working">Working</SelectItem>
              <SelectItem value="not_working">Not Working</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="p-4 bg-muted/30 rounded-lg space-y-4">
          <h3 className="font-medium">Guide Vane Sump - Unit 1</h3>
          <NumericInput
            label="Water Level"
            value={formData.gv_sump_unit1_level || 0}
            onChange={(v) => updateField('gv_sump_unit1_level', v)}
            unit="cm"
          />
          <PhotoUpload
            label="Unit 1 Sump Photo"
            value={formData.gv_sump_unit1_photo}
            onChange={(url) => updateField('gv_sump_unit1_photo', url)}
            required
            userId={userId}
            checklistId={checklistId || ''}
            fieldName="gv_sump_unit1"
          />
        </div>

        <div className="p-4 bg-muted/30 rounded-lg space-y-4">
          <h3 className="font-medium">Guide Vane Sump - Unit 2</h3>
          <NumericInput
            label="Water Level"
            value={formData.gv_sump_unit2_level || 0}
            onChange={(v) => updateField('gv_sump_unit2_level', v)}
            unit="cm"
          />
          <PhotoUpload
            label="Unit 2 Sump Photo"
            value={formData.gv_sump_unit2_photo}
            onChange={(url) => updateField('gv_sump_unit2_photo', url)}
            required
            userId={userId}
            checklistId={checklistId || ''}
            fieldName="gv_sump_unit2"
          />
        </div>
      </div>

      <Button onClick={() => onSave(formData)} size="lg" className="w-full">
        Save Module 3
      </Button>
    </div>
  );
};
