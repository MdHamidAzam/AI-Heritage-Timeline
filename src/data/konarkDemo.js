import monumentRecord from '../../data/konark/monument.json';
import timelineRecords from '../../data/konark/timeline.json';
import damageRecords from '../../data/konark/damage-events.json';
import restrictedZoneRecord from '../../data/konark/restricted-zones.json';
import componentRecords from '../../data/konark/components.json';
import conditionRecords from '../../data/konark/condition.json';
import reconstructionRecord from '../../data/konark/reconstruction.json';
import evidenceRecords from '../../data/konark/evidence.json';
import mediaRecords from '../../data/konark/media-assets.json';
import threeDAssets from '../../data/konark/3d-assets.json';
import threeDModelRegistry from '../../data/konark/3d-model-registry.json';
import currentConditionRecord from '../../data/processed/konark-current-condition-2026.json';
import threeDAssessment from '../../data/processed/konark-3d-asset-assessment.json';
import confidenceFramework from '../../data/processed/konark-confidence-framework.json';
import annotationSchema from '../../data/annotated/annotation-schema.json';
import damageTaxonomy from '../../data/processed/konark-damage-taxonomy.json';

const sourceDetails = (source) => source ? {
  organization: source.organization ?? null,
  title: source.title ?? source.document ?? null,
  url: source.url ?? null
} : null;

const monument = {
  monument_id: monumentRecord.id,
  id: monumentRecord.id,
  name: monumentRecord.alternateNames?.[1] ?? monumentRecord.name,
  official_name: monumentRecord.name,
  state: monumentRecord.location?.state ?? null,
  district: monumentRecord.location?.district ?? null,
  location: [monumentRecord.location?.district, monumentRecord.location?.state]
    .filter(Boolean)
    .join(', ') || null,
  latitude: monumentRecord.unesco?.coordinates?.latitude ?? null,
  longitude: monumentRecord.unesco?.coordinates?.longitude ?? null,
  heritage_type: monumentRecord.unesco?.status ?? null,
  construction_period: monumentRecord.historicalPeriod?.century ?? null,
  description: monumentRecord.architecturalConcept?.representation ?? null,
  image: null,
  verification: monumentRecord.currentDataStatus?.latestOfficialUNESCOPropertyRecord ?? null,
  source: monumentRecord.sources?.map(sourceDetails) ?? []
};

const timeline = timelineRecords.map((event) => ({
  timeline_id: event.id,
  id: event.id,
  year: event.date ?? null,
  date: event.date ?? null,
  event_type: event.eventType ?? null,
  historical_event: event.title ?? null,
  description: event.description ?? null,
  verification: event.verification ?? null,
  component: event.component ?? null,
  location: event.location ?? null,
  source: sourceDetails(event.source),
  evidence_ids: [],
  evidence_relationship: 'not_explicitly_recorded',
  image_url: null
}));

const damage = damageRecords.map((event) => ({
  ...(() => {
    const taxonomy = damageTaxonomy.taxonomy?.find((item) => item.id === event.type);
    return { source_label: event.type ?? null, normalized_label: taxonomy?.id ?? null };
  })(),
  damage_id: event.id,
  id: event.id,
  date: event.date ?? null,
  damage_type: event.type ?? null,
  type: event.type ?? null,
  component: event.component ?? null,
  location: event.location ?? null,
  severity: event.severity ?? null,
  confidence: null,
  description: event.description ?? null,
  status: event.status ?? null,
  weight_approx_tons: event.weightApproxTons ?? null,
  verification: event.verification ?? null,
  evidence_ids: [],
  evidence_relationship: 'not_explicitly_recorded',
  source: sourceDetails(event.source),
  image_id: null,
  predictionId: null,
  modelId: null,
  modelVersion: null,
  predictedDamageType: null,
  predictedComponent: null,
  predictedSeverity: null,
  predictionConfidence: null,
  predictionStatus: null,
  humanVerificationStatus: null,
  boundingBox: null,
  segmentationMask: null,
  spatialCoordinates: null
}));

const damageInference = {
  modelId: null,
  modelName: null,
  version: null,
  task: null,
  classes: damageTaxonomy.aiDetectionMapping ? Object.keys(damageTaxonomy.aiDetectionMapping) : [],
  trainingDataset: null,
  datasetLicence: null,
  modelLicence: null,
  metrics: null,
  status: 'NO DAMAGE DETECTION MODEL DEPLOYED',
  source: null,
  notes: 'Inference boundary reserved for a future Python or service adapter. No predictions are available.'
};

const restrictedZones = (restrictedZoneRecord.zones ?? []).map((zone) => ({
  restricted_area_id: zone.id,
  id: zone.id,
  name: zone.zoneType ? `${zone.zoneType[0].toUpperCase()}${zone.zoneType.slice(1)} zone` : null,
  zone_type: zone.zoneType ?? null,
  location: null,
  reason: zone.purpose ?? null,
  status: zone.developmentStatus ?? null,
  distance_meters: zone.distanceFromProtectedPropertyBoundaryMeters ?? null,
  geometry: zone.geometry ?? null,
  geometry_status: zone.geometryStatus ?? null,
  verified_date: null,
  verification: zone.verification ?? null,
  source: zone.source?.organization ?? null,
  source_url: zone.source?.url ?? null,
  demo_flag: false
}));

const architecturalComponents = componentRecords.map((component) => ({
  component_id: component.id,
  id: component.id,
  name: component.name ?? null,
  type: component.type ?? null,
  role: component.role ?? null,
  quantity: component.quantity ?? null,
  historical_condition: component.historicalCondition ?? null,
  verification: component.verification ?? null,
  source: sourceDetails(component.source),
  geometry_reference: null,
  timeline_links: [],
  damage_links: [],
  evidence_links: []
}));

const currentCondition = {
  ...currentConditionRecord,
  conditions: conditionRecords,
  overall_status: currentConditionRecord.conditionAssessment?.overallStatus ?? null,
  assessment_basis: currentConditionRecord.conditionAssessment?.assessmentBasis ?? null,
  latest_detailed_assessment_year: currentConditionRecord.conditionAssessment?.monumentSpecificLatestDetailedAssessmentYear ?? null,
  latest_national_statement_year: currentConditionRecord.conditionAssessment?.latestNationalASIConditionStatementYear ?? null,
  standardized_severity_score: currentConditionRecord.conditionAssessment?.standardizedSeverityScore ?? null,
  source_gaps: currentConditionRecord.interpretationLimits ?? null
};

const reconstructions = (reconstructionRecord.reconstructions ?? []).map((item) => ({
  reconstruction_id: item.id,
  id: item.id,
  component: item.component ?? null,
  subject: item.subject ?? null,
  historical_fact: item.historicalFact ?? null,
  evidence_strength: item.evidenceLevel ?? null,
  inference_strength: item.inferenceLevel ?? null,
  confidence: item.confidence ?? null,
  validation_status: item.status ?? null,
  description: item.subject ?? null,
  image_url: null,
  evidence_count: item.historicalBasis?.length ?? 0,
  evidence: item.historicalBasis ?? [],
  evidence_ids: [],
  evidence_relationship: 'not_explicitly_recorded',
  human_verification_required: reconstructionRecord.reconstructionPolicy?.humanVerificationRequired ?? null,
  label: item.label ?? null
}));

const evidence = evidenceRecords.map((item) => ({
  evidence_id: item.id,
  id: item.id,
  source_type: item.sourceType ?? null,
  source_date: item.year ?? null,
  source_name: item.title ?? null,
  organization: item.organization ?? null,
  description: item.supports?.join('; ') ?? null,
  supports: item.supports ?? [],
  reliability: item.verification ?? null,
  verification: item.verification ?? null,
  source_url: item.url ?? null,
  note: item.note ?? null
}));

const media = mediaRecords.map((item) => ({
  media_id: item.id,
  id: item.id,
  asset_type: item.assetType ?? null,
  filename: null,
  title: item.title ?? null,
  source: item.source ?? item.organization ?? null,
  source_url: item.url ?? null,
  author: item.author ?? null,
  date: item.date ?? null,
  license: item.license ?? null,
  attribution_required: item.attributionRequired ?? null,
  verification: item.verification ?? null,
  usage_status: item.usageStatus ?? null,
  local_path: null,
  availability: 'metadata_only',
  public_redistribution_allowed: item.publicRedistributionAllowed ?? null
}));

const threeD = {
  status: threeDAssessment.authoritativeAssetStatus?.available ? 'available' : 'unavailable',
  authoritativeAsset: {
    available: threeDAssessment.authoritativeAssetStatus?.available ?? false,
    status: threeDAssessment.authoritativeAssetStatus?.status ?? null,
    verified_downloadable_model: threeDAssessment.authoritativeAssetStatus?.verifiedDownloadableModel ?? false,
    geometry: null
  },
  assets: threeDAssets,
  models: threeDModelRegistry.models ?? [],
  provenance_required: threeDAssessment.qualityChecks?.geometryProvenanceRequired ?? null,
  historical_ground_truth_allowed: false
};

export const showcase3D = (threeDModelRegistry.models ?? []).reduce((groups, model) => {
  const monumentId = model.monumentId ?? monumentRecord.id;
  groups[monumentId] = groups[monumentId] ?? [];
  groups[monumentId].push(model);
  return groups;
}, {});

const metadata = {
  monument_id: monumentRecord.id,
  data_cutoff: monumentRecord.currentDataStatus?.dataCutoff ?? null,
  source_status: monumentRecord.currentDataStatus ?? null,
  reconstruction_policy: reconstructionRecord.reconstructionPolicy ?? null,
  confidence_policy: confidenceFramework.confidencePolicy ?? null,
  verification_levels: confidenceFramework.verificationLevels ?? null,
  annotation_policy: annotationSchema.annotationPolicy ?? null,
  source_files: {
    monument: 'data/konark/monument.json',
    timeline: 'data/konark/timeline.json',
    damage: 'data/konark/damage-events.json',
    restricted_zones: 'data/konark/restricted-zones.json',
    components: 'data/konark/components.json',
    condition: 'data/konark/condition.json',
    current_condition: 'data/processed/konark-current-condition-2026.json',
    reconstruction: 'data/konark/reconstruction.json',
    evidence: 'data/konark/evidence.json',
    three_d: 'data/processed/konark-3d-asset-assessment.json'
  }
};

export const konarkDemo = {
  monument,
  timeline,
  currentCondition,
  damage,
  restrictedZones,
  architecturalComponents,
  reconstructions,
  evidence,
  media,
  threeD,
  showcase3D,
  damageInference,
  metadata
};

export default konarkDemo;
