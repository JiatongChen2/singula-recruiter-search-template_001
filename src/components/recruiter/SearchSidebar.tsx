import { useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type Filters = {
  query: string;
  requiredSkills: string[];
  preferredSkills: string[];
  titles: string[];
  industries: string[];
  locations: string[];
  companies: string[];
  openToWorkOnly: boolean;
  minYears: number;
  maxYears: number;
};

type Props = {
  value: Filters;
  onChange: (next: Filters) => void;
  onReset: () => void;
  onSearch: () => void;
};

function TagInput({
  label,
  placeholder,
  values,
  onAdd,
  onRemove,
}: {
  label: string;
  placeholder?: string;
  values: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
}) {
  const [text, setText] = useState("");

  const tryAdd = () => {
    const tag = text.trim();
    if (!tag) return;
    onAdd(tag);
    setText("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      tryAdd();
    }
    if (e.key === "Backspace" && !text && values.length) {
      onRemove(values[values.length - 1]);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      <div className="flex flex-wrap gap-2">
        {values.map((v) => (
          <Badge key={v} variant="secondary" className="px-2 py-1">
            <span className="mr-1">{v}</span>
            <button
              aria-label={`Remove ${v}`}
              className="inline-flex items-center"
              onClick={() => onRemove(v)}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
        />
        <Button type="button" variant="soft" onClick={tryAdd}>
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>
    </div>
  );
}

export const SearchSidebar = ({ value, onChange, onReset, onSearch }: Props) => {
  const set = <K extends keyof Filters>(key: K, v: Filters[K]) =>
    onChange({ ...value, [key]: v });

  return (
    <aside className="w-full md:w-80 border-r bg-card/50 backdrop-blur-sm p-4 md:p-6 space-y-6">
      <section>
        <h2 className="text-lg font-semibold">Search criteria</h2>
        <p className="text-sm text-muted-foreground">Use natural language or be precise.</p>
      </section>

      <Tabs defaultValue="filters" className="space-y-6">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="filters">Filters</TabsTrigger>
          <TabsTrigger value="companies">Companies</TabsTrigger>
        </TabsList>

        <TabsContent value="filters" className="space-y-6">
          <section className="space-y-2">
            <Label htmlFor="nlq" className="text-sm text-muted-foreground">
              Natural language query
            </Label>
            <Textarea
              id="nlq"
              value={value.query}
              onChange={(e) => set("query", e.target.value)}
              placeholder="e.g. Senior React engineers in SF with GraphQL experience"
              rows={3}
            />
          </section>

          <Separator />

          <section className="space-y-4">
            <TagInput
              label="Required skills"
              placeholder="Type a skill and press Enter"
              values={value.requiredSkills}
              onAdd={(t) =>
                set(
                  "requiredSkills",
                  Array.from(new Set([...value.requiredSkills, t]))
                )
              }
              onRemove={(t) =>
                set(
                  "requiredSkills",
                  value.requiredSkills.filter((x) => x !== t)
                )
              }
            />
            <TagInput
              label="Preferred skills"
              placeholder="Type a skill and press Enter"
              values={value.preferredSkills}
              onAdd={(t) =>
                set(
                  "preferredSkills",
                  Array.from(new Set([...value.preferredSkills, t]))
                )
              }
              onRemove={(t) =>
                set(
                  "preferredSkills",
                  value.preferredSkills.filter((x) => x !== t)
                )
              }
            />
          </section>

          <Separator />

          <section className="space-y-4">
            <TagInput
              label="Job titles"
              placeholder="e.g. Frontend Engineer, Product Manager"
              values={value.titles}
              onAdd={(t) => set("titles", Array.from(new Set([...value.titles, t])))}
              onRemove={(t) => set("titles", value.titles.filter((x) => x !== t))}
            />
            <TagInput
              label="Industries"
              placeholder="e.g. SaaS, Finance, Healthcare"
              values={value.industries}
              onAdd={(t) =>
                set("industries", Array.from(new Set([...value.industries, t])))
              }
              onRemove={(t) =>
                set("industries", value.industries.filter((x) => x !== t))
              }
            />
            <TagInput
              label="Locations"
              placeholder="City, Region, Remote"
              values={value.locations}
              onAdd={(t) =>
                set("locations", Array.from(new Set([...value.locations, t])))
              }
              onRemove={(t) =>
                set("locations", value.locations.filter((x) => x !== t))
              }
            />
          </section>

          <Separator />

          <section className="grid grid-cols-2 gap-4 items-center">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Min years</Label>
              <Input
                type="number"
                min={0}
                max={50}
                value={value.minYears}
                onChange={(e) => set("minYears", Number(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Max years</Label>
              <Input
                type="number"
                min={0}
                max={50}
                value={value.maxYears}
                onChange={(e) => set("maxYears", Number(e.target.value) || 0)}
              />
            </div>
            <div className="col-span-2 flex items-center justify-between rounded-md border p-3">
              <div className="space-y-0.5">
                <Label>Open to work only</Label>
                <p className="text-xs text-muted-foreground">Show candidates marked as open</p>
              </div>
              <Switch
                checked={value.openToWorkOnly}
                onCheckedChange={(v) => set("openToWorkOnly", v)}
                aria-label="Filter open to work"
              />
            </div>
          </section>
        </TabsContent>

        <TabsContent value="companies" className="space-y-4">
          <p className="text-sm text-muted-foreground">Target candidates currently at these companies.</p>
          <TagInput
            label="Target companies"
            placeholder="e.g. Google, Stripe, OpenAI"
            values={value.companies}
            onAdd={(t) => set("companies", Array.from(new Set([...(value.companies || []), t])))}
            onRemove={(t) => set("companies", (value.companies || []).filter((x) => x !== t))}
          />
        </TabsContent>
      </Tabs>

      <div className="flex gap-3 pt-2">
        <Button onClick={onSearch} className="flex-1" variant="hero">Search</Button>
        <Button onClick={onReset} variant="outline">Reset</Button>
      </div>
    </aside>
  );
};
