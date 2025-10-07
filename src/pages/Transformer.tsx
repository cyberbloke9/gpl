import { Navigation } from '@/components/Navigation';
import { TransformerLogForm } from '@/components/transformer/TransformerLogForm';
import { TransformerLogHistory } from '@/components/transformer/TransformerLogHistory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

export default function Transformer() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8 pb-20 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Transformer Logs</h1>
          <p className="text-muted-foreground mt-2">
            Log hourly readings for transformers 1 and 2
          </p>
        </div>

        <Card className="p-6">
          <Tabs defaultValue="log-entry">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="log-entry">Log Entry</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="log-entry">
              <TransformerLogForm />
            </TabsContent>

            <TabsContent value="history">
              <TransformerLogHistory userId={user?.id} />
            </TabsContent>
          </Tabs>
        </Card>
      </main>
    </div>
  );
}
