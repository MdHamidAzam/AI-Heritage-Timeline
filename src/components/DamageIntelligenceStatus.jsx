import React from 'react';
import { ExternalLink } from 'lucide-react';
import datasetManifest from '../../ml/datasets/manifest.json';
import damageTaxonomy from '../../ml/taxonomy/damage-taxonomy.json';
import darbhangaIngestion from '../../ml/validation/reports/darbhanga-fort-ingestion.json';

const emptyDamageInference = ({ image = null, monumentId = null } = {}) => ({
  image,
  monumentId,
  modelId: null,
  modelVersion: null,
  predictedDamageType: null,
  predictedComponent: null,
  predictedSeverity: null,
  predictionConfidence: null,
  predictionStatus: 'MODEL NOT DEPLOYED',
  humanVerificationStatus: null,
  boundingBox: null,
  segmentationMask: null,
  spatialCoordinates: null,
  predictionId: null
});

const valueOrUnavailable = (value) => value == null || value === '' ? 'Not currently available' : value;
const sourceBackedSeverity = (record) => record?.severity === 'not-assigned' ? 'Not assigned' : valueOrUnavailable(record?.severity);

function PredictionValue({ label, value }) {
  return <div className="damage-prediction-value"><span>{label}</span><b>{valueOrUnavailable(value)}</b></div>;
}

function ModelStatusCard({ model }) {
  const fields = [
    ['Model ID', model?.modelId || model?.modelName],
    ['Version', model?.version],
    ['Dataset', model?.trainingDataset],
    ['Task', model?.task],
    ['Status', model?.status || 'MODEL NOT DEPLOYED'],
    ['Metrics', model?.metrics],
    ['License', model?.modelLicence]
  ];
  return <article className="damage-model-card"><div className="damage-model-card-heading"><div><p className="eyebrow">MODEL STATUS</p><h3>{model?.status || 'MODEL NOT DEPLOYED'}</h3></div><span className="data-badge">MODEL REGISTRY</span></div><dl>{fields.map(([label, value]) => <React.Fragment key={label}><dt>{label}</dt><dd>{typeof value === 'object' ? JSON.stringify(value) : valueOrUnavailable(value)}</dd></React.Fragment>)}</dl><p className="damage-model-note">No trained heritage damage model is deployed. Prediction fields remain empty until a verified inference adapter supplies them.</p></article>;
}

function DatasetReadinessCard() {
  const dataset = datasetManifest.datasets.find((entry) => entry.datasetId === 'darbhanga-fort');
  const mappings = damageTaxonomy.mappings.filter((mapping) => mapping.datasetId === 'darbhanga-fort');
  const ingestion = darbhangaIngestion.ingestion || {};
  const filesAvailable = ingestion.totalImageFilesFound > 0 && ingestion.totalAnnotationFilesFound > 0;
  return <article className="damage-dataset-card"><div className="damage-model-card-heading"><div><p className="eyebrow">DARBHANGA FORT ML DATASET</p><h3>Dataset readiness</h3></div><span className="data-badge">{filesAvailable ? 'FILES AVAILABLE' : 'REGISTERED ONLY'}</span></div><dl><dt>Dataset</dt><dd>{dataset?.name || 'Not currently available'}</dd><dt>License</dt><dd>{dataset?.license || 'Not currently available'}{dataset?.licenseUrl && <> · <a href={dataset.licenseUrl} target="_blank" rel="noopener noreferrer">License</a></>}</dd><dt>Source</dt><dd>{dataset?.sourceUrl ? <a href={dataset.sourceUrl} target="_blank" rel="noopener noreferrer">{dataset.publisher || dataset.sourceUrl} <ExternalLink size={12}/></a> : 'Not currently available'}</dd><dt>Images found</dt><dd>{ingestion.totalImageFilesFound ?? 0}</dd><dt>Annotations found</dt><dd>{ingestion.totalAnnotationFilesFound ?? 0}</dd><dt>Matched pairs</dt><dd>{ingestion.matchedImageAnnotationPairs ?? 0}</dd><dt>Available splits</dt><dd>{ingestion.availableSplits?.length ? ingestion.availableSplits.join(', ') : 'None declared'}</dd><dt>Registered image count</dt><dd>{dataset?.imageCount ?? 'Not currently available'}</dd><dt>Source classes</dt><dd>{dataset?.classes?.join(', ') || 'Not currently available'}</dd><dt>Validation status</dt><dd>{darbhangaIngestion.checkStatus || 'Not currently available'}</dd><dt>Training readiness</dt><dd>{darbhangaIngestion.trainingReadiness || 'Not currently available'}</dd></dl><div className="damage-taxonomy-mappings"><p className="eyebrow">EXPLICIT TAXONOMY MAPPING</p>{mappings.map((mapping) => <span key={`${mapping.datasetId}-${mapping.sourceLabel}`}>{mapping.sourceLabel} → {mapping.normalizedLabel}</span>)}</div><p className="damage-model-note">{darbhangaIngestion.checkStatus || 'DATASET REGISTERED — SOURCE FILES NOT LOCALLY AVAILABLE'}. Source files are preserved separately from prepared output; no model training has run.</p></article>;
}

function ImageAnalysisWorkspace({ image, prediction }) {
  const hasBox = Array.isArray(prediction?.boundingBox) && prediction.boundingBox.length === 4;
  return <article className="damage-image-workspace"><div className="damage-image-heading"><div><p className="eyebrow">IMAGE ANALYSIS WORKSPACE</p><h3>Prediction output surface</h3></div><span className="status-badge">{prediction?.predictionStatus || 'MODEL NOT DEPLOYED'}</span></div><div className="damage-analysis-image">{image ? <img src={image} alt="Heritage damage analysis input"/> : <div className="damage-no-image">NO INPUT IMAGE PROVIDED</div>}{hasBox && <span className="damage-real-box" style={{ left: `${prediction.boundingBox[0]}%`, top: `${prediction.boundingBox[1]}%`, width: `${prediction.boundingBox[2]}%`, height: `${prediction.boundingBox[3]}%` }}/>} {!hasBox && <span className="damage-analysis-overlay">NO MODEL BOUNDING BOX</span>}</div><div className="damage-analysis-fields"><PredictionValue label="Damage class" value={prediction?.predictedDamageType}/><PredictionValue label="Component" value={prediction?.predictedComponent}/><PredictionValue label="Confidence" value={prediction?.predictionConfidence}/><PredictionValue label="Human verification" value={prediction?.humanVerificationStatus}/></div><p className="damage-analysis-note">Image-level damage location unavailable. No damage marker is drawn without image-level or spatial coordinates. Bounding boxes, segmentation masks, and spatial coordinates are rendered only when supplied by a real model prediction.</p></article>;
}

export default function DamageIntelligenceStatus({ damage = [], selected, model, image = '/assets/hero.png', monumentId, inference = null }) {
  const documented = selected || damage[0] || null;
  const prediction = inference ? { ...emptyDamageInference({ image, monumentId }), ...inference } : emptyDamageInference({ image, monumentId });
  const sourceIds = documented?.evidence_ids?.length ? documented.evidence_ids.join(', ') : 'Evidence relationship not explicitly recorded';
  return <section className="damage-intelligence-status">
    <div className="damage-status-heading"><div><p className="eyebrow">DAMAGE INTELLIGENCE</p><h2>Documented record and model output remain separate.</h2><p>Source-backed damage records are shown independently from future computer-vision predictions.</p></div><span className="ai-badge">MODEL NOT DEPLOYED</span></div>
    <div className="damage-layer-grid"><article className="damage-documented-layer"><p className="eyebrow">DOCUMENTED DAMAGE</p><h3>{documented?.damage_type || 'No documented record selected'}</h3><p>Source-backed historical or inspection record.</p><dl><dt>Record ID</dt><dd>{documented?.damage_id || documented?.id || 'Not currently available'}</dd><dt>Component</dt><dd>{valueOrUnavailable(documented?.component)}</dd><dt>Severity</dt><dd>{sourceBackedSeverity(documented)}</dd><dt>Verification</dt><dd>{valueOrUnavailable(documented?.verification)}</dd><dt>Evidence</dt><dd>{sourceIds}</dd></dl></article><article className="damage-ai-layer"><p className="eyebrow">AI DAMAGE DETECTION</p><h3>{prediction.predictionStatus}</h3><p>Model predictions only. No prediction object is currently available.</p><PredictionValue label="Prediction ID" value={prediction.predictionId}/><PredictionValue label="Predicted damage type" value={prediction.predictedDamageType}/><PredictionValue label="Predicted component" value={prediction.predictedComponent}/><PredictionValue label="Predicted severity" value={prediction.predictedSeverity}/><PredictionValue label="Confidence" value={prediction.predictionConfidence}/></article><article className="damage-human-layer"><p className="eyebrow">HUMAN VERIFICATION</p><h3>{valueOrUnavailable(prediction.humanVerificationStatus)}</h3><p>Human review is required before any model output can be linked to a documented record.</p><p className="damage-verification-note">No model prediction is available for verification.</p></article></div>
    <ModelStatusCard model={model}/>
    <DatasetReadinessCard/>
    <ImageAnalysisWorkspace image={prediction.image} prediction={prediction}/>
    <div className="damage-pipeline"><span>IMAGE</span><i>→</i><span>AI MODEL</span><i>→</i><span>PREDICTION</span><i>→</i><span>CONFIDENCE</span><i>→</i><span>HUMAN VERIFICATION</span><i>→</i><span>EVIDENCE / RECORD</span></div>
    <div className="damage-limitations"><p>MODEL NOT DEPLOYED</p><p>Confidence not currently available</p><p>Bounding box not currently available</p><p>Spatial coordinates not currently available</p><p>Simulation is not active</p></div>
  </section>;
}
