# Metadata foundation

The active prototype seed records live in `public/api/` so Vite can expose them during development. When real collection begins, keep normalized JSON/CSV records here by entity: `monuments/`, `media/`, `timeline/`, `damage/`, `restricted_areas/`, `reconstruction/`, and `evidence/`.

Every externally sourced media/evidence record must retain: `source`, `source_url`, `source_date`, `reliability`, `description`, `license`, and `attribution`. Unknown values should be `null`; do not infer them.
