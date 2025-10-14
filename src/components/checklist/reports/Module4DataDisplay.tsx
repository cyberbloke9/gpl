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

  const formatKey = (key: string): string => {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const renderValue = (key: string, value: any, sectionName: string, subsectionName?: string) => {
    // Skip empty values
    if (value === null || value === undefined || value === '') return null;

    const formattedKey = formatKey(key);
    const fullSection = subsectionName ? `${sectionName} - ${subsectionName}` : sectionName;
    const issue = getIssue('Module 4', fullSection, formattedKey);
    const containerClass = issue ? `p-2 rounded ${getSeverityColor(issue.severity)}` : '';

    // Handle photo URLs
    if (key.includes('photo') && typeof value === 'string') {
      return (
        <div key={key} className={`col-span-1 ${containerClass}`}>
          <span className="text-muted-foreground">{formattedKey}:</span>
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary ml-2 underline text-xs">
            View Image
          </a>
          {issue && <span className="ml-2 text-xs font-bold">⚠️ FLAGGED</span>}
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

    // Handle string values
    if (typeof value === 'string') {
      const isStatus = ['normal', 'abnormal', 'working', 'not_working', 'on', 'off', 'good', 'bad', 'yes', 'no', 'pass', 'fail', 'brown', 'pink', 'blue', 'low', 'medium', 'high', 'charging', 'not charging'].includes(value.toLowerCase());
      
      if (isStatus) {
        const isNegative = ['abnormal', 'not_working', 'off', 'bad', 'no', 'fail', 'low', 'not charging'].includes(value.toLowerCase());
        return (
          <div key={key} className={containerClass}>
            <span className="text-muted-foreground">{formattedKey}:</span>
            <Badge variant={isNegative ? 'destructive' : 'outline'} className="ml-2">
              {value}
            </Badge>
            {issue && <span className="ml-2 text-xs font-bold">⚠️ FLAGGED</span>}
          </div>
        );
      }

      // Handle long text values
      if (value.length > 50) {
        return (
          <div key={key} className={`col-span-2 ${containerClass}`}>
            <span className="text-muted-foreground">{formattedKey}:</span>
            <p className="text-xs mt-1 p-2 bg-muted rounded">{value}</p>
            {issue && <span className="ml-2 text-xs font-bold">⚠️ FLAGGED</span>}
          </div>
        );
      }

      return (
        <div key={key} className={containerClass}>
          <span className="text-muted-foreground">{formattedKey}:</span>
          <span className="ml-2">{value}</span>
          {issue && <span className="ml-2 text-xs font-bold">⚠️ FLAGGED</span>}
        </div>
      );
    }

    return null;
  };

  const renderSubsection = (subsectionData: any, subsectionName: string, sectionName: string) => {
    if (!subsectionData || typeof subsectionData !== 'object') return null;

    // Check if this is a nested object that needs further expansion
    const hasNestedData = Object.values(subsectionData).some(val => 
      val !== null && typeof val === 'object' && !Array.isArray(val)
    );

    if (hasNestedData) {
      // Render nested subsections (e.g., battery_bank.daily)
      return (
        <div key={subsectionName} className="space-y-3">
          <h5 className="font-medium text-base text-primary mt-2">{formatKey(subsectionName)}</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm pl-4">
            {Object.entries(subsectionData).map(([key, value]: [string, any]) => {
              if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
                // Another level of nesting
                return (
                  <div key={key} className="col-span-2">
                    <h6 className="font-medium text-sm text-muted-foreground mb-2">{formatKey(key)}</h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4">
                      {Object.entries(value).map(([nestedKey, nestedValue]: [string, any]) =>
                        renderValue(nestedKey, nestedValue, sectionName, `${subsectionName} - ${key}`)
                      )}
                    </div>
                  </div>
                );
              }
              return renderValue(key, value, sectionName, subsectionName);
            })}
          </div>
        </div>
      );
    }

    // Render simple subsection
    return (
      <div key={subsectionName} className="space-y-3">
        <h5 className="font-medium text-base text-primary mt-2">{formatKey(subsectionName)}</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm pl-4">
          {Object.entries(subsectionData).map(([key, value]: [string, any]) =>
            renderValue(key, value, sectionName, subsectionName)
          )}
        </div>
      </div>
    );
  };

  const renderSection = (sectionData: any, sectionName: string) => {
    if (!sectionData) return null;

    return (
      <Card className="p-4 space-y-4">
        <h4 className="font-semibold text-lg border-b pb-2">{sectionName}</h4>
        
        {Object.entries(sectionData).map(([key, value]: [string, any]) => {
          // Handle nested objects (like ptr, diesel_gen, battery_bank, etc.)
          if (value !== null && typeof value === 'object' && !Array.isArray(value) && !key.includes('photo')) {
            return renderSubsection(value, key, sectionName);
          }
          
          // Handle direct values (like landscape_photo)
          return (
            <div key={key} className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {renderValue(key, value, sectionName)}
            </div>
          );
        })}
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* OD Yard Section */}
      {data.section1_od_yard && renderSection(data.section1_od_yard, 'OD Yard Section')}
      
      {/* Control Room Section */}
      {data.section2_control_room && renderSection(data.section2_control_room, 'Control Room Section')}
    </div>
  );
};
