# Shameek Vardhan Bhatt — Data & Digital

A responsive motion portfolio built with HTML, CSS, JavaScript, and WebGL. The complete website is in `dist/`; no dependencies or build step are required.

## Included

- Verified résumé information: profile, skills, education, certifications, contact details, LinkedIn, GitHub, and downloadable résumé.
- Two résumé case studies: Ride-Sharing Data Analytics & Power BI Dashboard, and IPL Cricket Analytics & Win Prediction. Original illustrative covers and interactive workflow explanations; no unverified outcome or accuracy claims.
- Lead qualification demo: import CSV, remove duplicate company names, adjust scoring criteria, review company briefs, and export results.
- Outreach demo: create and edit personalized templates, request review, approve the exact draft, export, and simulate CRM reply events. Editing resets approval.
- Revenue dashboard: filter 8,800 opportunities by quarter, region, and product; explore revenue, win rate, estimated pipeline, and sales-cycle duration.
- Downloadable project kit with original public CSV data, reproducible Python analysis, SQL, DAX measures, prompts, and an integration plan.
- Interactive coral 3D knot, introduction sequence, scroll reveals, reduced-motion support, and a persistent animation toggle.

## Preview and deploy

Open `dist/index.html` in a browser. For full clipboard support, serve `dist/` over localhost or HTTPS. Publish the **contents of `dist/`** to a static host. All fonts and data required for the website are included locally.

Vercel configuration is included at the project root. Deploy this folder with Vercel using the Other framework preset and output directory `dist`; no install or build command is needed. No online deployment is confirmed. Use the included Vercel configuration to deploy the project.

## Project data and limitations

The demos use [Maven Analytics CRM Sales Opportunities](https://mavenanalytics.io/data-playground/crm-sales-opportunities), a public-domain dataset about fictional companies. Source provenance and field definitions are in `dist/assets/DATA-SOURCES.json`; the downloadable kit contains the original CSVs and reproduction instructions.

Source and campaign attribution were absent from the original data. Those dashboard panels use explicitly labeled synthetic attribution. Open pipeline is a product-list-price estimate. The other metrics are computed from the source records.

The two AI-titled projects are browser prototypes. Drafts and company briefs are template/rule based. Live LLM APIs, n8n, Google Sheets, and HubSpot are not connected; no email is sent. CRM activity exists only in the current browser session. The kit includes Python/SQL/DAX and a production integration plan, not a deployed automation or a Power BI `.pbix` file.

## Color and typography

- Russian violet `#311847` and imperial red `#F15152`
- Forest green `#3A5A40` and stone `#DAD7CD`
- Navy `#283845` and apricot `#FFA649`

[CHORUS by Dazor](https://dazor.gumroad.com/l/CHORUS-FONT) is bundled in Black and Bold, with attribution in `dist/assets/FONT-NOTICES.txt`.

Kirgina is not bundled because its free demo is personal-use only and website embedding requires the appropriate license. The secondary-heading stack checks for a locally installed Kirgina and otherwise uses Chorus. Add a licensed webfont to the assets and update its `@font-face` rule to embed Kirgina. [Kirgina licensing](https://dharmasfoundry.com/license/).

## Validation

JavaScript syntax checks passed. Browser checks at 1440 × 1000 and 390 × 844 found no horizontal page overflow; the mobile revenue modal also fit its viewport. Case-study workflow switching, lead deduplication and scoring, company brief selection, outreach approval and edit reset, simulated replies, revenue filters/reset, and education disclosure were exercised. No browser console errors were reported.

Full-dataset browser values match independent Python/SQL calculations: 8,800 opportunities, 4,238 won, 2,473 lost, $10,005,534 won revenue, 63.150052% closed-deal win rate, $4,966,215 estimated open pipeline, and 51.781973 average won-cycle days. Résumé, data, and project-kit assets returned successful HTTP responses with the expected content types.

## Expanded IPL project

The supplied complete project is integrated into the existing IPL case study: 1,243 matches, 19 seasons (2008–2026), and 295,732 delivery events. Eight selectable charts, coverage and methodology, findings, and chronological model evaluation are included. Visitors can open the report or download the executed notebook and complete original project archive. Cricsheet attribution and original license notices are retained.

The saved 2026 holdout model achieved 45.21% accuracy on 73 decided matches and 0.6867 log loss. These modest results and limitations are stated on the page. Source counts, prediction accuracy/log loss, and the source archive checksum were independently checked; the supplied model binaries were not executed or retrained.

The expanded case study was checked at desktop (1440 × 1000) and mobile (390 × 844) sizes without horizontal overflow. Chart selection updates the displayed image, caption, and download link. Workflow switching passed and no browser console errors appeared. All eight charts, the report, notebook, and full project archive returned HTTP 200 with bytes matching the local originals.
