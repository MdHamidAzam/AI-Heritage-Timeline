import fs from 'node:fs';
import path from 'node:path';
import { buildDarbhangaValidationReport } from '../inference/darbhanga-fort-adapter.mjs';

const root = process.cwd();
const manifestPath = path.join(root, 'ml', 'datasets', 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const allowedStatuses = new Set(['not_downloaded', 'downloaded', 'partially_downloaded', 'verified', 'blocked_by_license', 'unavailable']);
const requiredFields = ['datasetId', 'name', 'version', 'sourceUrl', 'doi', 'publisher', 'domain', 'country', 'imageCount', 'annotationType', 'classes', 'license', 'licenseUrl', 'downloadStatus', 'localPath', 'intendedUse', 'notes'];
const errors = [];

if (!Array.isArray(manifest.datasets)) errors.push('Manifest must contain a datasets array.');
const datasets = manifest.datasets || [];
const ids = new Set();

for (const [index, dataset] of datasets.entries()) {
  for (const field of requiredFields) {
    if (!(field in dataset)) errors.push(`Dataset ${index + 1} is missing required field: ${field}`);
  }
  if (typeof dataset.datasetId !== 'string' || !dataset.datasetId) errors.push(`Dataset ${index + 1} has an invalid datasetId.`);
  if (ids.has(dataset.datasetId)) errors.push(`Duplicate dataset ID: ${dataset.datasetId}`);
  ids.add(dataset.datasetId);
  if (!allowedStatuses.has(dataset.downloadStatus)) errors.push(`Invalid downloadStatus for ${dataset.datasetId}: ${dataset.downloadStatus}`);
  if (!Number.isInteger(dataset.imageCount) || dataset.imageCount < 0) errors.push(`Invalid imageCount for ${dataset.datasetId}.`);
  if (!Array.isArray(dataset.classes) || dataset.classes.length === 0) errors.push(`Classes must be a non-empty array for ${dataset.datasetId}.`);
  if (typeof dataset.license !== 'string' || !dataset.license.trim()) errors.push(`Licence status is missing for ${dataset.datasetId}.`);
  if (dataset.downloadStatus === 'downloaded' || dataset.downloadStatus === 'verified') {
    const localPath = path.join(root, dataset.localPath);
    if (!fs.existsSync(localPath)) errors.push(`Local path does not exist for ${dataset.datasetId}: ${dataset.localPath}`);
    if (dataset.imageDirectory && !fs.existsSync(path.join(root, dataset.imageDirectory))) errors.push(`Image directory does not exist for ${dataset.datasetId}: ${dataset.imageDirectory}`);
    if (dataset.annotationDirectory && !fs.existsSync(path.join(root, dataset.annotationDirectory))) errors.push(`Annotation directory does not exist for ${dataset.datasetId}: ${dataset.annotationDirectory}`);
  }
}

const taxonomyPath = path.join(root, 'ml', 'taxonomy', 'damage-taxonomy.json');
const taxonomy = JSON.parse(fs.readFileSync(taxonomyPath, 'utf8'));
for (const mapping of taxonomy.mappings || []) {
  if (!ids.has(mapping.datasetId)) errors.push(`Taxonomy mapping references unknown dataset: ${mapping.datasetId}`);
  if (!mapping.sourceLabel || !mapping.normalizedLabel || !mapping.datasetId) errors.push('Taxonomy mappings require sourceLabel, normalizedLabel, and datasetId.');
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

const reportDirectory = path.join(root, 'ml', 'validation', 'reports');
fs.mkdirSync(reportDirectory, { recursive: true });
const darbhangaReport = buildDarbhangaValidationReport();
fs.writeFileSync(path.join(reportDirectory, 'darbhanga-fort-validation.json'), `${JSON.stringify(darbhangaReport, null, 2)}\n`);
console.log(`Validated ${datasets.length} metadata-only dataset records and ${taxonomy.mappings.length} taxonomy mappings.`);
console.log(`Darbhanga Fort: ${darbhangaReport.validationStatus}`);