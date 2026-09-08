import fs from 'node:fs';
import path from 'node:path';
import { buildDarbhangaValidationReport, getDarbhangaRegistration, inspectDarbhangaIngestion, validateDarbhangaAnnotations } from '../inference/darbhanga-fort-adapter.mjs';

const root = process.cwd();
const registration = getDarbhangaRegistration();
const ingestion = inspectDarbhangaIngestion();
const annotations = [];
const detectedSourceClasses = new Set();
const annotationErrors = [];

for (const split of ingestion.splitReports) {
  for (const annotationFile of split.annotationFiles) {
    if (path.extname(annotationFile).toLowerCase() !== '.json') continue;
    try {
      const parsed = JSON.parse(fs.readFileSync(annotationFile, 'utf8'));
      const entries = Array.isArray(parsed) ? parsed : parsed.annotations;
      if (!Array.isArray(entries)) {
        annotationErrors.push(`${split.split}/${path.basename(annotationFile)}: expected an annotation array`);
        continue;
      }
      for (const entry of entries) {
        if (entry.sourceLabel) detectedSourceClasses.add(entry.sourceLabel);
        annotations.push(entry);
      }
    } catch (error) {
      annotationErrors.push(`${split.split}/${path.basename(annotationFile)}: invalid annotation file (${error.message})`);
    }
  }
  for (const annotationFile of split.annotationFiles.filter((file) => path.extname(file).toLowerCase() === '.txt')) {
    const lines = fs.readFileSync(annotationFile, 'utf8').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    lines.forEach((line, index) => {
      const fields = line.split(/\s+/);
      if (fields.length !== 5 || fields.slice(1).some((value) => !Number.isFinite(Number(value)) || Number(value) < 0 || Number(value) > 1)) {
        annotationErrors.push(`${split.split}/${path.basename(annotationFile)}:${index + 1}: invalid YOLO annotation`);
      } else {
        detectedSourceClasses.add(`class-id:${fields[0]}`);
      }
    });
  }
}

const annotationValidation = annotations.length ? validateDarbhangaAnnotations(annotations) : { valid: false, annotationCount: 0, errors: [] };
const taxonomyMappings = registration.taxonomyMappings;
const mappedSourceLabels = new Set(taxonomyMappings.map((mapping) => mapping.sourceLabel));
const unmappedDetectedClasses = [...detectedSourceClasses].filter((label) => !mappedSourceLabels.has(label));
const report = {
  ...buildDarbhangaValidationReport(),
  ingestion: {
    totalImageFilesFound: ingestion.totalImages,
    totalAnnotationFilesFound: ingestion.totalAnnotations,
    matchedImageAnnotationPairs: ingestion.matchedPairs,
    missingAnnotations: ingestion.missingAnnotations,
    missingImages: ingestion.missingImages,
    detectedSourceClasses: [...detectedSourceClasses],
    taxonomyMappings,
    invalidBoundingBoxes: annotationValidation.errors.filter((error) => /bounding box|out-of-range|YOLO annotation/i.test(error)),
    duplicateAnnotations: annotationValidation.errors.filter((error) => /duplicate annotation/i.test(error)),
    emptyAnnotations: annotationValidation.errors.filter((error) => /empty annotation/i.test(error)),
    availableSplits: ingestion.availableSplits,
    parserErrors: annotationErrors,
    unmappedDetectedClasses
  },
  sourcePreserved: true,
  preparedOutput: 'ml/datasets/darbhanga-fort/prepared-yolo',
  checkStatus: ingestion.totalImages === 0 && ingestion.totalAnnotations === 0
    ? 'DATASET REGISTERED — SOURCE FILES NOT LOCALLY AVAILABLE'
    : annotationValidation.valid && ingestion.missingAnnotations.length === 0 && ingestion.missingImages.length === 0 && unmappedDetectedClasses.length === 0
      ? 'SOURCE FILES FOUND — VALIDATION PASSED'
      : 'SOURCE FILES FOUND — VALIDATION FAILED'
};

const reportDirectory = path.join(root, 'ml', 'validation', 'reports');
fs.mkdirSync(reportDirectory, { recursive: true });
fs.writeFileSync(path.join(reportDirectory, 'darbhanga-fort-ingestion.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
process.exit(report.checkStatus === 'SOURCE FILES FOUND — VALIDATION FAILED' ? 1 : 0);
