import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NumericInput } from "./NumericInput";
import { PhotoUpload } from "./PhotoUpload";
import { Textarea } from "@/components/ui/textarea";
import { IssueFlagger } from "./IssueFlagger";

interface Module2Props {
  checklistId: string | null;
  userId: string;
  data: any;
  onSave: (data: any) => void;
}

export const ChecklistModule2 = ({ checklistId, userId, data, onSave }: Module2Props) => {
  const [formData, setFormData] = useState(data);
  const isInitialized = useRef(false);

  // Only initialize once when component mounts
  useEffect(() => {
    if (!isInitialized.current) {
      setFormData(data);
      isInitialized.current = true;
    }
  }, []);

  // Merge photo uploads without overwriting other fields
  useEffect(() => {
    if (isInitialized.current && data) {
      setFormData((prev: any) => {
        const merged = { ...prev };

        ["unit1", "unit2"].forEach((unit) => {
          if (data[unit]) {
            Object.keys(data[unit] || {}).forEach((section) => {
              if (data[unit][section]) {
                Object.keys(data[unit][section] || {}).forEach((field) => {
                  if (field.includes("photo") && data[unit][section][field]) {
                    if (!merged[unit]) merged[unit] = {};
                    if (!merged[unit][section]) merged[unit][section] = {};
                    merged[unit][section][field] = data[unit][section][field];
                  }
                });
              }
            });
          }
        });

        return merged;
      });
    }
  }, [data]);

  const updateUnit = (unit: "unit1" | "unit2", section: string, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [unit]: {
        ...prev[unit],
        [section]: {
          ...prev[unit]?.[section],
          [field]: value,
        },
      },
    }));
  };

  const renderUnitSection = (unit: "unit1" | "unit2", unitName: string) => (
    <div className="space-y-6">
      <h3 className="font-semibold text-lg">{unitName}</h3>

      <div className="space-y-4">
        <h4 className="font-medium">Daily Checks</h4>

        <NumericInput
          label="Winding Temperature"
          value={formData[unit]?.daily?.winding_temp || 0}
          onChange={(v) => updateUnit(unit, "daily", "winding_temp", v)}
          range={{ min: 0, max: 80 }}
          unit="°C"
          required
          checklistId={checklistId}
          module="Module 2"
          section="Generator Daily Checks"
          item="Winding Temperature"
        />

        <NumericInput
          label="D/NDE Temperatures"
          value={formData[unit]?.daily?.dnd_temp || 0}
          onChange={(v) => updateUnit(unit, "daily", "dnd_temp", v)}
          range={{ min: 0, max: 80 }}
          unit="°C"
          required
          checklistId={checklistId}
          module="Module 2"
          section="Generator Daily Checks"
          item="D/NDE Temperatures"
        />

        <div>
          <Label>Vibration & Sound</Label>
          <Select
            value={formData[unit]?.daily?.vibration || ""}
            onValueChange={(v) => updateUnit(unit, "daily", "vibration", v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="abnormal">Abnormal</SelectItem>
            </SelectContent>
          </Select>
          {checklistId && (
            <div className="mt-2">
              <IssueFlagger
                checklistId={checklistId}
                module="Module 2"
                section="Generator Daily Checks"
                item="Vibration & Sound"
                unit={unitName}
              />
            </div>
          )}
        </div>

        <div>
          <Label>Generator cover bolt</Label>
          <Select
            value={formData[unit]?.daily?.cover_bolt || ""}
            onValueChange={(v) => updateUnit(unit, "daily", "cover_bolt", v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="abnormal">Abnormal</SelectItem>
            </SelectContent>
          </Select>
          {checklistId && (
            <div className="mt-2">
              <IssueFlagger
                checklistId={checklistId}
                module="Module 2"
                section="Generator Daily Checks"
                item="Generator cover bolt"
                unit={unitName}
              />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
        <h4 className="font-medium text-yellow-700">15-Day Interval Checks</h4>

        <PhotoUpload
          label="Power cable inspection (Terminal Box)"
          value={formData[unit]?.interval?.power_cable_photo}
          onChange={(url) => updateUnit(unit, "interval", "power_cable_photo", url)}
          userId={userId}
          checklistId={checklistId || ""}
          fieldName={`${unit}_interval_power_cable`}
        />

        <div>
          <Label>Greasing for D/NDE remarks</Label>
          <Textarea
            value={formData[unit]?.interval?.greasing_remarks || ""}
            onChange={(e) => updateUnit(unit, "interval", "greasing_remarks", e.target.value)}
            placeholder="Sound and temperature remarks after greasing..."
          />
          {checklistId && (
            <div className="mt-2">
              <IssueFlagger
                checklistId={checklistId}
                module="Module 2"
                section="Generator Interval Checks"
                item="Greasing for D/NDE remarks"
                unit={unit}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const isModule2Complete = () => {
    const unit1Valid =
      formData.unit1?.daily?.winding_temp > 0 &&
      formData.unit1?.daily?.dnd_temp > 0 &&
      formData.unit1?.daily?.vibration &&
      formData.unit1?.daily?.cover_bolt;

    const unit2Valid =
      formData.unit2?.daily?.winding_temp > 0 &&
      formData.unit2?.daily?.dnd_temp > 0 &&
      formData.unit2?.daily?.vibration &&
      formData.unit2?.daily?.cover_bolt;

    return unit1Valid && unit2Valid;
  };

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-2xl font-bold">Module 2: Generator</h2>

      <div className="grid md:grid-cols-2 gap-8">
        {renderUnitSection("unit1", "Unit 1 (1.5 MW)")}
        {renderUnitSection("unit2", "Unit 2 (0.7 MW)")}
      </div>

      <Button 
        onClick={(e) => {
          e.preventDefault();
          onSave(formData);
        }} 
        size="lg" 
        className="w-full" 
        disabled={!isModule2Complete()}
        type="button"
      >
        Save Module 2
      </Button>
    </div>
  );
};
