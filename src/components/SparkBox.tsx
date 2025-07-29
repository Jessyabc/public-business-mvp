import { Card, CardContent } from "@/components/ui/card";

interface SparkBoxProps {
  content?: string;
}

export default function SparkBox({ 
  content = "This is a Spark (aka brainstorm)" 
}: SparkBoxProps) {
  return (
    <Card className="glass-card hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 border-0">
      <CardContent className="p-6">
        <p className="text-foreground/90 text-base leading-relaxed font-medium">
          {content}
        </p>
      </CardContent>
    </Card>
  );
}