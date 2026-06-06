import clusterTaxonomyRows from "../data/cluster_taxonomy_v1.json";

export type ClusterTaxonomy = {
  cluster_id: string;
  taxonomy_version: string;
  cluster_type: string;
  organizing_force: string;
  confidence: string;
  explanation: string;
  review_status: string;
  source: string;
};

const taxonomyRows = Array.isArray(clusterTaxonomyRows) ? (clusterTaxonomyRows as ClusterTaxonomy[]) : [];

const taxonomyByClusterId = new Map(taxonomyRows.map((row) => [row.cluster_id, row]));

export function getClusterTaxonomy(clusterId: string): ClusterTaxonomy | null {
  return taxonomyByClusterId.get(clusterId) ?? null;
}
