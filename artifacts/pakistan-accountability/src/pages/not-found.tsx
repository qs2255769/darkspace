import { Card, CardContent } from "@/components/ui";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center">
      <Card className="w-full max-w-md mx-4 border-destructive/20 bg-destructive/5">
        <CardContent className="pt-6 text-center">
          <div className="flex mb-4 gap-2 justify-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">404 - Endpoint Missing</h1>
          <p className="text-sm text-muted-foreground">
            The database fragment or profile you are looking for does not exist or has been redacted.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
