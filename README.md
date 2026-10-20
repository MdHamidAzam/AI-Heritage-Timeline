# 🏛️ Heritage AI — Machine Timeline

**Bringing India's Heritage to Life Through AI, Digital Timelines, and 3D Experiences**

Heritage AI — Machine Timeline is a web-based prototype designed to explore cultural heritage through structured monument data, historical timelines, and interactive digital experiences.

The project currently includes a Vite development environment, seed data for heritage monuments, and development API endpoints for monument discovery. It is designed to support future expansion into AI-assisted heritage interpretation, 3D digital twins, and evidence-based historical reconstruction.

> **Project status:** Prototype / Active Development

---

## ✨ Project Vision

Historical monuments are more than architectural structures — they are records of the people, technologies, art, and civilizations that shaped our past.

Heritage AI aims to make this history more accessible through an interactive digital experience that connects monument information with historical context and potential AI-powered exploration.

### 🎯 Key Objectives

- **Explore Heritage:** Present structured information about historical monuments.
- **Understand Historical Change:** Organize historical events and monument development into timelines.
- **Enable Digital Preservation:** Establish a structured data foundation for future digital heritage resources.
- **Support 3D Exploration:** Prepare for immersive monument visualization and digital twin experiences.
- **Encourage Evidence-Based Interpretation:** Keep original source material separate from processed and annotated data.

---

## 🚀 Current Prototype

The current development setup provides:

- A Vite-powered web application.
- Seed JSON data organized separately from application code.
- Development API endpoints for listing monuments and retrieving the Konark Sun Temple record.
- A data validation script for checking demo monument IDs.
- A dedicated directory structure for future images, documents, maps, architectural drawings, 3D assets, and drone imagery.

Features described as future extensions are not necessarily implemented in the current prototype.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Vite | Development server and build tooling |
| JavaScript / TypeScript | Application logic, depending on the current implementation |
| JSON | Structured seed data and development API responses |
| Node.js & npm | Development environment and dependency management |

*Update this list as needed to match the actual dependencies in `package.json`.*

---

## ⚙️ Getting Started

### Prerequisites

Install the following before starting:

- [Node.js](https://nodejs.org/) — a compatible LTS version
- npm — included with Node.js
- Git — recommended for version control

### 1. Clone the repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd <YOUR_PROJECT_DIRECTORY>
```

Replace the placeholders with your actual repository URL and directory name.

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

Open the local URL printed in your terminal, commonly:

```text
http://localhost:5173
```

The exact URL and port depend on your Vite configuration.

### 4. Validate the seed data

In a separate terminal, run:

```bash
node scripts/validate-data.mjs
```

This script checks the demo monument IDs. Run it after updating monument data to catch ID-related inconsistencies.

### 5. Build for production

```bash
npm run build
```

If supported by the project, preview the production build with:

```bash
npm run preview
```

---

## 🔌 Development API

The prototype exposes seed JSON through development API endpoints.

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/monuments` | Retrieve the monument collection |
| `GET` | `/api/monuments/konark-sun-temple` | Retrieve the Konark Sun Temple record |

Example requests:

```bash
curl http://localhost:5173/api/monuments
```

```bash
curl http://localhost:5173/api/monuments/konark-sun-temple
```

**Important:** These endpoints are available in the configured development environment. Production API availability requires a separately configured deployment or backend.

---

## 📁 Project Data Organization

The project keeps published seed data separate from raw research materials and derived assets.

```text
heritage-ai/
├── public/
│   └── api/
│       └── ...                 # Seed JSON exposed by the prototype
├── scripts/
│   └── validate-data.mjs       # Demo monument ID validation
├── data/
│   ├── raw/
│   │   ├── images/
│   │   ├── documents/
│   │   ├── maps/
│   │   ├── drawings/
│   │   ├── 3d/
│   │   └── drone/
│   ├── processed/              # Derived and cleaned assets
│   └── annotated/              # Labeled and annotated material
├── package.json
└── README.md
```

*The tree illustrates the intended organization. Some directories may need to be created as the project evolves.*

### 📚 Data Management Principles

**1. Preserve raw sources**

Keep original source material under `data/raw/` immutable. Do not overwrite original files during cleaning, conversion, annotation, or enhancement.

**2. Store derived material separately**

Place cleaned, converted, or transformed assets under `data/processed/`.

**3. Keep annotations traceable**

Store labels, annotations, and research notes under `data/annotated/`. Where possible, retain source references and document how annotations were produced.

**4. Use stable monument IDs**

Use consistent, machine-readable IDs across the seed data, API responses, and future timeline records.

**5. Respect provenance and licensing**

Record source URLs, creator or institution, access dates, licensing terms, and relevant attribution requirements for external material.

---

## 🏛️ Featured Monument: Konark Sun Temple

The Konark Sun Temple in Odisha is an important example of India's architectural and cultural heritage.

The current prototype includes a dedicated development endpoint for its seed record.

Future iterations can expand this experience with:

- Historical and architectural timelines.
- Monument details linked to documented sources.
- Architectural drawings and historical maps.
- 3D models and interactive spatial exploration.
- Clearly labeled reconstructions supported by historical evidence.

AI-generated interpretations and reconstructions should be distinguished from verified historical facts.

---

## 🗺️ Roadmap

The following items describe potential development milestones, not a claim that every feature is already available.

- [x] Establish the Vite development environment.
- [x] Organize seed JSON under `public/api/`.
- [x] Add development endpoints for monument data.
- [x] Add a script to validate demo monument IDs.
- [ ] Expand the structured monument dataset.
- [ ] Build a richer historical timeline interface.
- [ ] Add source attribution and evidence references.
- [ ] Integrate interactive 3D monument exploration.
- [ ] Develop an AI-assisted heritage interpretation workflow.
- [ ] Explore evidence-based reconstruction and damage visualization.
- [ ] Add automated tests and continuous integration.
- [ ] Prepare a production-ready API and deployment workflow.

---

## 🤝 Contributing

Contributions that improve data quality, documentation, accessibility, testing, and heritage exploration are welcome.

1. Fork the repository.
2. Create a feature branch:

   ```bash
   git checkout -b feature/your-feature
   ```

3. Make your changes.
4. Validate the data if applicable:

   ```bash
   node scripts/validate-data.mjs
   ```

5. Run the available build and test scripts.
6. Commit your changes:

   ```bash
   git add .
   git commit -m "feat: describe your change"
   ```

7. Push your branch and open a pull request.

### Contribution Guidelines

- Preserve original source files.
- Provide citations or provenance for historical claims and datasets.
- Avoid presenting AI-generated reconstructions as original historical evidence.
- Keep changes focused and document new data fields or API behavior.
- Never commit API keys, passwords, tokens, or other secrets.

---

## 🔐 Data, Privacy & Responsible AI

Heritage documentation should prioritize accuracy, transparency, and cultural sensitivity.

- Respect copyright, licensing, and institutional access conditions.
- Preserve the distinction between original evidence, interpretation, and generated content.
- Document uncertainty when historical information is incomplete or disputed.
- Avoid altering original archival material.
- Follow applicable restrictions for sensitive heritage locations and cultural materials.

---

## 📄 License

No license has been specified here. Before distributing or accepting contributions to the project, add a `LICENSE` file that reflects the intended usage and permissions.

---

## 🌟 Project Mission

**Preserve the past. Understand the present. Reimagine heritage responsibly.**

Heritage AI — Machine Timeline aims to connect cultural heritage with modern digital experiences while keeping historical evidence, data provenance, and responsible interpretation at the center of the project.

If you find the project interesting, consider exploring the code, reporting issues, or contributing to its development.
