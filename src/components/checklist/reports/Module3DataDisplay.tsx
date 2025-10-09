import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Module3DataDisplayProps {
  data: any;
  flaggedIssues?: Map<string, any>;
}

export const Module3DataDisplay = ({ data, flaggedIssues }: Module3DataDisplayProps) => {
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

  const getIssue = (module: string, section: string, item: string) => {
    const key = `${module}-${section}-${item}`;
    return flaggedIssues?.get(key);
  };

  return (
    <Card className="p-4 space-y-4">
      <h4 className="font-semibold text-lg border-b pb-2">De-watering Sump</h4>
      
      <div className="space-y-3">
        {/* General Sump Info */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Sump condition:</span>
            <Badge 
              variant={data.sump_condition === 'poor' ? 'destructive' : data.sump_condition === 'fair' ? 'secondary' : 'outline'} 
              className="ml-2"
            >
              {data.sump_condition || 'N/A'}
            </Badge>
          </div>
          <div>
            <span className="text-muted-foreground">1 HP Motors:</span>
            <Badge 
              variant={data.motor_1hp_status === 'not_working' ? 'destructive' : 'outline'} 
              className="ml-2"
            >
              {data.motor_1hp_status === 'working' ? 'Working' : data.motor_1hp_status === 'not_working' ? 'Not Working' : 'N/A'}
            </Badge>
          </div>
        </div>

        {data.sump_level_photo && (
          <div>
            <span className="text-muted-foreground text-sm">Sump level photo:</span>
            <a href={data.sump_level_photo} target="_blank" rel="noopener noreferrer" className="text-primary ml-2 underline text-xs">
              View Image
            </a>
          </div>
        )}

        {/* Guide Vane Sump - Unit 1 */}
        {(data.gv_sump_unit1_level !== undefined || data.gv_sump_unit1_photo) && (
          <div className={`p-3 rounded space-y-2 ${getIssue('Module 3', 'Guide Vane Sump - Unit 1', 'Water Level') ? getSeverityColor(getIssue('Module 3', 'Guide Vane Sump - Unit 1', 'Water Level')?.severity) : 'bg-muted/30'}`}>
            <h5 className="font-medium text-sm">Guide Vane Sump - Unit 1</h5>
            {data.gv_sump_unit1_level !== undefined && (
              <div className="text-sm">
                <span className="text-muted-foreground">Water level:</span>
                <span className={`ml-2 font-medium ${getIssue('Module 3', 'Guide Vane Sump - Unit 1', 'Water Level') ? 'font-bold' : ''}`}>
                  {data.gv_sump_unit1_level} cm
                  {getIssue('Module 3', 'Guide Vane Sump - Unit 1', 'Water Level') && <span className="ml-2 text-xs">⚠️ FLAGGED</span>}
                </span>
              </div>
            )}
            {data.gv_sump_unit1_photo && (
              <div className="text-sm">
                <span className="text-muted-foreground">Photo:</span>
                <a href={data.gv_sump_unit1_photo} target="_blank" rel="noopener noreferrer" className="text-primary ml-2 underline text-xs">
                  View Image
                </a>
              </div>
            )}
          </div>
        )}

        {/* Guide Vane Sump - Unit 2 */}
        {(data.gv_sump_unit2_level !== undefined || data.gv_sump_unit2_photo) && (
          <div className={`p-3 rounded space-y-2 ${getIssue('Module 3', 'Guide Vane Sump - Unit 2', 'Water Level') ? getSeverityColor(getIssue('Module 3', 'Guide Vane Sump - Unit 2', 'Water Level')?.severity) : 'bg-muted/30'}`}>
            <h5 className="font-medium text-sm">Guide Vane Sump - Unit 2</h5>
            {data.gv_sump_unit2_level !== undefined && (
              <div className="text-sm">
                <span className="text-muted-foreground">Water level:</span>
                <span className={`ml-2 font-medium ${getIssue('Module 3', 'Guide Vane Sump - Unit 2', 'Water Level') ? 'font-bold' : ''}`}>
                  {data.gv_sump_unit2_level} cm
                  {getIssue('Module 3', 'Guide Vane Sump - Unit 2', 'Water Level') && <span className="ml-2 text-xs">⚠️ FLAGGED</span>}
                </span>
              </div>
            )}
            {data.gv_sump_unit2_photo && (
              <div className="text-sm">
                <span className="text-muted-foreground">Photo:</span>
                <a href={data.gv_sump_unit2_photo} target="_blank" rel="noopener noreferrer" className="text-primary ml-2 underline text-xs">
                  View Image
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};