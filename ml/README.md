# Heritage Damage ML Dataset Foundation

This workspace registers external datasets for future, reproducible heritage-damage machine-learning work. It contains metadata and label mappings only; it does not contain downloaded dataset binaries and it does not contain trained models.

## Purpose

The first intended experiment is object detection using a locally verified, licensed dataset. Darbhanga Fort is the first candidate because its source documents CC BY 4.0. The architecture and training configuration remain intentionally undecided until the files, annotations, and licence terms are verified locally.

The existing Konark records remain application data and documented heritage evidence. They are not training labels. A future workflow is: external training datasets -> model -> new-image inference -> human verification -> optional linkage to a Konark record.

## Registered sources

| Dataset | Intended role | Licence status | Download status |
| --- | --- | --- | --- |
| Darbhanga Fort | First object-detection candidate | CC BY 4.0 | Not downloaded |
| MSD-Det | Object-detection candidate | Requires verification | Not downloaded |
| YTU-CrackIS | Second-stage segmentation candidate | Verify from dataset record | Not downloaded |
| Heritage Cracks | Crack-detection candidate | Verify from dataset source terms | Not downloaded |

See `datasets/manifest.json` for the single metadata registry and `taxonomy/damage-taxonomy.json` for source-preserving mappings.

## Annotation and split preparation

Annotation formats are recorded only as reported by the sources. No conversion or split has been performed. The `training`, `validation`, and `inference` directories document interfaces for future work. When files become available, preserve official splits where provided; otherwise create a deterministic train/validation/test split with a recorded seed, dataset version, and image-identity leakage check.

No model package is installed and no model is trained by this foundation task.

## Limitations

The registered sources cover different countries, monuments, acquisition methods, annotation formats, and damage vocabularies. Augmented images are not independent field observations. Licence and redistribution terms are not interchangeable with publication access. Source labels must remain available when normalized mappings are applied, and uncertain classes must not be mapped automatically.

External datasets do not provide Konark-specific ground truth. Performance on external heritage datasets does not establish equivalent performance on Konark or any other specific monument.

## Validation

Run `npm run validate-datasets` to validate the manifest and mappings. Metadata-only records pass without local images. A dataset may be marked `downloaded` or `verified` only after its declared local path and any claimed image or annotation directories exist.