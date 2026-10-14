# Personal Projects

## Motion portfolio

A responsive portfolio for Shameek Vardhan Bhatt, combining data analytics, web development, and motion design.

[View the source and setup guide](portfolio/README.md)

Includes résumé information, ride-sharing and IPL case studies, and three interactive automation/analytics demos. The expanded IPL project includes eight charts, evaluation results, and downloadable report, notebook, and complete project files.

### Run locally

From this repository folder, run:

```sh
python -m http.server 4173 --directory portfolio/dist
```

Then open http://localhost:4173 in your browser.

### Deploy to Vercel

Import this repository and set **Root Directory** to `portfolio`, **Framework Preset** to **Other**, and **Output Directory** to `dist`. No install or build step is required. The folder includes `vercel.json`.

See the [portfolio README](portfolio/README.md) for data provenance, font licensing, and demo limitations.
