import { Card } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

export default function Blog() {
  return (
    <div className="min-h-screen p-6 pb-32 flex items-center justify-center">
      <Card className="glass-card p-12 max-w-md text-center">
        <BookOpen className="w-16 h-16 text-primary mx-auto mb-6" />
        <h1 className="text-3xl font-light text-foreground mb-4">Blog</h1>
        <p className="text-muted-foreground">
          Coming soon. We're working on bringing you updates, insights, and behind-the-scenes content.
        </p>
      </Card>
    </div>
  );
}