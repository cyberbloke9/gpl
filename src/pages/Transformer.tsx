import { Navigation } from '@/components/Navigation';
import { TransformerLogForm } from '@/components/transformer/TransformerLogForm';

export default function Transformer() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8 pb-20 max-w-6xl">
        <TransformerLogForm />
      </main>
    </div>
  );
}
