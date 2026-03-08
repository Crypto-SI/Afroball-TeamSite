"use client";

import { useState, useEffect } from "react";
import { generateMatchSummary } from "@/ai/flows/automated-match-summaries";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AIMatchInsightProps {
  context: string;
  title: string;
}

export function AIMatchInsight({ context, title }: AIMatchInsightProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateMatchSummary({ context });
      setSummary(result.summary);
    } catch (error) {
      console.error("Failed to generate summary", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-primary/10 border-accent/20">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          AI Mariner Insight
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleGenerate}
          disabled={loading}
          className="text-xs h-8"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
          {summary ? "Regenerate" : "Generate Insight"}
        </Button>
      </CardHeader>
      <CardContent>
        {summary ? (
          <div className="text-sm leading-relaxed text-muted-foreground animate-in fade-in slide-in-from-top-1">
            {summary.split('\n').map((para, i) => (
              <p key={i} className="mb-2 last:mb-0">{para}</p>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            Tap the button to get an AI-powered summary of {title}.
          </p>
        )}
      </CardContent>
    </Card>
  );
}