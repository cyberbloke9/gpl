import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Edit, Download } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';

interface SCADATag {
  id?: string;
  tag_name: string;
  modbus_address: number;
  modbus_function_code: number;
  slave_address: number;
  data_type: string;
  byte_order: string;
  scaling_factor: number;
  offset: number;
  unit: string;
  target_table: string;
  target_field: string;
  transformer_number: number | null;
  min_value: number | null;
  max_value: number | null;
  alarm_low: number | null;
  alarm_high: number | null;
  is_active: boolean;
  polling_priority: number;
  description: string;
}

export function SCADATagMapping() {
  const [tags, setTags] = useState<SCADATag[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<SCADATag | null>(null);
  const { toast } = useToast();

  const emptyForm: SCADATag = {
    tag_name: '',
    modbus_address: 0,
    modbus_function_code: 3,
    slave_address: 1,
    data_type: 'uint16',
    byte_order: 'big_abcd',
    scaling_factor: 1,
    offset: 0,
    unit: '',
    target_table: 'transformer_logs',
    target_field: '',
    transformer_number: null,
    min_value: null,
    max_value: null,
    alarm_low: null,
    alarm_high: null,
    is_active: true,
    polling_priority: 1,
    description: '',
  };

  const [formData, setFormData] = useState<SCADATag>(emptyForm);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('scada_tag_mappings' as any)
      .select('*')
      .order('tag_name');

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load SCADA tags',
        variant: 'destructive',
      });
    } else {
      setTags((data as any) || []);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    const payload = { ...formData };
    if (editingTag?.id) {
      payload.id = editingTag.id;
    }

    const { error } = await supabase
      .from('scada_tag_mappings' as any)
      .upsert(payload);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'SCADA tag saved successfully',
      });
      loadTags();
      setIsDialogOpen(false);
      resetForm();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this SCADA tag mapping?')) return;

    const { error } = await supabase
      .from('scada_tag_mappings' as any)
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete tag',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Deleted',
        description: 'SCADA tag deleted',
      });
      loadTags();
    }
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingTag(null);
  };

  const exportConfig = () => {
    const csv = [
      'Tag Name,Modbus Address,Function Code,Slave ID,Data Type,Scaling,Offset,Unit,Target Table,Target Field,Transformer,Active,Description',
      ...tags.map(t => `${t.tag_name},${t.modbus_address},${t.modbus_function_code},${t.slave_address},${t.data_type},${t.scaling_factor},${t.offset},${t.unit},${t.target_table},${t.target_field},${t.transformer_number || ''},${t.is_active},${t.description}`)
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scada_tag_mappings_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <CardTitle>SCADA Tag Mappings</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={exportConfig}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tag
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle>{editingTag ? 'Edit' : 'Add'} SCADA Tag</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[70vh] pr-2 sm:pr-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 py-4">
                    <div>
                      <Label>Tag Name *</Label>
                      <Input
                        value={formData.tag_name}
                        onChange={(e) => setFormData({ ...formData, tag_name: e.target.value })}
                        placeholder="PT1_VOLTAGE_RY"
                      />
                    </div>
                    <div>
                      <Label>Modbus Address *</Label>
                      <Input
                        type="number"
                        value={formData.modbus_address}
                        onChange={(e) => setFormData({ ...formData, modbus_address: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label>Function Code</Label>
                      <Select value={formData.modbus_function_code.toString()} onValueChange={(v) => setFormData({ ...formData, modbus_function_code: parseInt(v) })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 - Coil</SelectItem>
                          <SelectItem value="2">2 - Discrete Input</SelectItem>
                          <SelectItem value="3">3 - Holding Register</SelectItem>
                          <SelectItem value="4">4 - Input Register</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Slave Address</Label>
                      <Input
                        type="number"
                        value={formData.slave_address}
                        onChange={(e) => setFormData({ ...formData, slave_address: parseInt(e.target.value) || 1 })}
                      />
                    </div>
                    <div>
                      <Label>Data Type</Label>
                      <Select value={formData.data_type} onValueChange={(v) => setFormData({ ...formData, data_type: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="uint16">Unsigned Int 16</SelectItem>
                          <SelectItem value="int16">Signed Int 16</SelectItem>
                          <SelectItem value="uint32">Unsigned Int 32</SelectItem>
                          <SelectItem value="int32">Signed Int 32</SelectItem>
                          <SelectItem value="float32">Float 32</SelectItem>
                          <SelectItem value="boolean">Boolean</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Scaling Factor</Label>
                      <Input
                        type="number"
                        step="0.0001"
                        value={formData.scaling_factor}
                        onChange={(e) => setFormData({ ...formData, scaling_factor: parseFloat(e.target.value) || 1 })}
                      />
                    </div>
                    <div>
                      <Label>Offset</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.offset}
                        onChange={(e) => setFormData({ ...formData, offset: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label>Unit</Label>
                      <Input
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        placeholder="kV, A, °C, Hz, kW, %"
                      />
                    </div>
                    <div>
                      <Label>Target Table</Label>
                      <Select value={formData.target_table} onValueChange={(v) => setFormData({ ...formData, target_table: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="transformer_logs">Transformer Logs</SelectItem>
                          <SelectItem value="generator_logs">Generator Logs</SelectItem>
                          <SelectItem value="scada_readings">SCADA Readings Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Target Field *</Label>
                      <Input
                        value={formData.target_field}
                        onChange={(e) => setFormData({ ...formData, target_field: e.target.value })}
                        placeholder="voltage_ry, current_r, etc."
                      />
                    </div>
                    {formData.target_table === 'transformer_logs' && (
                      <div>
                        <Label>Transformer Number</Label>
                        <Select value={formData.transformer_number?.toString() || ''} onValueChange={(v) => setFormData({ ...formData, transformer_number: v ? parseInt(v) : null })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select transformer" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Transformer 1</SelectItem>
                            <SelectItem value="2">Transformer 2</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div>
                      <Label>Polling Priority</Label>
                      <Select value={formData.polling_priority.toString()} onValueChange={(v) => setFormData({ ...formData, polling_priority: parseInt(v) })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 - High</SelectItem>
                          <SelectItem value="2">2 - Medium</SelectItem>
                          <SelectItem value="3">3 - Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label>Description</Label>
                      <Input
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Brief description of this tag"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                      />
                      <Label>Active</Label>
                    </div>
                  </div>
                  <Button onClick={handleSave} className="w-full mt-4">
                    Save Tag Mapping
                  </Button>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        <div className="overflow-x-auto">
          <ScrollArea className="h-[400px] sm:h-[600px]">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Tag Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tags.map((tag) => (
                  <TableRow key={tag.id}>
                    <TableCell className="font-mono text-sm">{tag.tag_name}</TableCell>
                    <TableCell>{tag.modbus_address}</TableCell>
                    <TableCell className="text-xs">{tag.data_type}</TableCell>
                    <TableCell className="text-xs">
                      {tag.target_table}.{tag.target_field}
                      {tag.transformer_number && ` (T${tag.transformer_number})`}
                    </TableCell>
                    <TableCell>{tag.unit}</TableCell>
                    <TableCell>{tag.is_active ? '✅' : '❌'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => {
                          setEditingTag(tag);
                          setFormData(tag);
                          setIsDialogOpen(true);
                        }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => tag.id && handleDelete(tag.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
