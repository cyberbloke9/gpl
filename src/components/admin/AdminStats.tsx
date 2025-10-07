import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface AdminStatsProps {
  totalUsers: number;
  todaysChecklists: number;
  completedToday: number;
  activeProblems: number;
  loading?: boolean;
}

export const AdminStats = ({ 
  totalUsers, 
  todaysChecklists, 
  completedToday, 
  activeProblems,
  loading = false 
}: AdminStatsProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="p-4">
        <p className="text-sm text-muted-foreground mb-1">Total Users</p>
        <p className="text-2xl font-bold">{totalUsers}</p>
      </Card>
      <Card className="p-4">
        <p className="text-sm text-muted-foreground mb-1">Today's Checklists</p>
        <p className="text-2xl font-bold">{todaysChecklists}</p>
      </Card>
      <Card className="p-4">
        <p className="text-sm text-muted-foreground mb-1">Completed Today</p>
        <p className="text-2xl font-bold text-green-600">{completedToday}</p>
      </Card>
      <Card className="p-4">
        <p className="text-sm text-muted-foreground mb-1">Active Problems</p>
        <p className="text-2xl font-bold text-red-600">{activeProblems}</p>
      </Card>
    </div>
  );
};