import { getDarbhangaTrainingReadiness, createModelArtifactMetadata } from '../training/damage-model-contract.mjs';

const args = new Map(process.argv.slice(2).map((argument, index, values) => argument.startsWith('--') ? [argument.slice(2), values[index + 1] && !values[index + 1].startsWith('--') ? values[index + 1] : true] : [argument, true]));

if (args.has('help')) {
  console.log('Usage: npm run train-darbhanga -- --dataset-path PATH --model ARCH --epochs N --imgsz N --batch N --output DIR');
  console.log('Training refuses to start until local images, annotations, source splits, and complete taxonomy mappings exist.');
  process.exit(0);
}

const readiness = getDarbhangaTrainingReadiness();
if (!readiness.ready) {
  console.error('TRAINING STOPPED: DATASET NOT READY');
  console.error(readiness.errors.join('\n'));
  console.error(JSON.stringify(createModelArtifactMetadata(), null, 2));
  process.exit(1);
}

const requiredArguments = ['dataset-path', 'model', 'epochs', 'imgsz', 'batch', 'output'];
const missingArguments = requiredArguments.filter((name) => !args.has(name));
if (missingArguments.length) {
  console.error(`TRAINING STOPPED: missing arguments: ${missingArguments.map((name) => `--${name}`).join(', ')}`);
  process.exit(1);
}

console.error('TRAINING INTERFACE READY: no detector backend is invoked by this repository yet.');
console.error('MODEL NOT DEPLOYED');
process.exit(1);
