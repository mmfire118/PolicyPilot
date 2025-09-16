import { Intake, Output } from '../types';

const SYSTEM_PROMPT = `You are PolicyPilot, a minimal insurance guidance assistant.

Objective:
From a small user input, output:
1) one overlap to consider dropping, 2) one critical gap to address,
3) a ranked priority review list (3 items), 4) a brief money/risk snapshot and next steps,
5) a plain-language disclaimer. Return both a concise human summary and a JSON object.

Guardrails:
- Educational only; no legal/financial advice. Use "consider / may / could".
- Do not invent policy specifics not provided. No chain-of-thought. Privacy-respectful tone.

Input: JSON with fields: age, household, income_range, employment, assets[], state_or_country, risk_preference, existing_policies[], notes.

Output (both):
A) Human summary with these headings:
Overview
Potential Overlap to Consider Dropping
Critical Gap to Address
Priority Review List (ranked)
Money/Risk Snapshot (very brief)
Next Steps
Plain-Language Disclaimer

B) JSON object:
{
  "overlap": {"title": "...", "reason": "...", "what_to_verify": ["..."]},
  "gap": {"title": "...", "reason": "...", "suggested_next_step": "..."},
  "priority_review": [
    {"coverage":"...", "why":"..."},
    {"coverage":"...", "why":"..."},
    {"coverage":"...", "why":"..."}
  ],
  "assumptions": ["..."],
  "not_validated": ["automation_accuracy","integrations","pricing","compliance"],
  "disclaimer": "..."
}

Decision Heuristics:
Overlaps (pick one likely from inputs):
- Credit-card rental car coverage overlapping with auto policy's rental add-on.
- Credit-card phone coverage overlapping with separate device/phone plan.
- Premium credit-card travel benefits overlapping with separate travel insurance.
- Homeowners/renters property vs. separate gadget plan.

Gaps (pick one highest-impact):
- Renters/Home missing when user rents/owns.
- Inadequate auto liability when only state-minimum listed.
- Disability income missing when user depends on paycheck.
- Term life missing with dependents or significant debt.
- Umbrella for high assets/income.

Priority ordering:
High-severity liability/dwelling/income first, then moderate-probability property, then low-yield add-ons.

Tone: calm, practical, brief.`;

export const analyzeWithLLM = async (intake: Intake): Promise<Output> => {
  const LLM_API_URL = import.meta.env.VITE_LLM_API_URL || '/api/analyze';

  try {
    const response = await fetch(LLM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemPrompt: SYSTEM_PROMPT,
        userJson: intake
      }),
    });

    if (response.ok) {
      const result = await response.json();
      return result;
    }
  } catch (error) {
    console.warn('LLM API failed, falling back to rules engine:', error);
  }

  // Fallback to rules engine
  return analyzeWithRulesEngine(intake);
};

export const analyzeWithRulesEngine = (intake: Intake): Output => {
  const overlap = detectOverlap(intake);
  const gap = detectGap(intake);
  const priorityReview = generatePriorityList(intake, gap);
  
  const assumptions = [
    "Analysis based on general patterns",
    "Specific policy details not examined",
    "Regional regulations may vary",
    "Professional review recommended"
  ];

  const humanSummary = generateHumanSummary(overlap, gap, priorityReview, intake);
  
  return {
    humanSummary,
    json: {
      overlap,
      gap,
      priority_review: priorityReview,
      assumptions,
      not_validated: ["automation_accuracy", "integrations", "pricing", "compliance"],
      disclaimer: "This is general education, not financial or legal advice. Confirm with a licensed professional in your region."
    }
  };
};

const detectOverlap = (intake: Intake) => {
  const policies = intake.existing_policies || [];
  const policyText = policies.join(' ').toLowerCase();

  // Rental car overlap
  if (policyText.includes('credit-card') && policyText.includes('rental') && policyText.includes('auto')) {
    return {
      title: "Rental Car Coverage Overlap",
      reason: "You may have rental car coverage through both your credit card and auto insurance policy.",
      what_to_verify: [
        "Whether credit card coverage is primary or secondary",
        "Coverage limits and exclusions on each",
        "Which provides better value for your needs"
      ]
    };
  }

  // Phone coverage overlap
  if (policyText.includes('credit-card') && policyText.includes('phone') && policyText.includes('device')) {
    return {
      title: "Phone Coverage Overlap",
      reason: "Credit card phone protection may duplicate your device insurance plan.",
      what_to_verify: [
        "Deductible amounts for each coverage",
        "Coverage limits and claim processes",
        "Whether one plan offers superior protection"
      ]
    };
  }

  // Travel insurance overlap
  if (policyText.includes('credit-card') && policyText.includes('travel') && policyText.includes('travel insurance')) {
    return {
      title: "Travel Coverage Overlap",
      reason: "Premium credit card travel benefits may overlap with separate travel insurance.",
      what_to_verify: [
        "Medical evacuation coverage limits",
        "Trip cancellation reasons covered",
        "Coverage for pre-existing conditions"
      ]
    };
  }

  // Property vs gadget overlap
  if ((intake.assets?.includes('home') || intake.assets?.includes('renting')) && 
      (policyText.includes('renters') || policyText.includes('homeowners')) && 
      policyText.includes('device')) {
    return {
      title: "Property vs. Device Coverage Overlap",
      reason: "Your homeowners/renters policy may already cover electronics that have separate device plans.",
      what_to_verify: [
        "Personal property limits in home/renters policy",
        "Special limits for electronics",
        "Deductible differences between policies"
      ]
    };
  }

  return {
    title: "No Obvious Overlap Found",
    reason: "Based on your current policies, we don't see clear overlapping coverage.",
    what_to_verify: [
      "Review policy documents for hidden duplications",
      "Check if credit cards provide any insurance benefits",
      "Consider whether employer benefits overlap personal coverage"
    ]
  };
};

const detectGap = (intake: Intake) => {
  const policies = intake.existing_policies || [];
  const policyText = policies.join(' ').toLowerCase();

  // Missing renters insurance
  if (intake.assets?.includes('renting') && !policyText.includes('renters')) {
    return {
      title: "Missing Renters Insurance",
      reason: "You're renting but don't appear to have renters insurance to protect your belongings and liability.",
      suggested_next_step: "Get quotes for renters insurance - it's typically very affordable ($15-30/month) but provides essential protection."
    };
  }

  // Missing homeowners insurance
  if (intake.assets?.includes('home') && !policyText.includes('homeowners')) {
    return {
      title: "Missing Homeowners Insurance",
      reason: "You own a home but don't appear to have homeowners insurance listed.",
      suggested_next_step: "Verify you have adequate homeowners coverage - this is typically required by mortgage lenders and essential for protection."
    };
  }

  // Insufficient auto liability
  if (policyText.includes('auto') && policyText.includes('state-min')) {
    return {
      title: "Insufficient Auto Liability Limits",
      reason: "State minimum liability coverage may not provide adequate protection for your assets and income level.",
      suggested_next_step: "Consider increasing liability limits to at least 100/300/50 or higher based on your net worth."
    };
  }

  // Missing disability insurance
  if (intake.employment && !['unemployed', 'student'].includes(intake.employment) && !policyText.includes('disability')) {
    return {
      title: "Missing Disability Income Insurance",
      reason: "You depend on income from work but don't have disability insurance to protect if you can't work due to illness or injury.",
      suggested_next_step: "Research disability insurance options through your employer or individual policies - this protects your most valuable asset: your earning ability."
    };
  }

  // Missing life insurance
  if ((intake.household || 0) > 1 && !policyText.includes('life')) {
    return {
      title: "Missing Term Life Insurance",
      reason: "With dependents in your household, life insurance could provide important financial protection for your family.",
      suggested_next_step: "Consider term life insurance equal to 10-12x your annual income to replace lost earnings and cover major expenses."
    };
  }

  return {
    title: "No Critical Gap Detected",
    reason: "Your current coverage appears to address the major risk categories, though limits and deductibles should be reviewed.",
    suggested_next_step: "Focus on reviewing coverage limits and deductibles to ensure they align with your current financial situation."
  };
};

const generatePriorityList = (intake: Intake, gap: any) => {
  const priorities = [];
  const policies = intake.existing_policies || [];
  const policyText = policies.join(' ').toLowerCase();

  // Add the gap if it's actionable
  if (!gap.title.includes('No Critical Gap')) {
    priorities.push({
      coverage: gap.title,
      why: "Addresses the most significant protection gap in your current coverage"
    });
  }

  // Auto liability (if has car)
  if (intake.assets?.includes('car')) {
    priorities.push({
      coverage: "Auto Liability Limits",
      why: "Ensure adequate protection against lawsuits from accidents - consider 250/500/100 or higher"
    });
  }

  // Property coverage
  if (intake.assets?.includes('renting')) {
    priorities.push({
      coverage: "Renters Personal Property & Liability",
      why: "Protects belongings and provides liability coverage for accidents in your rental"
    });
  } else if (intake.assets?.includes('home')) {
    priorities.push({
      coverage: "Home Dwelling & Liability Coverage",
      why: "Ensure rebuilding costs are covered and liability limits protect your assets"
    });
  }

  // Disability insurance
  if (intake.employment && !['unemployed', 'student'].includes(intake.employment) && !policyText.includes('disability')) {
    priorities.push({
      coverage: "Disability Income Protection",
      why: "Protects your ability to earn income if you become unable to work due to illness or injury"
    });
  }

  // Umbrella liability for higher income/assets
  if ((intake.income_range && ['100–200k', '>200k'].includes(intake.income_range)) || 
      (intake.assets?.includes('home') && intake.assets?.includes('car'))) {
    priorities.push({
      coverage: "Umbrella Liability Policy",
      why: "Additional liability protection beyond auto/home policies for higher-net-worth individuals"
    });
  }

  // Health savings or emergency fund
  priorities.push({
    coverage: "Health Insurance Deductible Coverage",
    why: "Ensure you can afford your health insurance deductible and out-of-pocket maximums"
  });

  // Return top 3, removing duplicates
  const uniquePriorities = priorities.filter((item, index, self) => 
    index === self.findIndex(t => t.coverage === item.coverage)
  );
  
  return uniquePriorities.slice(0, 3);
};

const generateHumanSummary = (overlap: any, gap: any, priorityReview: any[], intake: Intake): string => {
  const age = intake.age || 'Not specified';
  const household = intake.household || 1;
  const income = intake.income_range || 'Not specified';
  
  return `Overview

Based on your profile (age ${age}, household of ${household}, income ${income}), we've identified opportunities to optimize your insurance coverage. Our analysis focuses on eliminating redundant coverage while ensuring adequate protection for your key risks.

Potential Overlap to Consider Dropping

${overlap.title}
${overlap.reason} Review your policy documents to determine which coverage provides better value and consider dropping the redundant option.

Critical Gap to Address

${gap.title}
${gap.reason} This represents a significant vulnerability in your current risk management strategy.

Priority Review List (ranked)

${priorityReview.map((item, i) => `${i + 1}. ${item.coverage}: ${item.why}`).join('\n')}

Money/Risk Snapshot

Your current insurance portfolio shows ${overlap.title.includes('No Obvious') ? 'minimal' : 'some'} overlap opportunities and ${gap.title.includes('No Critical') ? 'good' : 'moderate'} coverage gaps. Addressing the identified gap could significantly improve your risk protection.

Next Steps

• Review and compare the overlapping policies to eliminate redundancy
• Address the critical gap by researching appropriate coverage options  
• Schedule annual insurance reviews to ensure coverage keeps pace with life changes

Plain-Language Disclaimer

This analysis is for educational purposes only and should not be considered financial or legal advice. Insurance needs vary greatly based on individual circumstances, state regulations, and policy specifics. Please consult with a licensed insurance professional in your area to make informed decisions about your coverage.`;
};