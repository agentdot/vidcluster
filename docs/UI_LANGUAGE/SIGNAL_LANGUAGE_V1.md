# SIGNAL LANGUAGE V1

## 1. Core Rule

All user-facing dashboard language must be simple enough for a typical 10-year-old to understand.

Avoid internal product language, audit language, taxonomy language, data science language, and engineering language.

The dashboard should answer:

- Is this worth my attention?
- Can I make content here?
- Why are people watching this?
- What should I be careful about?
- How much should I trust this signal?

## 2. Words We Avoid On The Dashboard

- Taxonomy
- Cluster Type
- Interpretation Layer
- Organizing Force
- Coherence
- Semantic Label
- Confidence
- Creator Territory
- Brand Territory
- Audience Environment
- Coherence Trap
- OSv3
- Scoring Model
- Embeddings
- Layer 1
- Layer 2
- Layer 3

## 3. Plain English Replacements

| Internal Term | Dashboard Term | Meaning |
|---|---|---|
| Clean Opportunity | Worth Exploring For New Videos | This area may be useful for new video ideas. |
| Audience Environment | People Watch This In A Specific Situation | People watch this because of when or how they use it. |
| Creator Territory | Already Led By Existing Creators | A few creators may already own most attention here. |
| Brand Territory | Mostly Driven By One Brand | Most attention is connected to one company or brand. |
| Coherence Trap | Looks Related, But Be Careful | Videos look similar, but viewers may want different things. |
| Review Confidence | How Much We Trust This Signal | How reliable the human review feels. |
| Organizing Force | What Brings These Videos Together | The simple reason these videos are grouped. |
| Cluster Interpretation | How To Read This Cluster | A plain-English explanation of what this cluster means. |

## 4. Verdict States

| Verdict | Meaning | When To Use |
|---|---|---|
| Worth Exploring For New Videos | This may be a useful place to test new content ideas. | Multiple creators or videos suggest real viewer interest. |
| Watch Carefully | Something is happening, but it is not clear enough yet. | The signal is early, weak, or still changing. |
| Mostly Driven By One Brand | Most attention is linked to one company or brand. | The cluster is more brand-led than creator-led. |
| Already Led By Existing Creators | A few creators may already control most of the attention. | The cluster looks creator-dominated. |
| Looks Related, But Be Careful | The videos look similar, but the audience may not want the same thing. | The cluster may be a mixed or misleading opportunity. |
| Needs More Review | VidCluster has found movement, but no human review has been done yet. | No reviewed taxonomy exists for the cluster. |

## 5. Trust States

Replace all dashboard-facing use of "confidence" with trust language.

| Trust Label | Meaning |
|---|---|
| High Trust | We have strong reasons to believe this reading is useful. |
| Medium Trust | This reading is useful, but still needs more checking. |
| Low Trust | This reading is uncertain and should be treated carefully. |
| Not Reviewed Yet | No human review has been completed yet. |

## 6. Evidence States

| Evidence Label | Meaning |
|---|---|
| Strong Evidence | There is enough signal to take this seriously. |
| Moderate Evidence | There is some signal, but it needs more checking. |
| Weak Evidence | There is not enough signal yet. |

## 7. Trend States

| Trend Label | Meaning |
|---|---|
| Growing | More activity is appearing over time. |
| Stable | Activity is not changing much. |
| Slowing Down | Activity appears to be fading. |
| Limited History | There is not enough past data yet. |

## 8. Risk States

| Risk Label | Meaning |
|---|---|
| Limited History | We need more time before trusting the trend. |
| Crowded Space | Many creators may already be competing here. |
| Brand Dominated | One brand may be driving most of the attention. |
| Mixed Signals | The data points do not clearly agree. |
| Needs Review | A human has not reviewed this yet. |

## 9. UI Rule

No new dashboard-facing label, badge, warning, verdict, trust state, or risk state should be added directly inside React components unless it already exists in this document.

If a new word is needed, add it here first, then use it in the dashboard.

## 10. Out Of Scope

This document does not change:

- OSv3
- scoring
- ranking
- clustering
- Layer 1
- Layer 2
- Layer 3
- opportunity generation
- dashboard calculations

This document only controls user-facing language.
