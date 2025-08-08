import { useMemo, useState } from "react";
import { Seo } from "@/components/Seo";
import { SearchSidebar, Filters } from "@/components/recruiter/SearchSidebar";
import { CandidateList } from "@/components/recruiter/CandidateList";
import { toast } from "@/hooks/use-toast";

const initialFilters: Filters = {
  query: "",
  requiredSkills: [],
  preferredSkills: [],
  titles: [],
  industries: [],
  locations: [],
  companies: [],
  openToWorkOnly: false,
  minYears: 0,
  maxYears: 50,
};

const Index = () => {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const canonical = useMemo(() => (typeof window !== 'undefined' ? window.location.href : undefined), []);

  const onReset = () => setFilters(initialFilters);
  const onSearch = () =>
    toast({ title: "Searching", description: "Applied your latest criteria." });

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Recruiter Search – Find top candidates by skills & location"
        description="Search candidates like LinkedIn Recruiter: filter by skills, titles, industry, location, and more."
        canonical={canonical}
      />

      <header className="bg-gradient-primary text-primary-foreground">
        <div className="container px-4 py-8">
          <h1 className="text-3xl font-bold">AI-Powered Recruiter Search</h1>
          <p className="text-sm/6 opacity-90 max-w-2xl">
            Find the right talent faster. Combine natural language with structured filters to surface the best matches.
          </p>
        </div>
      </header>

      <main className="container px-0 md:px-6">
        <div className="flex min-h-[70vh]">
          <SearchSidebar value={filters} onChange={setFilters} onReset={onReset} onSearch={onSearch} />
          <CandidateList filters={filters} />
        </div>
      </main>
    </div>
  );
};

export default Index;
