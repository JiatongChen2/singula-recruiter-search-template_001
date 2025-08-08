import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Briefcase, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { Candidate } from "@/data/candidates";

export function CandidateCard({ c }: { c: Candidate }) {
  const initials = c.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const onSave = () =>
    toast({
      title: "Saved candidate",
      description: `${c.name} was added to your shortlist.`,
    });

  return (
    <Card className="card-hover shadow-elegant hover:shadow-elegant-lg">
      <CardHeader className="flex flex-row items-start gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={c.avatarUrl} alt={`${c.name} profile photo`} />
          <AvatarFallback aria-label={`${c.name} initials`}>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-base flex items-center gap-2">
            {c.name}
            {c.openToWork && (
              <Badge variant="secondary" className="inline-flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-accent" /> Open to work
              </Badge>
            )}
          </CardTitle>
          <div className="text-sm text-muted-foreground flex flex-wrap gap-3 pt-1">
            <span className="inline-flex items-center gap-1">
              <Briefcase className="h-4 w-4" /> {c.title} · {c.company}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {c.location}
            </span>
            <span>{c.industry}</span>
            <span>{c.yearsExperience} yrs</span>
          </div>
        </div>
        <div>
          <Button variant="outline" size="sm" onClick={onSave}>Save</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm leading-relaxed">{c.summary}</p>
        <div className="flex flex-wrap gap-2">
          {c.skills.slice(0, 8).map((s) => (
            <Badge key={s} variant="secondary">{s}</Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
