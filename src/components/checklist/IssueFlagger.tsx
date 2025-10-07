import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface IssueFlaggerProps {
  checklistId: string;
  module: string;
  section: string;
  item: string;
}

export const IssueFlagger = ({ checklistId, module, section, item }: IssueFlaggerProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [severity, setSeverity] = useState<string>('medium');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user || !description) return;

    setLoading(true);
    try {
      const issueCode = `CHK-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Date.now().toString().slice(-4)}`;
      
      const { error } = await supabase.from('flagged_issues').insert({
        checklist_id: checklistId,
        user_id: user.id,
        module,
        section,
        item,
        severity,
        description,
        issue_code: issueCode,
        status: 'reported'
      });

      if (error) throw error;

      toast({ title: 'Issue flagged successfully', description: `Issue code: ${issueCode}` });
      setOpen(false);
      setDescription('');
    } catch (error) {
      toast({ title: 'Error flagging issue', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button size="sm" variant="destructive" onClick={() => setOpen(true)}>
        <AlertCircle className="mr-2 h-4 w-4" />
        Flag Issue
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Flag Issue</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Module</Label>
              <Input value={`${module} - ${section} - ${item}`} disabled />
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
              />
            </div>
            <Button onClick={handleSubmit} disabled={loading || !description}>
              Submit Issue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
