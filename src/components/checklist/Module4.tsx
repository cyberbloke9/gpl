import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ODYardSection } from "./module4/ODYardSection";
import { ControlRoomSection } from "./module4/ControlRoomSection";

interface Module4Props {
  checklistId: string | null;
  userId: string;
  data: any;
  onSave: (data: any) => void;
}

export const ChecklistModule4 = ({ checklistId, userId, data, onSave }: Module4Props) => {
  const [formData, setFormData] = useState(data || {});
  const isInitialized = useRef(false);

  // Debug: Log when data changes
  useEffect(() => {
    console.log("Module4 - Received data:", data);
  }, [data]);

  // Only initialize once when component mounts
  useEffect(() => {
    if (!isInitialized.current) {
      console.log("Module4 - Initializing with:", data);
      setFormData(data || {});
      isInitialized.current = true;
    }
  }, []);

  // Merge photo uploads without overwriting other fields
  useEffect(() => {
    if (isInitialized.current && data) {
      setFormData((prev: any) => {
        const merged = { ...prev };

        // Merge section1_od_yard photos
        if (data.section1_od_yard) {
          if (!merged.section1_od_yard) merged.section1_od_yard = {};

          Object.keys(data.section1_od_yard || {}).forEach((field) => {
            // Direct photo fields
            if (field.includes("photo") && data.section1_od_yard[field]) {
              merged.section1_od_yard[field] = data.section1_od_yard[field];
            }
            // Nested objects with photos
            if (typeof data.section1_od_yard[field] === "object" && data.section1_od_yard[field]) {
              Object.keys(data.section1_od_yard[field] || {}).forEach((subfield) => {
                if (subfield.includes("photo") && data.section1_od_yard[field][subfield]) {
                  if (!merged.section1_od_yard[field]) merged.section1_od_yard[field] = {};
                  merged.section1_od_yard[field][subfield] = data.section1_od_yard[field][subfield];
                }
              });
            }
          });
        }

        console.log("Module4 - Merged state:", merged);
        return merged;
      });
    }
  }, [data]);

  // Enhanced updateSection that handles both direct values and callback functions
  const updateSection = (section: string, field: string, value: any) => {
    console.log("Module4 - updateSection:", { section, field, value });

    setFormData((prev: any) => {
      // If value is a function, call it with the current field data
      const newFieldValue = typeof value === "function" ? value(prev[section]?.[field]) : value;

      const updated = {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: newFieldValue,
        },
      };

      console.log("Module4 - Updated state:", updated);
      return updated;
    });
  };

  const isModule4Complete = () => {
    const odYardHasData = formData.section1_od_yard && Object.keys(formData.section1_od_yard).length > 0;
    const controlRoomHasData = formData.section2_control_room && Object.keys(formData.section2_control_room).length > 0;

    console.log("Module4 - Completion check:", { odYardHasData, controlRoomHasData, formData });
    return odYardHasData && controlRoomHasData;
  };

  const handleSave = () => {
    console.log("Module4 - Saving data:", formData);
    onSave(formData);
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4">
      <h2 className="text-xl sm:text-2xl font-bold">Module 4: Electrical Systems</h2>

      <Tabs defaultValue="od-yard">
        <TabsList className="grid w-full grid-cols-2 h-auto">
          <TabsTrigger value="od-yard" className="text-xs sm:text-sm">
            OD Yard
          </TabsTrigger>
          <TabsTrigger value="control-room" className="text-xs sm:text-sm">
            Control Room
          </TabsTrigger>
        </TabsList>

        <TabsContent value="od-yard">
          <ODYardSection
            data={formData.section1_od_yard || {}}
            onChange={updateSection}
            checklistId={checklistId}
            userId={userId}
          />
        </TabsContent>

        <TabsContent value="control-room">
          <ControlRoomSection
            data={formData.section2_control_room || {}}
            onChange={updateSection}
            checklistId={checklistId}
          />
        </TabsContent>
      </Tabs>

      <Button onClick={handleSave} size="lg" className="w-full" disabled={!isModule4Complete()}>
        Save Module 4
      </Button>

      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-4 p-4 bg-gray-100 rounded text-xs">
          <p className="font-bold">Debug Info:</p>
          <p>OD Yard data keys: {Object.keys(formData.section1_od_yard || {}).join(", ") || "none"}</p>
          <p>Control Room data keys: {Object.keys(formData.section2_control_room || {}).join(", ") || "none"}</p>
          <p>Complete: {isModule4Complete() ? "Yes" : "No"}</p>
        </div>
      )}
    </div>
  );
};
