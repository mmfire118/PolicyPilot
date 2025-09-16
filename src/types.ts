export type Intake = {
  age?: number;
  household?: number;
  income_range?: "<50k" | "50–100k" | "100–200k" | ">200k";
  employment?: "W2" | "self-employed" | "contractor" | "student" | "unemployed";
  assets?: ("car"|"home"|"renting"|"valuable_electronics"|"pets"|"bike")[];
  state_or_country?: string;
  risk_preference?: "frugal" | "balanced" | "safety-first";
  existing_policies?: string[];
  notes?: string;
};

export type Output = {
  humanSummary: string;
  json: {
    overlap: { title: string; reason: string; what_to_verify: string[] };
    gap: { title: string; reason: string; suggested_next_step: string };
    priority_review: { coverage: string; why: string }[];
    assumptions: string[];
    not_validated: string[];
    disclaimer: string;
  };
};

export type AuthMode = 'signin' | 'signup';

export type AppState = 'landing' | 'intake' | 'results';