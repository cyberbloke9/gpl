import { Navigation } from '@/components/Navigation';

export default function Admin() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </main>
    </div>
  );
}
