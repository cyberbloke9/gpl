import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ODYardSection } from './module4/ODYardSection';
import { ControlRoomSection } from './module4/ControlRoomSection';

interface Module4Props {
  checklistId: string | null;
  userId: string;
  data: any;
  onSave: (data: any) => void;
}

export const ChecklistModule4 = ({ checklistId, userId, data, onSave }: Module4Props) => {
  const [formData, setFormData] = useState(data);

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const updateSection = (section: string, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4">
      <h2 className="text-xl sm:text-2xl font-bold">Module 4: Electrical Systems</h2>
      
      <Tabs defaultValue="od-yard">
        <TabsList className="grid w-full grid-cols-2 h-auto">
          <TabsTrigger value="od-yard" className="text-xs sm:text-sm">OD Yard</TabsTrigger>
          <TabsTrigger value="control-room" className="text-xs sm:text-sm">Control Room</TabsTrigger>
        </TabsList>

        <TabsContent value="od-yard">
          <ODYardSection
            data={formData.section1_od_yard || {}}
            onChange={(field, value) => updateSection('section1_od_yard', field, value)}
            checklistId={checklistId}
            userId={userId}
          />
        </TabsContent>

        <TabsContent value="control-room">
          <ControlRoomSection
            data={formData.section2_control_room || {}}
            onChange={(field, value) => updateSection('section2_control_room', field, value)}
            checklistId={checklistId}
          />
        </TabsContent>
      </Tabs>

      <Button onClick={() => onSave(formData)} size="lg" className="w-full">
        Save Module 4
      </Button>
    </div>
  );
};
