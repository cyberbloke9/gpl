import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Module2DataDisplayProps {
  data: any;
  flaggedIssues?: Map<string, any>;
}

export const Module2DataDisplay = ({ data, flaggedIssues }: Module2DataDisplayProps) => {
  if (!data || Object.keys(data).length === 0) {
    return <p className="text-muted-foreground">No data recorded</p>;
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 border-2 border-red-500 text-red-900';
      case 'high': return 'bg-orange-100 border-2 border-orange-500 text-orange-900';
      case 'medium': return 'bg-yellow-100 border-2 border-yellow-500 text-yellow-900';
      case 'low': return 'bg-yellow-50 border-2 border-yellow-300 text-yellow-800';
      default: return '';
    }
  };

  const getIssue = (module: string, section: string, item: string, unit?: string) => {
    const key = `${module}-${section}-${item}${unit ? `-${unit}` : ''}`;
    return flaggedIssues?.get(key);
  };

  const renderUnitData = (unitData: any, unitName: string) => {
    if (!unitData) return null;

    return (
      <Card className="p-4 space-y-4">
        <h4 className="font-semibold text-lg border-b pb-2">{unitName}</h4>
        
        {/* Daily Checks */}
        {unitData.daily && (
          <div className="space-y-2">
            <h5 className="font-medium text-sm text-muted-foreground">Daily Checks</h5>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className={getIssue('Module 2', 'Generator Daily Checks', 'Winding Temperature', unitName) ? `p-2 rounded ${getSeverityColor(getIssue('Module 2', 'Generator Daily Checks', 'Winding Temperature', unitName)?.severity)}` : ''}>
                <span className="text-muted-foreground">Winding temp:</span>
                <span className={`ml-2 font-medium ${getIssue('Module 2', 'Generator Daily Checks', 'Winding Temperature', unitName) ? 'font-bold' : ''}`}>
                  {unitData.daily.winding_temp}°C
                  {getIssue('Module 2', 'Generator Daily Checks', 'Winding Temperature', unitName) && <span className="ml-2 text-xs">⚠️ FLAGGED</span>}
                </span>
              </div>
              <div className={getIssue('Module 2', 'Generator Daily Checks', 'D/NDE Temperatures', unitName) ? `p-2 rounded ${getSeverityColor(getIssue('Module 2', 'Generator Daily Checks', 'D/NDE Temperatures', unitName)?.severity)}` : ''}>
                <span className="text-muted-foreground">D/NDE temp:</span>
                <span className={`ml-2 font-medium ${getIssue('Module 2', 'Generator Daily Checks', 'D/NDE Temperatures', unitName) ? 'font-bold' : ''}`}>
                  {unitData.daily.dnd_temp}°C
                  {getIssue('Module 2', 'Generator Daily Checks', 'D/NDE Temperatures', unitName) && <span className="ml-2 text-xs">⚠️ FLAGGED</span>}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Vibration & Sound:</span>
                <Badge variant={unitData.daily.vibration === 'abnormal' ? 'destructive' : 'outline'} className="ml-2">
                  {unitData.daily.vibration || 'N/A'}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Cover bolt:</span>
                <Badge variant={unitData.daily.cover_bolt === 'abnormal' ? 'destructive' : 'outline'} className="ml-2">
                  {unitData.daily.cover_bolt || 'N/A'}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* 15-Day Interval Checks */}
        {unitData.interval && (Object.keys(unitData.interval).length > 0) && (
          <div className="space-y-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-900">
            <h5 className="font-medium text-sm text-yellow-800 dark:text-yellow-200">15-Day Interval Checks</h5>
            <div className="space-y-2 text-sm">
              {unitData.interval.power_cable_photo && (
                <div>
                  <span className="text-muted-foreground">Power cable inspection:</span>
                  <a href={unitData.interval.power_cable_photo} target="_blank" rel="noopener noreferrer" className="text-primary ml-2 underline text-xs">
                    View Image
                  </a>
                </div>
              )}
              {unitData.interval.greasing_remarks && (
                <div>
                  <span className="text-muted-foreground">Greasing remarks:</span>
                  <p className="text-xs mt-1 p-2 bg-muted rounded">{unitData.interval.greasing_remarks}</p>
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