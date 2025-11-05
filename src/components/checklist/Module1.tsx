import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PhotoUpload } from "./PhotoUpload";
import { NumericInput } from "./NumericInput";
import { ConditionalField } from "./ConditionalField";
import { IssueFlagger } from "./IssueFlagger";
import { Textarea } from "@/components/ui/textarea";

interface Module1Props {
  checklistId: string | null;
  userId: string;
  data: any;
  onSave: (data: any) => void;
  isSaved?: boolean;
}

export const ChecklistModule1 = ({ checklistId, userId, data, onSave, isSaved = false }: Module1Props) => {
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

        // Only update photo fields if they exist in new data
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

      {/* Section A: Turbine Visual Inspection */}
      <div className="space-y-4">
        <h4 className="font-medium">A. Turbine Visual Inspection</h4>

        <div>
          <Label>Guide bearing oil level</Label>
          <Select
            value={formData[unit]?.turbine?.guide_bearing || ""}
            onValueChange={(v) => updateUnit(unit, "turbine", "guide_bearing", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
          {checklistId && (
            <div className="mt-2">
              <IssueFlagger
                checklistId={checklistId}
                module="Module 1"
                section="Turbine Visual Inspection"
                item="Guide bearing oil level"
                unit={unitName}
              />
            </div>
          )}
        </div>

        <PhotoUpload
          label="Guide Vane Servomotor leakage"
          value={formData[unit]?.turbine?.servomotor_photo}
          onChange={(url) => updateUnit(unit, "turbine", "servomotor_photo", url)}
          required
          userId={userId}
          checklistId={checklistId || ""}
          fieldName={`${unit}_turbine_servomotor`}
        />

        <div>
          <Label>Union Leakage (Runner Hub)</Label>
          <Select
            value={formData[unit]?.turbine?.union_leakage || ""}
            onValueChange={(v) => updateUnit(unit, "turbine", "union_leakage", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Leakage</SelectItem>
              <SelectItem value="minor">Minor Leakage</SelectItem>
              <SelectItem value="major">Major Leakage</SelectItem>
            </SelectContent>
          </Select>
          {checklistId && (
            <div className="mt-2">
              <IssueFlagger
                checklistId={checklistId}
                module="Module 1"
                section="Turbine Visual Inspection"
                item="Union Leakage (Runner Hub)"
                unit={unitName}
              />
            </div>
          )}
        </div>
      </div>

      {/* Section B: OPU */}
      <div className="space-y-4">
        <h4 className="font-medium">B. Oil Pressure Unit (OPU)</h4>

        <NumericInput
          label="TOPU Pressure"
          value={formData[unit]?.opu?.pressure || 0}
          onChange={(v) => updateUnit(unit, "opu", "pressure", v)}
          range={{ min: 65, max: 86, ideal: { min: 70, max: 80 } }}
          unit="bar"
          required
          checklistId={checklistId}
          module="Module 1"
          section="Oil Pressure Unit (OPU)"
          item="TOPU Pressure"
        />

        <NumericInput
          label="Oil sump level"
          value={formData[unit]?.opu?.oil_sump || 0}
          onChange={(v) => updateUnit(unit, "opu", "oil_sump", v)}
          range={{ min: 0, max: 100 }}
          unit="%"
          checklistId={checklistId}
          module="Module 1"
          section="Oil Pressure Unit (OPU)"
          item="Oil sump level"
        />

        <NumericInput
          label="Oil temperature"
          value={formData[unit]?.opu?.temperature || 0}
          onChange={(v) => updateUnit(unit, "opu", "temperature", v)}
          range={{ min: 25, max: 70, ideal: { min: 30, max: 60 } }}
          unit="°C"
          checklistId={checklistId}
          module="Module 1"
          section="Oil Pressure Unit (OPU)"
          item="Oil temperature"
        />

        <div>
          <Label>Oil piping leakage</Label>
          <Textarea
            value={formData[unit]?.opu?.leakage_remarks || ""}
            onChange={(e) => updateUnit(unit, "opu", "leakage_remarks", e.target.value)}
            placeholder="Visual inspection remarks..."
          />
          {checklistId && (
            <div className="mt-2">
              <IssueFlagger
                checklistId={checklistId}
                module="Module 1"
                section="Oil Pressure Unit (OPU)"
                item="Oil piping leakage remarks"
                unit={unit}
              />
            </div>
          )}
        </div>

        <div>
          <Label>Pump motor sound</Label>
          <Select
            value={formData[unit]?.opu?.pump_sound || ""}
            onValueChange={(v) => updateUnit(unit, "opu", "pump_sound", v)}
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
                module="Module 1"
                section="Oil Pressure Unit (OPU)"
                item="Pump motor sound"
                unit={unitName}
              />
            </div>
          )}
        </div>

        <div>
          <Label>OPU motor condition</Label>
          <Select
            value={formData[unit]?.opu?.motor_condition || ""}
            onValueChange={(v) => updateUnit(unit, "opu", "motor_condition", v)}
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
                module="Module 1"
                section="Oil Pressure Unit (OPU)"
                item="OPU motor condition"
                unit={unitName}
              />
            </div>
          )}
        </div>
      </div>

      {/* Section C: Gearbox */}
      <div className="space-y-4">
        <h4 className="font-medium">C. Gearbox Unit</h4>

        <PhotoUpload
          label="LOS pressure"
          value={formData[unit]?.gearbox?.los_pressure_photo}
          onChange={(url) => updateUnit(unit, "gearbox", "los_pressure_photo", url)}
          required
          userId={userId}
          checklistId={checklistId || ""}
          fieldName={`${unit}_gearbox_los_pressure`}
        />

        <div>
          <Label>Oil leakage upper segment</Label>
          <Select
            value={formData[unit]?.gearbox?.upper_leakage || ""}
            onValueChange={(v) => updateUnit(unit, "gearbox", "upper_leakage", v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no">No</SelectItem>
              <SelectItem value="yes">Yes</SelectItem>
            </SelectContent>
          </Select>
          {formData[unit]?.gearbox?.upper_leakage === "yes" && checklistId && (
            <ConditionalField condition={true}>
              <IssueFlagger
                checklistId={checklistId}
                module="Module 1"
                section="Gearbox"
                item="Oil leakage upper segment"
              />
            </ConditionalField>
          )}
        </div>

        <div>
          <Label>Oil leakage lower segment</Label>
          <Select
            value={formData[unit]?.gearbox?.lower_leakage || ""}
            onValueChange={(v) => updateUnit(unit, "gearbox", "lower_leakage", v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no">No</SelectItem>
              <SelectItem value="yes">Yes</SelectItem>
            </SelectContent>
          </Select>
          {formData[unit]?.gearbox?.lower_leakage === "yes" && checklistId && (
            <ConditionalField condition={true}>
              <IssueFlagger
                checklistId={checklistId}
                module="Module 1"
                section="Gearbox"
                item="Oil leakage lower segment"
              />
            </ConditionalField>
          )}
        </div>
      </div>

      {/* Section D: Cooling System */}
      <div className="space-y-4">
        <h4 className="font-medium">D. Cooling System</h4>

        <NumericInput
          label="CW Pressure Unit"
          value={formData[unit]?.cooling?.cw_pressure || 0}
          onChange={(v) => updateUnit(unit, "cooling", "cw_pressure", v)}
          range={{ min: 0, max: 3 }}
          unit="Bar"
          checklistId={checklistId}
          module="Module 1"
          section="Cooling System"
          item="CW Pressure Unit"
        />

        <PhotoUpload
          label="Flow indicators"
          value={formData[unit]?.cooling?.flow_indicators_photo}
          onChange={(url) => updateUnit(unit, "cooling", "flow_indicators_photo", url)}
          required
          userId={userId}
          checklistId={checklistId || ""}
          fieldName={`${unit}_cooling_flow_indicators`}
        />

        <div>
          <Label>Filter Inspection</Label>
          <Select
            value={formData[unit]?.cooling?.filter_condition || ""}
            onValueChange={(v) => updateUnit(unit, "cooling", "filter_condition", v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="clean">Clean</SelectItem>
              <SelectItem value="unclean">Unclean</SelectItem>
            </SelectContent>
          </Select>
          {checklistId && (
            <div className="mt-2">
              <IssueFlagger
                checklistId={checklistId}
                module="Module 1"
                section="Cooling System"
                item="Filter Inspection"
                unit={unitName}
              />
            </div>
          )}
          {formData[unit]?.cooling?.filter_condition === "clean" && (
            <ConditionalField condition={true}>
              <PhotoUpload
                label="Filter Photo (Required for Clean status)"
                value={formData[unit]?.cooling?.filter_photo}
                onChange={(url) => updateUnit(unit, "cooling", "filter_photo", url)}
                required
                userId={userId}
                checklistId={checklistId || ""}
                fieldName={`${unit}_cooling_filter`}
              />
            </ConditionalField>
          )}
        </div>
      </div>
    </div>
  );

  const isModule1Complete = () => {
    const unit1Valid =
      formData.unit1?.opu?.pressure > 0 &&
      formData.unit1?.turbine?.servomotor_photo &&
      formData.unit1?.gearbox?.los_pressure_photo &&
      formData.unit1?.cooling?.flow_indicators_photo;

    const unit2Valid =
      formData.unit2?.opu?.pressure > 0 &&
      formData.unit2?.turbine?.servomotor_photo &&
      formData.unit2?.gearbox?.los_pressure_photo &&
      formData.unit2?.cooling?.flow_indicators_photo;

    return unit1Valid && unit2Valid;
  };

  return (
    <div className="space-y-6 p-4 pb-8">
      <h2 className="text-2xl font-bold">Module 1: Turbine, OPU and Cooling System</h2>

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
        disabled={!isModule1Complete() || isSaved}
        type="button"
      >
        {isSaved ? "Module 1 Saved ✓" : "Save Module 1"}
      </Button>
    </div>
  );
};
