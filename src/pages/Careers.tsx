import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Careers() {
  return (
    <div className="min-h-screen p-6 pb-32 flex items-center justify-center">
      <Card className="glass-card p-12 max-w-md text-center">
        <Briefcase className="w-16 h-16 text-primary mx-auto mb-6" />
        <h1 className="text-3xl font-light text-foreground mb-4">Careers</h1>
        <p className="text-muted-foreground mb-6">
          We're not hiring at the moment, but we'd love to hear from you.
        </p>
        <Link to="/contact">
          <Button>Get in Touch</Button>
        </Link>
      </Card>
    </div>
  );
}