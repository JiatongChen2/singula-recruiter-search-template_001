import { useMemo, useState } from "react";
import type { Candidate } from "@/data/candidates";
import { CandidateCard } from "./CandidateCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import type { Filters } from "./SearchSidebar";

// New schema type for the updated JSON response
type NewCandidateResponse = {
  search_metadata: {
    search_date: string;
    search_query: string;
    total_candidates: number;
    search_parameters: {
      keyword: string;
      title_free_text: string;
      skills: string[];
    };
  };
  candidates: Array<{
    id: number;
    name: string;
    current_position: {
      title: string;
      company: string;
      start_date: string;
      is_current: boolean;
    };
    location: {
      state: string;
      city: string | null;
    };
    education: {
      latest_degree: string;
      school: string;
    };
    summary: string;
    key_experience: Array<{
      title: string;
      company: string;
      duration: string;
      description?: string;
    }>;
    industry: string;
    linkedin_url: string;
    score: number;
  }>;
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
      const data = (await response.json()) as NewCandidateResponse;
      if (!data.candidates || !Array.isArray(data.candidates)) {
        throw new Error("candidate.json does not contain a valid candidates array");
      }
      
      // Convert the new schema to the existing Candidate type for compatibility
      const convertedCandidates: Candidate[] = data.candidates.map((c) => ({
        id: c.id.toString(),
        name: c.name,
        title: c.current_position.title,
        company: c.current_position.company,
        location: c.location.city ? `${c.location.city}, ${c.location.state}` : c.location.state,
        industry: c.industry,
        yearsExperience: calculateYearsExperienceFromDuration(c.key_experience),
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
      toast({ title: "Load failed", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to calculate years of experience from duration strings
  const calculateYearsExperienceFromDuration = (experiences: NewCandidateResponse['candidates'][0]['key_experience']): number => {
    if (!experiences.length) return 0;
    
    let totalYears = 0;
    
    experiences.forEach(experience => {
      const duration = experience.duration;
      // Parse duration strings like "October 2019 - February 2021" or "March 2021 - March 2022"
      const yearMatch = duration.match(/(\d{4})/g);
      if (yearMatch && yearMatch.length >= 2) {
        const startYear = parseInt(yearMatch[0]);
        const endYear = parseInt(yearMatch[1]);
        totalYears += (endYear - startYear);
      } else if (yearMatch && yearMatch.length === 1) {
        // For current positions, estimate from start year
        const startYear = parseInt(yearMatch[0]);
        const currentYear = new Date().getFullYear();
        totalYears += (currentYear - startYear);
      }
    });
    
    return Math.max(1, Math.round(totalYears)); // Minimum 1 year
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
      'Kubernetes', 'Git', 'CI/CD', 'REST API', 'GraphQL', 'Computer Vision',
      'NLP', 'Natural Language Processing', 'Neural Networks', 'OpenCV',
      'Keras', 'Scikit-learn', 'Matplotlib', 'Seaborn', 'Statistics'
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
