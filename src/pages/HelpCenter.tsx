import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HelpCenter() {
  return (
    <div className="min-h-screen p-6 pb-32 flex items-center justify-center">
      <Card className="glass-card p-12 max-w-md text-center">
        <HelpCircle className="w-16 h-16 text-primary mx-auto mb-6" />
        <h1 className="text-3xl font-light text-foreground mb-4">Help Center</h1>
        <p className="text-muted-foreground mb-6">
          Coming soon. In the meantime, reach out to our team directly.
        </p>
        <Link to="/contact">
          <Button>Contact Support</Button>
        </Link>
      </Card>
    </div>
  );
}