type TaxonomyDisplayCopy = {
  verdict: string;
  why: string;
  suggestion: string;
};

const fallbackTaxonomyDisplayLanguage: TaxonomyDisplayCopy = {
  verdict: "Needs More Review",
  why: "VidCluster has found movement here, but this cluster has not been clearly explained yet.",
  suggestion: "Use the evidence and risk sections before making a content decision.",
};

export const taxonomyDisplayLanguage: Record<string, TaxonomyDisplayCopy> = {
  "Clean Opportunity": {
    verdict: "Worth Exploring For New Videos",
    why: "People are already watching videos like this from different creators.",
    suggestion: "This may be a good area to test new video ideas.",
  },
  "Audience Environment": {
    verdict: "People Watch This In A Specific Situation",
    why: "People seem to watch this content while doing something else, like working, studying, or focusing.",
    suggestion: "The best content idea may come from the situation, not just the topic.",
  },
  "Creator Territory": {
    verdict: "Already Led By Existing Creators",
    why: "A small number of creators may be driving most of the attention here.",
    suggestion: "Be careful. You may need a different angle to stand out.",
  },
  "Brand Territory": {
    verdict: "Mostly Driven By One Brand",
    why: "Most of the attention seems connected to one brand or company.",
    suggestion: "This may not be a broad creator opportunity yet.",
  },
  "Coherence Trap": {
    verdict: "Looks Related, But Be Careful",
    why: "The videos look connected on the surface, but the audience may want different things.",
    suggestion: "Do more checking before treating this as a content opportunity.",
  },
};

export function getTaxonomyDisplayLanguage(clusterType: string): TaxonomyDisplayCopy {
  return taxonomyDisplayLanguage[clusterType] ?? fallbackTaxonomyDisplayLanguage;
}
