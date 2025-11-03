import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Search, Users, UserPlus, Edit } from 'lucide-react';
import { UserManagementData } from '@/types/admin';
import { useToast } from '@/hooks/use-toast';

export const UserManagementPanel = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserManagementData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserManagementData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  // New user form state
  const [newUser, setNewUser] = useState({
    fullName: '',
    employeeId: '',
    email: '',
    password: '',
    role: 'operator' as 'admin' | 'operator'
  });

  // Edit user form state
  const [editUser, setEditUser] = useState<UserManagementData | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(user => 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.employee_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-users');

      if (error) throw error;

      if (data?.users) {
        setUsers(data.users);
        setFilteredUsers(data.users);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        variant: "destructive",
        title: "Failed to load users",
        description: "Could not fetch user data.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: newUser.email,
          password: newUser.password,
          full_name: newUser.fullName,
          employee_id: newUser.employeeId || null,
          role: newUser.role
        }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      toast({
        title: "User created successfully",
        description: `${newUser.fullName} has been added to the system.`,
      });

      // Reset form and close dialog
      setNewUser({
        fullName: '',
        employeeId: '',
        email: '',
        password: '',
        role: 'operator'
      });
      setDialogOpen(false);

      // Reload users
      loadUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        variant: "destructive",
        title: "Failed to create user",
        description: error.message || "An error occurred while creating the user.",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    
    setUpdating(true);

    try {
      const { data, error } = await supabase.functions.invoke('update-user', {
        body: {
          user_id: editUser.id,
          email: editUser.email,
          full_name: editUser.full_name,
          employee_id: editUser.employee_id || null,
          shift: editUser.shift || null,
          role: editUser.role
        }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      toast({
        title: "User updated successfully",
        description: `${editUser.full_name}'s information has been updated.`,
      });

      setEditDialogOpen(false);
      setEditUser(null);
      loadUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        variant: "destructive",
        title: "Failed to update user",
        description: error.message || "An error occurred while updating the user.",
      });
    } finally {
      setUpdating(false);
    }
  };

  const openEditDialog = (user: UserManagementData) => {
    setEditUser({ ...user });
    setEditDialogOpen(true);
  };

  if (loading) {
    return <div className="text-center py-8">Loading users...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                User Management
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">View and manage all system users</CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto text-xs sm:text-sm">
                  <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Create User
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[90vw] sm:max-w-[425px]">
                <form onSubmit={handleCreateUser}>
                  <DialogHeader>
                    <DialogTitle className="text-base sm:text-lg">Create New User</DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm">
                      Add a new user to the system. They will be able to sign in immediately.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-3 sm:gap-4 py-3 sm:py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="fullName" className="text-xs sm:text-sm">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={newUser.fullName}
                        onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                        placeholder="John Doe"
                        required
                        className="text-sm"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="employeeId" className="text-xs sm:text-sm">Employee ID</Label>
                      <Input
                        id="employeeId"
                        value={newUser.employeeId}
                        onChange={(e) => setNewUser({ ...newUser, employeeId: e.target.value })}
                        placeholder="EMP001"
                        className="text-sm"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email" className="text-xs sm:text-sm">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        placeholder="user@gayatripower.com"
                        required
                        className="text-sm"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password" className="text-xs sm:text-sm">Temporary Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        placeholder="Min 8 characters"
                        minLength={8}
                        required
                        className="text-sm"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="role" className="text-xs sm:text-sm">Role *</Label>
                      <Select
                        value={newUser.role}
                        onValueChange={(value: 'admin' | 'operator') => setNewUser({ ...newUser, role: value })}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="operator" className="text-sm">Operator</SelectItem>
                          <SelectItem value="admin" className="text-sm">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="text-xs sm:text-sm">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={creating} className="text-xs sm:text-sm">
                      {creating ? 'Creating...' : 'Create User'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="mb-3 sm:mb-4">
            <div className="relative">
              <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or employee ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 sm:pl-10 text-xs sm:text-sm"
              />
            </div>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap text-xs sm:text-sm">Full Name</TableHead>
                  <TableHead className="whitespace-nowrap text-xs sm:text-sm">Email</TableHead>
                  <TableHead className="hidden sm:table-cell whitespace-nowrap text-xs sm:text-sm">Employee ID</TableHead>
                  <TableHead className="whitespace-nowrap text-xs sm:text-sm">Role</TableHead>
                  <TableHead className="hidden md:table-cell whitespace-nowrap text-xs sm:text-sm">Registration Date</TableHead>
                  <TableHead className="whitespace-nowrap text-xs sm:text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8 text-sm">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium text-sm">{user.full_name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{user.email}</TableCell>
                      <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                        {user.employee_id || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                        {format(new Date(user.created_at), 'PPp')}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(user)}
                          className="h-8 px-2"
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-[425px]">
          {editUser && (
            <form onSubmit={handleEditUser}>
              <DialogHeader>
                <DialogTitle className="text-base sm:text-lg">Edit User</DialogTitle>
                <DialogDescription className="text-xs sm:text-sm">
                  Update user information and permissions.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 sm:gap-4 py-3 sm:py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-fullName" className="text-xs sm:text-sm">Full Name *</Label>
                  <Input
                    id="edit-fullName"
                    value={editUser.full_name}
                    onChange={(e) => setEditUser({ ...editUser, full_name: e.target.value })}
                    placeholder="John Doe"
                    required
                    className="text-sm"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-email" className="text-xs sm:text-sm">Email *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editUser.email}
                    onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                    placeholder="user@gayatripower.com"
                    required
                    className="text-sm"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-employeeId" className="text-xs sm:text-sm">Employee ID</Label>
                  <Input
                    id="edit-employeeId"
                    value={editUser.employee_id || ''}
                    onChange={(e) => setEditUser({ ...editUser, employee_id: e.target.value })}
                    placeholder="EMP001"
                    className="text-sm"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-shift" className="text-xs sm:text-sm">Shift</Label>
                  <Input
                    id="edit-shift"
                    value={editUser.shift || ''}
                    onChange={(e) => setEditUser({ ...editUser, shift: e.target.value })}
                    placeholder="Day/Night"
                    className="text-sm"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-role" className="text-xs sm:text-sm">Role *</Label>
                  <Select
                    value={editUser.role}
                    onValueChange={(value: 'admin' | 'operator') => setEditUser({ ...editUser, role: value })}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="operator" className="text-sm">Operator</SelectItem>
                      <SelectItem value="admin" className="text-sm">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)} className="text-xs sm:text-sm">
                  Cancel
                </Button>
                <Button type="submit" disabled={updating} className="text-xs sm:text-sm">
                  {updating ? 'Updating...' : 'Update User'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
