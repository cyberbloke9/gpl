import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Module4DataDisplayProps {
  data: any;
  flaggedIssues?: Map<string, any>;
}

export const Module4DataDisplay = ({ data, flaggedIssues }: Module4DataDisplayProps) => {
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

  const renderSection = (sectionData: any, sectionName: string) => {
    if (!sectionData) return null;

    return (
      <Card className="p-4 space-y-3">
        <h4 className="font-semibold text-lg border-b pb-2">{sectionName}</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {Object.entries(sectionData).map(([key, value]: [string, any]) => {
            // Skip empty values
            if (value === null || value === undefined || value === '') return null;

            // Format key to be more readable
            const formattedKey = key
              .replace(/_/g, ' ')
              .replace(/\b\w/g, (l) => l.toUpperCase());

            // Check if flagged
            const issue = getIssue('Module 4', sectionName, formattedKey);
            const containerClass = issue ? `p-2 rounded ${getSeverityColor(issue.severity)}` : '';

            // Handle photo URLs
            if (key.includes('photo') && typeof value === 'string') {
              return (
                <div key={key} className={`col-span-1 ${containerClass}`}>
                  <span className="text-muted-foreground">{formattedKey}:</span>
                  <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary ml-2 underline text-xs">
                    View Image
                  </a>
                </div>
              );
            }

            // Handle boolean values
            if (typeof value === 'boolean') {
              return (
                <div key={key} className={containerClass}>
                  <span className="text-muted-foreground">{formattedKey}:</span>
                  <Badge variant={value ? 'outline' : 'destructive'} className="ml-2">
                    {value ? 'Yes' : 'No'}
                  </Badge>
                  {issue && <span className="ml-2 text-xs font-bold">⚠️ FLAGGED</span>}
                </div>
              );
            }

            // Handle numeric values
            if (typeof value === 'number') {
              return (
                <div key={key} className={containerClass}>
                  <span className="text-muted-foreground">{formattedKey}:</span>
                  <span className={`ml-2 ${issue ? 'font-bold' : 'font-medium'}`}>
                    {value}
                    {issue && <span className="ml-2 text-xs">⚠️ FLAGGED</span>}
                  </span>
                </div>
              );
            }

            // Handle string values that might be status indicators
            if (typeof value === 'string') {
              const isStatus = ['normal', 'abnormal', 'working', 'not_working', 'on', 'off', 'good', 'bad', 'yes', 'no'].includes(value.toLowerCase());
              
              if (isStatus) {
                const isNegative = ['abnormal', 'not_working', 'off', 'bad', 'no'].includes(value.toLowerCase());
                return (
                  <div key={key}>
                    <span className="text-muted-foreground">{formattedKey}:</span>
                    <Badge variant={isNegative ? 'destructive' : 'outline'} className="ml-2">
                      {value}
                    </Badge>
                  </div>
                );
              }

              // Handle long text values
              if (value.length > 50) {
                return (
                  <div key={key} className="col-span-2">
                    <span className="text-muted-foreground">{formattedKey}:</span>
                    <p className="text-xs mt-1 p-2 bg-muted rounded">{value}</p>
                  </div>
                );
              }

              return (
                <div key={key}>
                  <span className="text-muted-foreground">{formattedKey}:</span>
                  <span className="ml-2">{value}</span>
                </div>
              );
            }

            return null;
          })}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {data.section1_od_yard && renderSection(data.section1_od_yard, 'OD Yard Section')}
      {data.section2_control_room && renderSection(data.section2_control_room, 'Control Room Section')}
    </div>
  );
};