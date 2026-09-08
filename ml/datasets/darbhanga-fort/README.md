# Darbhanga Fort Dataset

The dataset is registered in `ml/datasets/manifest.json` as `darbhanga-fort` and is licensed in the registry as CC BY 4.0. This repository does not download the dataset automatically.

## Local Layout

After intentional acquisition and licence review, place only the verified source files under this registered path:

```text
ml/datasets/darbhanga-fort/
	source/                 # immutable, intentionally acquired source files
		images/
			train/
			val/
			test/               # use only when the source provides a test split
		labels/
			train/
			val/
			test/               # use only when the source provides a test split
	prepared-yolo/          # generated only after check and preparation pass
```

The current source directories are placeholders only. They contain no image binaries or annotations. Never overwrite source files; the prepared YOLO output is separate.

## Read-only Ingestion Check

Run this before preparation:

```powershell
npm run check-darbhanga
```

The command reports image files, annotation files, matched pairs, missing images/annotations, detected source classes, explicit taxonomy mappings, invalid boxes, duplicate/empty annotations, available splits, parser errors, and an ingestion report at `ml/validation/reports/darbhanga-fort-ingestion.json`. It never downloads, rewrites, moves, or normalizes source files. If the dataset is absent it safely reports `DATASET REGISTERED — SOURCE FILES NOT LOCALLY AVAILABLE`.

## Preparation

The source annotation format must be verified before conversion. The preparation script accepts a JSON array, or an object with an `annotations` array, using this normalized input shape:

```json
{
	"image": "images/train/example.jpg",
	"sourceLabel": "crack",
	"boundingBox": [100, 120, 240, 180],
	"imageWidth": 768,
	"imageHeight": 768,
	"split": "train"
}
```

`sourceLabel` is preserved and mapped through the existing `ml/taxonomy/damage-taxonomy.json`. The script rejects missing images, unknown labels, invalid or out-of-range boxes, duplicates, empty annotations, missing source splits, and incomplete taxonomy mappings. It never invents train/validation/test splits.

```powershell
npm run prepare-darbhanga -- --annotations path/to/verified-annotations.json
```

Preparation is allowed only after the real source files, source-declared splits, complete mappings, and annotations pass validation. The YOLO configuration is generated under `prepared-yolo/`; no model is trained by preparation.

## Training and Evaluation Interfaces

```powershell
npm run train-darbhanga -- --dataset-path ml/datasets/darbhanga-fort --model yolo11n.pt --epochs 100 --imgsz 768 --batch 16 --output runs/darbhanga
npm run evaluate-darbhanga -- --artifact runs/darbhanga/model-artifact.json
```

Training currently stops with `DATASET NOT READY` because the source files and source-declared splits are unavailable. Evaluation exposes precision, recall, mAP50, mAP50-95, and confusion-matrix fields as `null` until a real trained artifact exists. The status remains `MODEL NOT DEPLOYED`.