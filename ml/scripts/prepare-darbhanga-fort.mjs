import fs from 'node:fs';
import path from 'node:path';
import { getDarbhangaRegistration, validateDarbhangaAnnotations, inspectDarbhangaFiles } from '../inference/darbhanga-fort-adapter.mjs';
import { createYoloConfig, getDarbhangaTrainingReadiness } from '../training/damage-model-contract.mjs';

const root = process.cwd();
const args = new Map(process.argv.slice(2).map((argument, index, values) => argument.startsWith('--') ? [argument.slice(2), values[index + 1] && !values[index + 1].startsWith('--') ? values[index + 1] : true] : [argument, true]));
const registration = getDarbhangaRegistration();
const files = inspectDarbhangaFiles();
const readiness = getDarbhangaTrainingReadiness();

if (args.has('help')) {
  console.log('Usage: npm run prepare-darbhanga -- [--annotations path] [--output path]');
  console.log('Reads verified local annotations only; it never downloads data or invents splits.');
  process.exit(0);
}

if (!readiness.ready) {
  console.error('DATASET PREPARATION STOPPED');
  console.error(`Dataset: ${registration.datasetId}`);
  console.error(readiness.errors.join('\n'));
  console.error('DATASET REGISTERED — SOURCE FILES NOT LOCALLY AVAILABLE');
  process.exit(1);
}

const annotationPath = args.get('annotations');
if (!annotationPath) {
  console.error('DATASET PREPARATION STOPPED: pass --annotations with the verified source annotation file.');
  process.exit(1);
}

const resolvedAnnotationPath = path.resolve(root, annotationPath);
if (!fs.existsSync(resolvedAnnotationPath)) {
  console.error(`DATASET PREPARATION STOPPED: annotation file does not exist: ${annotationPath}`);
  process.exit(1);
}

const parsed = JSON.parse(fs.readFileSync(resolvedAnnotationPath, 'utf8'));
const annotations = Array.isArray(parsed) ? parsed : parsed.annotations;
if (!Array.isArray(annotations)) {
  console.error('DATASET PREPARATION STOPPED: expected a JSON array or an {"annotations": []} object.');
  process.exit(1);
}

const validation = validateDarbhangaAnnotations(annotations);
if (!validation.valid) {
  console.error('DATASET PREPARATION STOPPED: annotation validation failed.');
  console.error(validation.errors.join('\n'));
  process.exit(1);
}

const outputDirectory = path.resolve(root, args.get('output') || path.join(registration.localPath, 'prepared-yolo'));
fs.mkdirSync(outputDirectory, { recursive: true });
const config = createYoloConfig({ outputDirectory: registration.localPath });
fs.writeFileSync(path.join(outputDirectory, 'dataset.yaml'), `${JSON.stringify(config, null, 2)}\n`);
console.log(`Prepared ${annotations.length} validated annotations for ${registration.datasetId}.`);
console.log(`Output: ${path.relative(root, outputDirectory)}`);
console.log('No train/validation/test split was invented; source splits were required.');
