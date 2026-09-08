import { getDarbhangaRegistration, getDeclaredSplits, inspectDarbhangaFiles } from '../inference/darbhanga-fort-adapter.mjs';

export const EMPTY_METRICS = Object.freeze({
  precision: null,
  recall: null,
  mAP50: null,
  mAP50_95: null,
  confusionMatrix: null
});

export function createModelArtifactMetadata({ modelId = null, modelVersion = null, trainingDate = null, status = 'MODEL NOT DEPLOYED', metrics = EMPTY_METRICS } = {}) {
  const dataset = getDarbhangaRegistration();
  return {
    modelId,
    modelVersion,
    datasetId: dataset.datasetId,
    trainingDate,
    classes: dataset.taxonomyMappings.map((mapping) => mapping.normalizedLabel),
    metrics,
    license: dataset.license,
    source: dataset.sourceUrl,
    status
  };
}

export function getDarbhangaTrainingReadiness() {
  const registration = getDarbhangaRegistration();
  const files = inspectDarbhangaFiles();
  const splits = getDeclaredSplits();
  const mappedSourceLabels = new Set(registration.taxonomyMappings.map((mapping) => mapping.sourceLabel));
  const unmappedClasses = registration.classes.filter((sourceLabel) => !mappedSourceLabels.has(sourceLabel));
  const errors = [];
  if (!files.imagesAvailableLocally) errors.push('Images are missing locally.');
  if (!files.annotationsAvailableLocally) errors.push('Annotations are missing locally.');
  if (!splits.sourceProvided || !splits.train || !splits.validation) errors.push('Source train/validation splits are unavailable; no splits will be invented.');
  if (unmappedClasses.length) errors.push(`Taxonomy mapping incomplete for source classes: ${unmappedClasses.join(', ')}.`);
  return { ready: errors.length === 0, errors, registration, files, splits, unmappedClasses };
}

export function createYoloConfig({ outputDirectory }) {
  const readiness = getDarbhangaTrainingReadiness();
  if (!readiness.ready) throw new Error(`DATASET NOT READY: ${readiness.errors.join(' ')}`);
  const names = [...new Set(readiness.registration.taxonomyMappings.map((mapping) => mapping.normalizedLabel))];
  return {
    path: outputDirectory,
    train: 'images/train',
    val: 'images/val',
    ...(readiness.splits.test ? { test: 'images/test' } : {}),
    names,
    sourceLabelMapping: readiness.registration.taxonomyMappings
  };
}

export function createTrainingExampleContract({ image, sourceLabel, boundingBox, monumentId = null, split = null }) {
  return {
    image,
    class: sourceLabel,
    boundingBox,
    monumentId,
    datasetId: 'darbhanga-fort',
    split
  };
}
