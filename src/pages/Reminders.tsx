import { Navigation } from '@/components/Navigation';

export default function Reminders() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">Interval Reminders</h1>
      </main>
    </div>
  );
}
