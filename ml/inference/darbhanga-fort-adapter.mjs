import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const inferenceDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(inferenceDirectory, '../..');
const manifest = JSON.parse(fs.readFileSync(path.join(projectRoot, 'ml', 'datasets', 'manifest.json'), 'utf8'));
const taxonomy = JSON.parse(fs.readFileSync(path.join(projectRoot, 'ml', 'taxonomy', 'damage-taxonomy.json'), 'utf8'));

export const DARBHANGA_DATASET_ID = 'darbhanga-fort';

export function getDarbhangaRegistration() {
  const dataset = manifest.datasets.find((entry) => entry.datasetId === DARBHANGA_DATASET_ID);
  if (!dataset) throw new Error(`Dataset registration not found: ${DARBHANGA_DATASET_ID}`);
  return {
    ...dataset,
    taxonomyMappings: taxonomy.mappings.filter((mapping) => mapping.datasetId === DARBHANGA_DATASET_ID),
    normalizedLabels: taxonomy.normalizedLabels
  };
}

export function normalizeDarbhangaLabel(sourceLabel) {
  const mapping = getDarbhangaRegistration().taxonomyMappings.find((entry) => entry.sourceLabel === sourceLabel);
  if (!mapping) throw new Error(`Unknown Darbhanga source label: ${sourceLabel}`);
  return {
    sourceLabel: mapping.sourceLabel,
    normalizedLabel: mapping.normalizedLabel,
    datasetId: mapping.datasetId
  };
}

export function getDeclaredSplits() {
  const dataset = getDarbhangaRegistration();
  const declared = dataset.splits || dataset.split || null;
  return {
    train: declared?.train ?? null,
    validation: declared?.validation ?? null,
    test: declared?.test ?? null,
    sourceProvided: Boolean(declared)
  };
}

export function createTrainingExample({ image, sourceLabel, boundingBox, monumentId, split = null }) {
  if (!image) throw new Error('Training example requires an image reference.');
  if (!sourceLabel) throw new Error('Training example requires the original source label.');
  const normalized = normalizeDarbhangaLabel(sourceLabel);
  return {
    datasetId: DARBHANGA_DATASET_ID,
    monumentId: monumentId ?? null,
    image,
    class: normalized.normalizedLabel,
    sourceLabel: normalized.sourceLabel,
    boundingBox: boundingBox ?? null,
    split
  };
}

function validateBoundingBox(boundingBox, imageWidth, imageHeight) {
  if (!Array.isArray(boundingBox) || boundingBox.length !== 4 || boundingBox.some((value) => typeof value !== 'number' || !Number.isFinite(value))) return 'invalid bounding box';
  const [x, y, width, height] = boundingBox;
  if (x < 0 || y < 0 || width <= 0 || height <= 0) return 'invalid bounding box';
  if (imageWidth != null && imageHeight != null && (x + width > imageWidth || y + height > imageHeight)) return 'out-of-range coordinates';
  return null;
}

export function validateDarbhangaAnnotations(annotations = []) {
  const registration = getDarbhangaRegistration();
  const knownLabels = new Set(registration.classes);
  const errors = [];
  const signatures = new Set();

  for (const [index, annotation] of annotations.entries()) {
    const label = `annotation ${index + 1}`;
    if (!annotation?.image) errors.push(`${label}: missing image`);
    if (!annotation?.sourceLabel) errors.push(`${label}: empty annotation`);
    if (annotation?.sourceLabel && !knownLabels.has(annotation.sourceLabel)) errors.push(`${label}: unknown class: ${annotation.sourceLabel}`);
    if (annotation?.boundingBox != null) {
      const boundingBoxError = validateBoundingBox(annotation.boundingBox, annotation.imageWidth, annotation.imageHeight);
      if (boundingBoxError) errors.push(`${label}: ${boundingBoxError}`);
    }
    const signature = JSON.stringify([annotation?.image ?? null, annotation?.sourceLabel ?? null, annotation?.boundingBox ?? null]);
    if (signatures.has(signature)) errors.push(`${label}: duplicate annotation`);
    signatures.add(signature);
  }

  return { valid: errors.length === 0, annotationCount: annotations.length, errors };
}

function collectFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? collectFiles(fullPath) : [fullPath];
  });
}

const imageExtensions = /\.(jpg|jpeg|png|webp|tif|tiff)$/i;
const annotationExtensions = /\.(json|txt|csv|xml|yaml|yml)$/i;

function fileStem(file) {
  return path.basename(file).replace(/\.[^.]+$/, '').toLowerCase();
}

function sourceSplitDirectories(sourceDirectory) {
  return ['train', 'val', 'test'].map((split) => ({
    split,
    imageDirectory: path.join(sourceDirectory, 'images', split),
    labelDirectory: path.join(sourceDirectory, 'labels', split)
  }));
}

export function inspectDarbhangaIngestion() {
  const registration = getDarbhangaRegistration();
  const datasetDirectory = path.join(projectRoot, registration.localPath);
  const sourceDirectory = path.join(datasetDirectory, 'source');
  const splitReports = sourceSplitDirectories(sourceDirectory).map(({ split, imageDirectory, labelDirectory }) => {
    const images = collectFiles(imageDirectory).filter((file) => imageExtensions.test(file));
    const annotations = collectFiles(labelDirectory).filter((file) => annotationExtensions.test(file));
    const imageStems = new Set(images.map(fileStem));
    const annotationStems = new Set(annotations.map(fileStem));
    return {
      split,
      declared: images.length > 0 || annotations.length > 0,
      imageFiles: images,
      annotationFiles: annotations,
      matchedPairs: images.filter((file) => annotationStems.has(fileStem(file))).length,
      missingAnnotations: images.filter((file) => !annotationStems.has(fileStem(file))).map((file) => path.basename(file)),
      missingImages: annotations.filter((file) => !imageStems.has(fileStem(file))).map((file) => path.basename(file))
    };
  });
  return {
    datasetId: registration.datasetId,
    localPath: registration.localPath,
    sourcePath: path.relative(projectRoot, sourceDirectory).replaceAll('\\', '/'),
    sourceDirectoryExists: fs.existsSync(sourceDirectory),
    splitReports,
    totalImages: splitReports.reduce((total, report) => total + report.imageFiles.length, 0),
    totalAnnotations: splitReports.reduce((total, report) => total + report.annotationFiles.length, 0),
    matchedPairs: splitReports.reduce((total, report) => total + report.matchedPairs, 0),
    missingAnnotations: splitReports.flatMap((report) => report.missingAnnotations.map((file) => `${report.split}/${file}`)),
    missingImages: splitReports.flatMap((report) => report.missingImages.map((file) => `${report.split}/${file}`)),
    availableSplits: splitReports.filter((report) => report.declared).map((report) => report.split),
    sourceFilesAvailable: splitReports.some((report) => report.imageFiles.length > 0),
    annotationFilesAvailable: splitReports.some((report) => report.annotationFiles.length > 0)
  };
}

export function inspectDarbhangaFiles() {
  const registration = getDarbhangaRegistration();
  const localDirectory = path.join(projectRoot, registration.localPath, 'source');
  const files = collectFiles(localDirectory);
  const imageFiles = files.filter((file) => /\.(jpg|jpeg|png|webp|tif|tiff)$/i.test(file));
  const annotationFiles = files.filter((file) => /\.(json|txt|csv|xml|yaml|yml|zip)$/i.test(file) && !file.endsWith('README.md'));
  return {
    localPath: `${registration.localPath}/source`,
    localDirectoryExists: fs.existsSync(localDirectory),
    imageFiles: imageFiles.map((file) => path.relative(projectRoot, file).replaceAll('\\', '/')),
    annotationFiles: annotationFiles.map((file) => path.relative(projectRoot, file).replaceAll('\\', '/')),
    imagesAvailableLocally: imageFiles.length > 0,
    annotationsAvailableLocally: annotationFiles.length > 0
  };
}

export function buildDarbhangaValidationReport() {
  const registration = getDarbhangaRegistration();
  const files = inspectDarbhangaFiles();
  const splits = getDeclaredSplits();
  const ready = files.imagesAvailableLocally && files.annotationsAvailableLocally;
  return {
    reportVersion: '1.0.0',
    datasetId: registration.datasetId,
    datasetName: registration.name,
    sourceUrl: registration.sourceUrl,
    license: registration.license,
    imageCountRegistered: registration.imageCount,
    sourceClasses: registration.classes,
    taxonomyMappings: registration.taxonomyMappings,
    splits,
    localFiles: files,
    annotationValidation: { valid: ready ? null : false, annotationCount: 0, errors: ready ? [] : ['DATASET REGISTERED — SOURCE FILES NOT LOCALLY AVAILABLE'] },
    validationStatus: ready ? 'SOURCE FILES AVAILABLE — ANNOTATION VALIDATION REQUIRED' : 'DATASET REGISTERED — SOURCE FILES NOT LOCALLY AVAILABLE',
    trainingReadiness: ready ? 'ANNOTATION VALIDATION REQUIRED' : 'NOT READY — SOURCE FILES NOT LOCALLY AVAILABLE',
    modelStatus: 'MODEL NOT DEPLOYED'
  };
}
