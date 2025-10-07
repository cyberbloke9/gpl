import { Card } from '@/components/ui/card';
import { Users, ClipboardList, CheckCircle2, AlertCircle } from 'lucide-react';

interface AdminOverviewCardsProps {
  totalUsers: number;
  todaysChecklists: number;
  completedToday: number;
  activeProblems: number;
}

export const AdminOverviewCards = ({
  totalUsers,
  todaysChecklists,
  completedToday,
  activeProblems,
}: AdminOverviewCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Users</p>
            <p className="text-2xl font-bold">{totalUsers}</p>
            <p className="text-xs text-muted-foreground">Operators</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <ClipboardList className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Today's Checklists</p>
            <p className="text-2xl font-bold">{todaysChecklists}</p>
            <p className="text-xs text-muted-foreground">In progress or completed</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Completed Today</p>
            <p className="text-2xl font-bold">
              {completedToday}/{todaysChecklists}
            </p>
            <p className="text-xs text-muted-foreground">
              {todaysChecklists > 0 ? Math.round((completedToday / todaysChecklists) * 100) : 0}% completion rate
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-100 rounded-lg">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Active Problems</p>
            <p className="text-2xl font-bold text-red-600">{activeProblems}</p>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
