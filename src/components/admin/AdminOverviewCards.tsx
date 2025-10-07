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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
      <Card className="p-4 sm:p-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-2 sm:p-3 bg-primary/10 rounded-lg flex-shrink-0">
            <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm text-muted-foreground">Total Users</p>
            <p className="text-xl sm:text-2xl font-bold">{totalUsers}</p>
            <p className="text-xs text-muted-foreground truncate">Operators</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 sm:p-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-2 sm:p-3 bg-blue-100 rounded-lg flex-shrink-0">
            <ClipboardList className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm text-muted-foreground">Today's Checklists</p>
            <p className="text-xl sm:text-2xl font-bold">{todaysChecklists}</p>
            <p className="text-xs text-muted-foreground truncate">In progress or completed</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 sm:p-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-2 sm:p-3 bg-green-100 rounded-lg flex-shrink-0">
            <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm text-muted-foreground">Completed Today</p>
            <p className="text-xl sm:text-2xl font-bold">
              {completedToday}/{todaysChecklists}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {todaysChecklists > 0 ? Math.round((completedToday / todaysChecklists) * 100) : 0}% completion rate
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4 sm:p-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-2 sm:p-3 bg-red-100 rounded-lg flex-shrink-0">
            <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm text-muted-foreground">Active Problems</p>
            <p className="text-xl sm:text-2xl font-bold text-red-600">{activeProblems}</p>
            <p className="text-xs text-muted-foreground truncate">Requires attention</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
