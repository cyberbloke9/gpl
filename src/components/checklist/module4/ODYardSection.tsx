import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NumericInput } from "../NumericInput";
import { PhotoUpload } from "../PhotoUpload";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { IssueFlagger } from "../IssueFlagger";

interface ODYardSectionProps {
  data: any;
  onChange: (section: string, field: string, value: any) => void;
  checklistId: string | null;
  userId: string;
}

export const ODYardSection = ({ data, onChange, checklistId, userId }: ODYardSectionProps) => {
  // CRITICAL: Pass 'section1_od_yard' as the section name
  const updateNested = (parent: string, field: string, value: any) => {
    onChange("section1_od_yard", parent, (prevParentData: any) => ({
      ...(prevParentData || {}),
      [field]: value,
    }));
  };

  // For top-level fields (like landscape_photo)
  const updateTopLevel = (field: string, value: any) => {
    onChange("section1_od_yard", field, value);
  };

  return (
    <div className="space-y-4">
      <Accordion type="single" collapsible className="w-full">
        {/* Power Transformers */}
        <AccordionItem value="ptr">
          <AccordionTrigger>A) Power Transformers (PTR)</AccordionTrigger>
          <AccordionContent className="space-y-4 p-4">
            <NumericInput
              label="Winding Temperature 1"
              value={data.ptr?.winding_temp1 || 0}
              onChange={(v) => updateNested("ptr", "winding_temp1", v)}
              unit="°C"
              required
              checklistId={checklistId}
              module="Module 4"
              section="Power Transformers (PTR)"
              item="Winding Temperature 1"
            />
            <NumericInput
              label="Winding Temperature 2"
              value={data.ptr?.winding_temp2 || 0}
              onChange={(v) => updateNested("ptr", "winding_temp2", v)}
              unit="°C"
              required
              checklistId={checklistId}
              module="Module 4"
              section="Power Transformers (PTR)"
              item="Winding Temperature 2"
            />
            <NumericInput
              label="Oil Level (PTR)"
              value={data.ptr?.oil_level || 0}
              onChange={(v) => updateNested("ptr", "oil_level", v)}
              unit="%"
              checklistId={checklistId}
              module="Module 4"
              section="Power Transformers (PTR)"
              item="Oil Level (PTR)"
            />
            <div>
              <Label>Breather Silica gel</Label>
              <Select
                value={data.ptr?.breather_color || ""}
                onValueChange={(v) => updateNested("ptr", "breather_color", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brown">Brown</SelectItem>
                  <SelectItem value="pink">Pink</SelectItem>
                  <SelectItem value="blue">Blue</SelectItem>
                </SelectContent>
              </Select>
              {checklistId && (
                <div className="mt-2">
                  <IssueFlagger
                    checklistId={checklistId}
                    module="Module 4"
                    section="Power Transformers (PTR)"
                    item="Breather Silica gel"
                  />
                </div>
              )}
            </div>
            <div>
              <Label>Tap Position</Label>
              <NumericInput
                label=""
                value={data.ptr?.tap_position || 0}
                onChange={(v) => updateNested("ptr", "tap_position", v)}
                range={{ min: 0, max: 9 }}
                checklistId={checklistId}
                module="Module 4"
                section="Power Transformers (PTR)"
                item="Tap Position"
              />
            </div>
            <PhotoUpload
              label="RTCC Panel Position"
              value={data.ptr?.rtcc_photo}
              onChange={(url) => updateNested("ptr", "rtcc_photo", url)}
              required
              userId={userId}
              checklistId={checklistId || ""}
              fieldName="ptr_rtcc"
            />
          </AccordionContent>
        </AccordionItem>

        {/* Diesel Generator */}
        <AccordionItem value="diesel">
          <AccordionTrigger>G) Diesel Generator</AccordionTrigger>
          <AccordionContent className="space-y-4 p-4">
            <NumericInput
              label="Diesel Level"
              value={data.diesel_gen?.diesel_level || 0}
              onChange={(v) => updateNested("diesel_gen", "diesel_level", v)}
              range={{ min: 0, max: 100 }}
              unit="%"
              checklistId={checklistId}
              module="Module 4"
              section="Diesel Generator"
              item="Diesel Level"
            />
            <NumericInput
              label="Battery Charge Level"
              value={data.diesel_gen?.battery_charge || 0}
              onChange={(v) => updateNested("diesel_gen", "battery_charge", v)}
              unit="V"
              checklistId={checklistId}
              module="Module 4"
              section="Diesel Generator"
              item="Battery Charge Level"
            />
            <div>
              <Label>Battery Charging Status</Label>
              <Select
                value={data.diesel_gen?.charging_status || ""}
                onValueChange={(v) => updateNested("diesel_gen", "charging_status", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Charging</SelectItem>
                  <SelectItem value="no">Not Charging</SelectItem>
                </SelectContent>
              </Select>
              {checklistId && (
                <div className="mt-2">
                  <IssueFlagger
                    checklistId={checklistId}
                    module="Module 4"
                    section="Diesel Generator"
                    item="Battery Charging Status"
                  />
                </div>
              )}
            </div>
            <div>
              <Label>Engine Oil Level</Label>
              <Select
                value={data.diesel_gen?.oil_level || ""}
                onValueChange={(v) => updateNested("diesel_gen", "oil_level", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              {checklistId && (
                <div className="mt-2">
                  <IssueFlagger
                    checklistId={checklistId}
                    module="Module 4"
                    section="Diesel Generator"
                    item="Engine Oil Level"
                  />
                </div>
              )}
            </div>
            <PhotoUpload
              label="Battery Water Level"
              value={data.diesel_gen?.battery_water_photo}
              onChange={(url) => updateNested("diesel_gen", "battery_water_photo", url)}
              required
              userId={userId}
              checklistId={checklistId || ""}
              fieldName="diesel_battery_water"
            />
          </AccordionContent>
        </AccordionItem>

        {/* Landscape */}
        <AccordionItem value="landscape">
          <AccordionTrigger>E) OD YARD Landscape</AccordionTrigger>
          <AccordionContent className="space-y-4 p-4">
            <PhotoUpload
              label="Grass Growth Check"
              value={data.landscape_photo}
              onChange={(url) => updateTopLevel("landscape_photo", url)}
              required
              userId={userId}
              checklistId={checklistId || ""}
              fieldName="landscape"
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
