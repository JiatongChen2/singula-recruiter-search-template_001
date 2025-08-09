import { useMemo, useState } from "react";
import type { Candidate } from "@/data/candidates";
import { CandidateCard } from "./CandidateCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import type { Filters } from "./SearchSidebar";

function scoreCandidate(c: Candidate, f: Filters) {
  let score = 0;
  const q = f.query.toLowerCase();
  if (q) {
    if (c.name.toLowerCase().includes(q)) score += 3;
    if (c.title.toLowerCase().includes(q)) score += 3;
    if (c.summary.toLowerCase().includes(q)) score += 2;
  }
  // required skills = all must be present
  if (f.requiredSkills.every((rs) => c.skills.map((s) => s.toLowerCase()).includes(rs.toLowerCase()))) {
    score += 10 * f.requiredSkills.length;
  } else if (f.requiredSkills.length) {
    return -1; // hard filter fail
  }
  // preferred = any adds points
  const preferredHits = f.preferredSkills.filter((ps) =>
    c.skills.map((s) => s.toLowerCase()).includes(ps.toLowerCase())
  ).length;
  score += preferredHits * 3;

  if (f.titles.length && !f.titles.some((t) => c.title.toLowerCase().includes(t.toLowerCase()))) return -1;
  if (f.industries.length && !f.industries.some((i) => c.industry.toLowerCase().includes(i.toLowerCase()))) return -1;
  if (f.locations.length && !f.locations.some((l) => c.location.toLowerCase().includes(l.toLowerCase()))) return -1;
  if (f.companies && f.companies.length && !f.companies.some((co) => c.company.toLowerCase().includes(co.toLowerCase()))) return -1;
  if (f.openToWorkOnly && !c.openToWork) return -1;
  if (f.minYears && c.yearsExperience < f.minYears) return -1;
  if (f.maxYears && c.yearsExperience > f.maxYears) return -1;

  return score;
}

export function CandidateList({ filters }: { filters: Filters }) {
  const [sort, setSort] = useState("relevance");
  const [searchInResults, setSearchInResults] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const list = useMemo(() => {
    const filtered = candidates
      .map((c) => ({ c, score: scoreCandidate(c, filters) }))
      .filter((x) => x.score >= 0)
      .filter((x) =>
        searchInResults
          ? `${x.c.name} ${x.c.title} ${x.c.company} ${x.c.skills.join(" ")}`
              .toLowerCase()
              .includes(searchInResults.toLowerCase())
          : true
      );

    switch (sort) {
      case "exp-desc":
        filtered.sort((a, b) => b.c.yearsExperience - a.c.yearsExperience);
        break;
      case "exp-asc":
        filtered.sort((a, b) => a.c.yearsExperience - b.c.yearsExperience);
        break;
      default:
        filtered.sort((a, b) => b.score - a.score);
    }

    return filtered.map((x) => x.c);
  }, [filters, sort, searchInResults, candidates]);

  const onSaveSearch = () =>
    toast({ title: "Search saved", description: "Your query was saved for quick access." });

  const onLoadData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/candidate.json`, { cache: "no-cache" });
      if (!response.ok) {
        throw new Error(`Failed to load candidate.json (${response.status})`);
      }
      const data = (await response.json()) as Candidate[];
      if (!Array.isArray(data)) {
        throw new Error("candidate.json is not an array");
      }
      setCandidates(data);
      toast({ title: "Data loaded", description: `Loaded ${data.length} candidates from file.` });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast({ title: "Load failed", description: message, variant: "destructive" as any });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="flex-1 p-4 md:p-6 space-y-4">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Recruiter search</h1>
          <p className="text-sm text-muted-foreground">
            {candidates.length === 0
              ? "No candidates loaded. Click 'Load data' to fetch profiles."
              : `${list.length} candidates match your filters`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Input
            placeholder="Search within results"
            value={searchInResults}
            onChange={(e) => setSearchInResults(e.target.value)}
            className="w-48"
          />
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent className="z-50">
              <SelectItem value="relevance">Best match</SelectItem>
              <SelectItem value="exp-desc">Experience: High → Low</SelectItem>
              <SelectItem value="exp-asc">Experience: Low → High</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="secondary" onClick={onLoadData} disabled={isLoading}>
            {isLoading ? "Loading..." : "Load data"}
          </Button>
          <Button variant="hero" onClick={onSaveSearch}>Save search</Button>
        </div>
      </header>

      {candidates.length === 0 ? (
        <div className="p-6 border rounded-md text-sm text-muted-foreground">
          No data loaded yet. Use the "Load data" button to fetch candidate profiles.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {list.map((c) => (
            <CandidateCard key={c.id} c={c} />
          ))}
        </div>
      )}
    </section>
  );
}
