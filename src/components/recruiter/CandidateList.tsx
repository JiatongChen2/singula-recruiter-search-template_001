import { useMemo, useState } from "react";
import type { Candidate } from "@/data/candidates";
import { CandidateCard } from "./CandidateCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import type { Filters } from "./SearchSidebar";

// New schema type for the JSON response
type CandidateResponse = {
  data: Array<{
    firstName: string;
    lastName: string;
    summary: string;
    positions: Array<{
      titleName: string;
      description: string | null;
      companyName: string;
      locationName: string | null;
      startMonthYear: { month: number; year: number } | null;
      endMonthYear: { month: number; year: number } | null;
      isCurrentCompany: boolean;
      startTime: number | null;
      endTime: number | null;
    }>;
    educations: Array<{
      schoolName: string | null;
      degreeName: string | null;
      fieldsOfStudyName: string | null;
      startMonthYear: { month: number; year: number } | null;
      endMonthYear: { month: number; year: number } | null;
      startTime: number | null;
      endTime: number | null;
    }>;
    currentPosition: {
      titleName: string;
      description: string | null;
      companyName: string;
      locationName: string | null;
      startMonthYear: { month: number; year: number } | null;
      endMonthYear: { month: number; year: number } | null;
      isCurrentCompany: boolean;
      startTime: number | null;
      endTime: number | null;
    } | null;
    latestEducation: {
      schoolName: string | null;
      degreeName: string | null;
      fieldsOfStudyName: string | null;
      startMonthYear: { month: number; year: number } | null;
      endMonthYear: { month: number; year: number } | null;
      startTime: number | null;
      endTime: number | null;
    } | null;
    geographic_state_name: string | null;
    city_name: string | null;
    industry: string | null;
    public_profile_url: string | null;
    seniority_2_name: string | null;
    occupation_name: string | null;
    score: number;
  }>;
  pagination: {
    page: number;
    per_page: number;
    total_results: number;
    has_more: boolean;
    next_page: number | null;
    prev_page: number | null;
  };
  metadata: {
    response_time_ms: number;
    api_version: string;
    timestamp: string;
    search_parameters: Record<string, any>;
    elasticsearch_took: number;
    total_shards: number;
    successful_shards: number;
  };
};

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
      const data = (await response.json()) as CandidateResponse;
      if (!data.data || !Array.isArray(data.data)) {
        throw new Error("candidate.json does not contain a valid data array");
      }
      
      // Convert the new schema to the existing Candidate type for compatibility
      const convertedCandidates: Candidate[] = data.data.map((c, index) => ({
        id: (index + 1).toString(),
        name: `${c.firstName} ${c.lastName}`,
        title: c.currentPosition?.titleName || c.positions[0]?.titleName || "Unknown",
        company: c.currentPosition?.companyName || c.positions[0]?.companyName || "Unknown",
        location: c.currentPosition?.locationName || c.city_name || c.geographic_state_name || "Unknown",
        industry: c.industry || "Unknown",
        yearsExperience: calculateYearsExperience(c.positions),
        skills: extractSkillsFromSummary(c.summary),
        preferredSkills: [],
        openToWork: true, // Default to true since we don't have this info in new schema
        summary: c.summary,
        avatarUrl: undefined
      }));
      
      setCandidates(convertedCandidates);
      toast({ title: "Data loaded", description: `Loaded ${convertedCandidates.length} candidates from file.` });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast({ title: "Load failed", description: message, variant: "destructive" as any });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to calculate years of experience from positions
  const calculateYearsExperience = (positions: CandidateResponse['data'][0]['positions']): number => {
    if (!positions.length) return 0;
    
    const now = new Date();
    let totalYears = 0;
    
    positions.forEach(position => {
      if (position.startTime && position.endTime) {
        const start = new Date(position.startTime * 1000);
        const end = new Date(position.endTime * 1000);
        const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        totalYears += years;
      } else if (position.startTime && position.isCurrentCompany) {
        const start = new Date(position.startTime * 1000);
        const years = (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        totalYears += years;
      }
    });
    
    return Math.round(totalYears);
  };

  // Helper function to extract skills from summary text
  const extractSkillsFromSummary = (summary: string): string[] => {
    const skills: string[] = [];
    
    // Common ML/AI skills to look for
    const skillKeywords = [
      'Machine Learning', 'ML', 'AI', 'Artificial Intelligence', 'Deep Learning',
      'Python', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy',
      'React', 'JavaScript', 'TypeScript', 'Node.js', 'Java', 'C++', 'C#',
      'SQL', 'MongoDB', 'PostgreSQL', 'AWS', 'Azure', 'GCP', 'Docker',
      'Kubernetes', 'Git', 'CI/CD', 'REST API', 'GraphQL'
    ];
    
    skillKeywords.forEach(skill => {
      if (summary.toLowerCase().includes(skill.toLowerCase())) {
        skills.push(skill);
      }
    });
    
    return skills.slice(0, 8); // Limit to 8 skills
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
