import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface IssueFlaggerProps {
  checklistId?: string;
  transformerLogId?: string;
  module: string;
  section: string;
  item: string;
  unit?: string;
  disabled?: boolean;
  defaultSeverity?: 'low' | 'medium' | 'high' | 'critical';
  autoDescription?: string;
}

export const IssueFlagger = ({ checklistId, transformerLogId, module, section, item, unit, disabled = false, defaultSeverity, autoDescription }: IssueFlaggerProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [severity, setSeverity] = useState<string>(defaultSeverity || 'medium');
  const [description, setDescription] = useState(autoDescription || '');
  const [loading, setLoading] = useState(false);

  const handleOpenDialog = () => {
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!user) return;

    const trimmedDesc = description.trim();
    
    if (trimmedDesc.length < 10) {
      toast({ 
        title: 'Description too short', 
        description: 'Please provide at least 10 characters',
        variant: 'destructive' 
      });
      return;
    }
    
    if (trimmedDesc.length > 1000) {
      toast({ 
        title: 'Description too long', 
        description: 'Maximum 1000 characters allowed',
        variant: 'destructive' 
      });
      return;
    }

    // Validate that we have a valid reference ID
    const validChecklistId = checklistId && checklistId !== 'pending';
    const validTransformerLogId = transformerLogId && transformerLogId !== 'pending';

    if (!validChecklistId && !validTransformerLogId) {
      toast({
        title: 'Cannot flag issue',
        description: 'Unable to save issue. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const prefix = validTransformerLogId ? 'TRF' : 'CHK';
      const issueCode = `${prefix}-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Date.now().toString().slice(-4)}`;
      
      const { error } = await supabase.from('flagged_issues').insert({
        checklist_id: validChecklistId ? checklistId : null,
        transformer_log_id: validTransformerLogId ? transformerLogId : null,
        user_id: user.id,
        module,
        section,
        item,
        unit,
        severity,
        description: trimmedDesc,
        issue_code: issueCode,
        status: 'reported'
      });

      if (error) throw error;

      toast({ 
        title: 'Issue flagged successfully', 
        description: `Issue code: ${issueCode}`
      });
      setOpen(false);
      setDescription('');
    } catch (error) {
      toast({ title: 'Error flagging issue', description: 'Please try again or contact support.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button size="sm" variant="destructive" onClick={handleOpenDialog} disabled={disabled}>
        <AlertCircle className="mr-2 h-4 w-4" />
        Flag Issue
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Flag Issue</DialogTitle>
            <DialogDescription>
              Report an issue with this measurement or field. Provide details about what you observed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Location</Label>
              <Input value={`${module} - ${section} - ${item}${unit ? ` - ${unit}` : ''}`} disabled />
            </div>
            <div>
              <Label>Severity</Label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue..."
                maxLength={1000}
                className="min-h-[100px]"
              />
              <div className="text-sm text-muted-foreground text-right mt-1">
                {description.length}/1000 characters
              </div>
            </div>
            <Button onClick={handleSubmit} disabled={loading || description.trim().length < 10}>
              Submit Issue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
