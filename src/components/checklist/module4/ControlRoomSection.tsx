import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { NumericInput } from "../NumericInput";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ConditionalField } from "../ConditionalField";
import { IssueFlagger } from "../IssueFlagger";

interface ControlRoomSectionProps {
  data: any;
  onChange: (field: string, value: any) => void;
  checklistId?: string | null;
}

export const ControlRoomSection = ({ data, onChange, checklistId }: ControlRoomSectionProps) => {
  // Use callback form to ensure we always get the latest data from parent
  const updateNested = (parent: string, field: string, value: any) => {
    // Pass a function that will receive the latest parent data
    onChange(parent, (prevParentData: any) => ({
      ...(prevParentData || {}),
      [field]: value,
    }));
  };

  return (
    <div className="space-y-4">
      <Accordion type="single" collapsible className="w-full">
        {/* Battery Bank Panel */}
        <AccordionItem value="battery-bank">
          <AccordionTrigger>C) Battery Bank Panel</AccordionTrigger>
          <AccordionContent className="space-y-4 p-4">
            <h4 className="font-medium">Daily Checks</h4>
            <div>
              <Label>FC Charger</Label>
              <Select
                value={data.battery_bank?.daily?.fc_charger || ""}
                onValueChange={(v) =>
                  updateNested("battery_bank", "daily", { ...data.battery_bank?.daily, fc_charger: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pass">Pass</SelectItem>
                  <SelectItem value="fail">Fail</SelectItem>
                </SelectContent>
              </Select>
              {checklistId && (
                <div className="mt-2">
                  <IssueFlagger
                    checklistId={checklistId}
                    module="Module 4"
                    section="Battery Bank Panel"
                    item="FC Charger"
                  />
                </div>
              )}
            </div>
            <NumericInput
              label="DC Voltage"
              value={data.battery_bank?.daily?.dc_voltage || 0}
              onChange={(v) => updateNested("battery_bank", "daily", { ...data.battery_bank?.daily, dc_voltage: v })}
              range={{ min: 0, max: 120 }}
              unit="V"
              checklistId={checklistId}
              module="Module 4"
              section="Battery Bank Panel"
              item="DC Voltage"
            />
            <NumericInput
              label="DC Amperage"
              value={data.battery_bank?.daily?.dc_amperage || 0}
              onChange={(v) => updateNested("battery_bank", "daily", { ...data.battery_bank?.daily, dc_amperage: v })}
              range={{ min: 0, max: 50 }}
              unit="A"
              checklistId={checklistId}
              module="Module 4"
              section="Battery Bank Panel"
              item="DC Amperage"
            />
          </AccordionContent>
        </AccordionItem>

        {/* EB/DG Incomer */}
        <AccordionItem value="incomer">
          <AccordionTrigger>F) EB/DG INCOMER</AccordionTrigger>
          <AccordionContent className="space-y-4 p-4">
            <div>
              <Label>Select Incomer Type</Label>
              <RadioGroup value={data.incomer?.type || ""} onValueChange={(v) => updateNested("incomer", "type", v)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="EB" id="eb" />
                  <Label htmlFor="eb">EB Incomer</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="DG" id="dg" />
                  <Label htmlFor="dg">DG Incomer</Label>
                </div>
              </RadioGroup>
            </div>

            {data.incomer?.type === "EB" && (
              <ConditionalField condition={true}>
                <div className="space-y-4">
                  <h4 className="font-medium">EB Incomer Details</h4>
                  <NumericInput
                    label="Phase 1 Voltage"
                    value={data.incomer?.eb_data?.phase1_voltage || 0}
                    onChange={(v) =>
                      updateNested("incomer", "eb_data", { ...data.incomer?.eb_data, phase1_voltage: v })
                    }
                    unit="V"
                    checklistId={checklistId}
                    module="Module 4"
                    section="EB Incomer"
                    item="Phase 1 Voltage"
                  />
                  <NumericInput
                    label="Phase 3 Voltage"
                    value={data.incomer?.eb_data?.phase3_voltage || 0}
                    onChange={(v) =>
                      updateNested("incomer", "eb_data", { ...data.incomer?.eb_data, phase3_voltage: v })
                    }
                    unit="V"
                    checklistId={checklistId}
                    module="Module 4"
                    section="EB Incomer"
                    item="Phase 3 Voltage"
                  />
                  <NumericInput
                    label="Current Load"
                    value={data.incomer?.eb_data?.current || 0}
                    onChange={(v) => updateNested("incomer", "eb_data", { ...data.incomer?.eb_data, current: v })}
                    unit="A"
                    checklistId={checklistId}
                    module="Module 4"
                    section="EB Incomer"
                    item="Current Load"
                  />
                </div>
              </ConditionalField>
            )}

            {data.incomer?.type === "DG" && (
              <ConditionalField condition={true}>
                <div className="space-y-4">
                  <h4 className="font-medium">DG Incomer Details</h4>
                  <NumericInput
                    label="Phase 1 Voltage"
                    value={data.incomer?.dg_data?.phase1_voltage || 0}
                    onChange={(v) =>
                      updateNested("incomer", "dg_data", { ...data.incomer?.dg_data, phase1_voltage: v })
                    }
                    unit="V"
                    checklistId={checklistId}
                    module="Module 4"
                    section="DG Incomer"
                    item="Phase 1 Voltage"
                  />
                  <NumericInput
                    label="Phase 3 Voltage"
                    value={data.incomer?.dg_data?.phase3_voltage || 0}
                    onChange={(v) =>
                      updateNested("incomer", "dg_data", { ...data.incomer?.dg_data, phase3_voltage: v })
                    }
                    unit="V"
                    checklistId={checklistId}
                    module="Module 4"
                    section="DG Incomer"
                    item="Phase 3 Voltage"
                  />
                  <NumericInput
                    label="Current Load"
                    value={data.incomer?.dg_data?.current || 0}
                    onChange={(v) => updateNested("incomer", "dg_data", { ...data.incomer?.dg_data, current: v })}
                    unit="A"
                    checklistId={checklistId}
                    module="Module 4"
                    section="DG Incomer"
                    item="Current Load"
                  />
                </div>
              </ConditionalField>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Battery Charger */}
        <AccordionItem value="charger">
          <AccordionTrigger>G) Battery Charger</AccordionTrigger>
          <AccordionContent className="space-y-4 p-4">
            <div>
              <Label>Variac voltage stabilizer</Label>
              <Select
                value={data.battery_charger?.variac || ""}
                onValueChange={(v) => updateNested("battery_charger", "variac", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pass">Pass</SelectItem>
                  <SelectItem value="fail">Fail</SelectItem>
                </SelectContent>
              </Select>
              {checklistId && (
                <div className="mt-2">
                  <IssueFlagger
                    checklistId={checklistId}
                    module="Module 4"
                    section="Battery Charger"
                    item="Variac voltage stabilizer"
                  />
                </div>
              )}
            </div>
            <NumericInput
              label="AC Input Voltage"
              value={data.battery_charger?.ac_input || 0}
              onChange={(v) => updateNested("battery_charger", "ac_input", v)}
              range={{ min: 0, max: 300 }}
              unit="V"
              checklistId={checklistId}
              module="Module 4"
              section="Battery Charger"
              item="AC Input Voltage"
            />
            <NumericInput
              label="AC Output Voltage"
              value={data.battery_charger?.ac_output || 0}
              onChange={(v) => updateNested("battery_charger", "ac_output", v)}
              range={{ min: 0, max: 300 }}
              unit="V"
              checklistId={checklistId}
              module="Module 4"
              section="Battery Charger"
              item="AC Output Voltage"
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
