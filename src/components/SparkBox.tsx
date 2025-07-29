import { Card, CardContent } from "@/components/ui/card";

interface SparkBoxProps {
  content?: string;
}

export default function SparkBox({ 
  content = "This is a Spark (aka brainstorm)" 
}: SparkBoxProps) {
  return (
    <Card className="bg-accent border-spark-border border-2 hover:shadow-md transition-all duration-200">
      <CardContent className="p-5">
        <p className="text-accent-foreground text-base leading-relaxed">
          {content}
        </p>
      </CardContent>
    </Card>
  );
}