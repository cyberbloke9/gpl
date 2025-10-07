import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';

interface Module1DataDisplayProps {
  data: any;
}

export const Module1DataDisplay = ({ data }: Module1DataDisplayProps) => {
  if (!data || Object.keys(data).length === 0) {
    return <p className="text-muted-foreground">No data recorded</p>;
  }

  const renderUnitData = (unitData: any, unitName: string) => {
    if (!unitData) return null;

    return (
      <Card className="p-4 space-y-4">
        <h4 className="font-semibold text-lg border-b pb-2">{unitName}</h4>
        
        {/* Turbine Section */}
        {unitData.turbine && (
          <div className="space-y-2">
            <h5 className="font-medium text-sm text-muted-foreground">A. Turbine Visual Inspection</h5>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Guide bearing:</span>
                <Badge variant="outline" className="ml-2">{unitData.turbine.guide_bearing || 'N/A'}</Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Union leakage:</span>
                <Badge variant="outline" className="ml-2">{unitData.turbine.union_leakage || 'N/A'}</Badge>
              </div>
              {unitData.turbine.servomotor_photo && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Servomotor photo:</span>
                  <a href={unitData.turbine.servomotor_photo} target="_blank" rel="noopener noreferrer" className="text-primary ml-2 underline text-xs">
                    View Image
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* OPU Section */}
        {unitData.opu && (
          <div className="space-y-2">
            <h5 className="font-medium text-sm text-muted-foreground">B. Oil Pressure Unit (OPU)</h5>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">TOPU Pressure:</span>
                <span className="ml-2 font-medium">{unitData.opu.pressure} bar</span>
              </div>
              <div>
                <span className="text-muted-foreground">Oil sump level:</span>
                <span className="ml-2 font-medium">{unitData.opu.oil_sump}%</span>
              </div>
              <div>
                <span className="text-muted-foreground">Temperature:</span>
                <span className="ml-2 font-medium">{unitData.opu.temperature}°C</span>
              </div>
              <div>
                <span className="text-muted-foreground">Pump sound:</span>
                <Badge variant="outline" className="ml-2">{unitData.opu.pump_sound || 'N/A'}</Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Motor condition:</span>
                <Badge variant="outline" className="ml-2">{unitData.opu.motor_condition || 'N/A'}</Badge>
              </div>
              {unitData.opu.leakage_remarks && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Leakage remarks:</span>
                  <p className="text-xs mt-1 p-2 bg-muted rounded">{unitData.opu.leakage_remarks}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Gearbox Section */}
        {unitData.gearbox && (
          <div className="space-y-2">
            <h5 className="font-medium text-sm text-muted-foreground">C. Gearbox Unit</h5>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Upper leakage:</span>
                <Badge variant={unitData.gearbox.upper_leakage === 'yes' ? 'destructive' : 'outline'} className="ml-2">
                  {unitData.gearbox.upper_leakage || 'N/A'}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Lower leakage:</span>
                <Badge variant={unitData.gearbox.lower_leakage === 'yes' ? 'destructive' : 'outline'} className="ml-2">
                  {unitData.gearbox.lower_leakage || 'N/A'}
                </Badge>
              </div>
              {unitData.gearbox.los_pressure_photo && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">LOS pressure photo:</span>
                  <a href={unitData.gearbox.los_pressure_photo} target="_blank" rel="noopener noreferrer" className="text-primary ml-2 underline text-xs">
                    View Image
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cooling Section */}
        {unitData.cooling && (
          <div className="space-y-2">
            <h5 className="font-medium text-sm text-muted-foreground">D. Cooling System</h5>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">CW Pressure:</span>
                <span className="ml-2 font-medium">{unitData.cooling.cw_pressure} Bar</span>
              </div>
              <div>
                <span className="text-muted-foreground">Filter condition:</span>
                <Badge variant="outline" className="ml-2">{unitData.cooling.filter_condition || 'N/A'}</Badge>
              </div>
              {unitData.cooling.flow_indicators_photo && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Flow indicators:</span>
                  <a href={unitData.cooling.flow_indicators_photo} target="_blank" rel="noopener noreferrer" className="text-primary ml-2 underline text-xs">
                    View Image
                  </a>
                </div>
              )}
              {unitData.cooling.filter_photo && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Filter photo:</span>
                  <a href={unitData.cooling.filter_photo} target="_blank" rel="noopener noreferrer" className="text-primary ml-2 underline text-xs">
                    View Image
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {data.unit1 && renderUnitData(data.unit1, 'Unit 1 (1.5 MW)')}
      {data.unit2 && renderUnitData(data.unit2, 'Unit 2 (0.7 MW)')}
    </div>
  );
};