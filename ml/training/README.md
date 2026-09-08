# Training interface

The Darbhanga Fort training interface is model-agnostic and ready for a YOLO-compatible detector, but it does not train a model in the current repository state.

`ml/training/damage-model-contract.mjs` defines:

- the training example contract: image, class, bounding box, monument ID, dataset ID, and source split;
- the required readiness checks;
- the YOLO configuration boundary;
- empty evaluation metrics;
- model artifact metadata with `MODEL NOT DEPLOYED` as the default status.

`npm run prepare-darbhanga` converts verified source annotations only after local files, source-declared splits, and complete taxonomy mappings are available. `npm run train-darbhanga` fails fast until those requirements are met. `npm run evaluate-darbhanga` never invents precision, recall, mAP, or confusion-matrix values.

Darbhanga training data remains separate from Konark documented damage records. A future Darbhanga-trained detector must not be treated as validated for Konark without a separate domain-transfer/generalization evaluation.