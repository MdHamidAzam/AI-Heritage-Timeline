import fs from 'node:fs';
import { createModelArtifactMetadata, EMPTY_METRICS } from '../training/damage-model-contract.mjs';

const artifactArgumentIndex = process.argv.indexOf('--artifact');
const artifactPath = artifactArgumentIndex >= 0 ? process.argv[artifactArgumentIndex + 1] : null;

if (process.argv.includes('--help')) {
  console.log('Usage: npm run evaluate-darbhanga -- --artifact PATH');
  console.log('Evaluation output remains empty until a real trained artifact and evaluation set exist.');
  process.exit(0);
}

if (!artifactPath || !fs.existsSync(artifactPath)) {
  console.error(JSON.stringify({
    status: 'MODEL NOT DEPLOYED',
    metrics: EMPTY_METRICS,
    message: 'No trained model artifact is available for evaluation.'
  }, null, 2));
  process.exit(1);
}

console.error('EVALUATION STOPPED: artifact evaluation adapter is not connected.');
console.error(JSON.stringify(createModelArtifactMetadata(), null, 2));
process.exit(1);
