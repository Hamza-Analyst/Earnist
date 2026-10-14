# Earnist · Local workspace

A connected, locally runnable Earnist MVP demo by **AiBit Sol**. Built with React 19, TypeScript, Vite, React Router, and a shared responsive CSS system. This is a proposed product prototype using fictional records, not a production banking or tax application.

## Install and run

Requires Node.js **20.19+ or 22.12+** and npm. In the project folder:

```sh
npm install
npm run dev
```

Open the URL printed by Vite, normally **http://127.0.0.1:5173**. Stop the server with Ctrl+C. No API keys, paid services, or backend are needed. A local account is optional.

```sh
npm run typecheck
npm run build
npm run preview
npm test
npm run test:e2e
```

The production build runs TypeScript checks and writes `dist/`. Preview serves that build locally; it does not deploy anything.

## Local sign in and profile completion

The onboarding screen links to Login and Sign up. Sign up creates one browser-local account for the existing workspace; its password is stored as a salted PBKDF2 hash. Logging out hides the workspace until that local account signs in again. Account recovery, cloud sync, multi-user isolation, and encryption of financial records are not provided. Clearing all local data also removes the local account.

Profile completion is a separate 0–100% measure based on nine details: profile photo, display name, contact email, phone, business name, activity, work type, location, and website. The score and missing-field list update as fields change; Save profile persists text fields, while photo changes save immediately to this browser. Uploaded photos are cropped to a compact square and included in the local JSON export. It is independent of the documentation score, tax readiness, and filing status.

## Documentation score and final review prompts

Home, Ready to file, and the downloaded report share one prototype documentation score. For every reviewed expense with a positive business allocation, an attached receipt earns one point and a nonblank business-purpose note earns one point. The score is earned points divided by two points per eligible expense, rounded to a whole percent. No eligible expenses displays an unavailable score. It measures recorded support only, not tax eligibility or audit readiness.

The four "Find more deductions" prompts are home workspace, driving and travel, tools and subscriptions, and outside help. Checking one confirms a review of records for that area; it does not claim a deduction. The prompts use conservative recordkeeping language informed by IRS guidance and remain subject to Earnist's approval for production.

## Presentation walkthrough

Open **Demo guide** from the desktop sidebar or **Profile & settings** for an optional comparison of reported audit issues and working changes. The complete first-swipe → correction → receipt → merchant rule → report → reload presentation is documented in [AUDIT_RESPONSE.md](AUDIT_RESPONSE.md). Nothing adds a forced tour before Review.

1. **Enter the demo.** Choose a work type or skip it. Personalization suggests useful categories; it does not establish deductibility. Go back without losing the answer. Try the simulated sample account, including an optional error/retry, or begin with empty local records.
2. **Review an expense.** Edit its category, swipe right for business or left for personal, or use buttons. Arrow keys classify; Z undoes. Native form controls retain their own keyboard behavior. Mixed expenses show the business and personal portions before confirmation. Skip and resume unfinished review.
3. **Open Overview.** Watch metrics, monthly income/spending, category totals, review counts, and next steps reflect the same records. Date filters update the entire overview.
4. **Correct a transaction.** Search/filter Transactions, open details, edit classification or allocation, add notes, and attach a local JPG, PNG, or PDF receipt. Reload and inspect the saved record. Business totals and Reports update immediately.
5. **Create a merchant rule.** From a saved transaction or Rules, preview an exact/contains match and allocation, save, edit, or disable it. Enabled unique matches classify new unreviewed expenses; existing reviewed decisions stay intact.
6. **Import records.** In Accounts, add or rename a manual account, select a CSV, map columns, correct or exclude invalid rows, explicitly approve suspected duplicates if appropriate, preview, and import. Expenses without a unique enabled rule enter Review; income and transfers do not.
7. **Build a report.** Select dates and an account, inspect the income and expense summary and underlying records, export CSV, or use Print / save PDF. Mileage appears separately from monetary expenses.
8. **Open Profile.** Save optional business context and a resumable tax preparation draft. A saved reporting year suggests the Reports date range; notes and jurisdiction appear as user-provided report context. This does not enable tax estimation or block unrelated features. Demo access is consistently No expiry / No charges.
9. **Log mileage afterward.** Add, edit, filter, or delete trips and export them. Miles/kilometers convert explicitly; the original unit is retained in CSV exports.
10. **Manage local data.** Export all records including receipts, restart onboarding while preserving records, or confirm a complete local reset.

### Connect a test card

Choose **Connect test card** on onboarding's starting-point screen or in **Accounts**. The clearly labeled simulation supports loading, success, optional failure, and retry. It adds **Test credit card · 9186** with six fictional USD charges, four initially unreviewed. Card records feed Review, Transactions, Overview, and Reports and persist across reloads. The option remains available after loading the sample bank accounts. Connecting it again cannot duplicate its records. No card number, CVC, real card connection, or payment is requested or processed; no card balance or credit limit is invented.

## Implemented areas

- Lightweight onboarding with a distinct sample-data entry, optional personalization, sample/empty starting choices, preserved selections, and time to first demo swipe.
- Connected Overview, Review, Transactions, Rules, Accounts, Mileage, Reports, and Profile routes, with review counts in navigation; optional Demo guide for the client presentation.
- Merchant rules with exact/contains matching, allocation and record preview, editing, enable/disable, deletion, explicit existing-unreviewed opt-in, and automatic application to new unreviewed manual/CSV/sample expenses. Reviewed records stay unchanged; multiple matches leave expenses unreviewed.
- Separate business profile and resumable tax preparation draft with field-purpose explanations, saved progress, contextual report-year defaults, and user-provided report context. Review and exports do not require completing it.
- One shared demo-access policy: Free local demo, No expiry, No charges. No real subscription or invented production trial terms.
- Expense-only touch review, buttons, keyboard controls, editable categories, mixed allocations, skip/resume, progress, undo, and protection against repeated classification events.
- Searchable transaction management with date/account/type/status/classification/category/receipt filters, sorting, manual entry, detail editing, deletion confirmation, and bulk classification/category/deletion actions.
- Receipt attachment, replacement, image preview, PDF download, removal, file validation, and IndexedDB persistence.
- CSV mapping, validation, inline correction, duplicate review, import summary, and downloadable example data.
- Manual account management and clearly labeled connection simulation with loading, success, error, and retry. No account balances are inferred from transactions.
- Mileage CRUD, period/classification filtering, business distance totals, unit conversion, and safe CSV export.
- Filtered report preview, category and mixed totals, receipt coverage, transaction/mileage CSV exports, printable report, and local JSON export with receipt data.
- Loading, storage recovery/retry, empty, no-results, error, completion, and partial-review states; responsive mobile navigation, visible focus, native dialog focus management, and reduced-motion styling.

## Data and financial rules

Records share one typed data layer. Transactions have a stable ID, account, date-only value, integer cents, USD currency, type, review status, classification, business percentage, category, notes, and optional receipt relationship. Classification and category are independent fields.

- **Recorded income:** income inflow only, excluding transfers.
- **Recorded spending:** all expense outflow, excluding transfers.
- **Expenses marked as business:** classified business expenses plus the rounded business allocation of mixed expenses.
- **Personal spending:** personal expenses plus mixed personal allocations. Unreviewed expenses remain separate.
- **Net recorded cash flow:** recorded income minus recorded spending. It is not take-home pay or taxable profit.
- A mixed expense rounds its business portion to cents and uses the remainder as personal, so the portions always sum to the original amount.
- Charts, review counts, receipt coverage, and report totals derive from filtered records rather than fixed dashboard numbers.

Tax estimation is unavailable. Business classification and suggested categories do not confirm deductibility. No tax rate, deduction cap, mileage deduction rate, Schedule C mapping, or tax filing is implemented. Reports export descriptive categories and explain that tax mapping is not included.

The audit reports **16 steps including 14 question screens**, with bank connection at **step 15**. The exact question wording has not been supplied. This demo does not invent those questions or claim they are all optional. Business identity and a proposed tax preparation draft are requested after setup with purpose explanations; neither blocks expense review or record exports. A future validated tax-estimation feature would need to request its genuinely required inputs at that point.

## Sample data and timing

Deterministic fictional USD records span **July–October 2026**: 23 transactions across two sample accounts, including five incomes, two transfers, business/personal/mixed expenses, and a starter queue of four unreviewed expenses. Three mileage entries demonstrate distance reporting. Sample records load once; adding them preserves manual records.

Baseline totals are $12,850 recorded income, $1,476.19 expenses marked as business, $294.94 classified personal spending, and $288.84 of unreviewed expenses. Use **All time** to show this whole set if presenting outside its date range.

**Time to first demo swipe** measures elapsed wall time from the first onboarding interaction to the first classification. It includes pauses and reloads. Undo preserves the original first-swipe time; restarting onboarding clears the timing while preserving records. This sample-data measurement excludes real signup and banking setup and does not prove the production two-minute promise.

## CSV conventions and export safety

CSV import supports quoted commas, quotes, line breaks, CRLF, and a UTF-8 BOM. Map date, description, amount, and optionally type. Dates must be `YYYY-MM-DD`; amounts must be valid USD decimal values (proper thousands separators are accepted).

- With a **type column**, use `income`, `expense`, or `transfer`; the amount is stored as a magnitude.
- With **no type column**, negative amounts are expenses and positive amounts are income. This convention cannot identify transfers; map a type column to import those.
- The preview flags invalid dates, amounts, descriptions, and types. Correct rows inline or exclude them. The demo limits imports to 2,000 rows at a time.
- Suspected duplicates match **selected account + date + normalized description + amount + type**, including earlier rows in the same file. They are excluded by default and require explicit approval. This heuristic cannot detect every economic duplicate.
- CSV exports quote and escape fields and prefix potentially executable spreadsheet cells with an apostrophe. Legitimate formula-like descriptions therefore remain text.

Transaction CSVs include classification, category, business/personal allocations, account, review status, notes, and receipt presence. Mileage CSVs include original distance/unit and explicitly converted distance/unit. JSON export contains all local records and base64 receipt files; **JSON restore/import is not implemented**.

## Local storage and receipts

IndexedDB (`earnist-local-demo`, object-store version 2) stores the shared records and receipt blobs. **Record schema version 3** adds rules and profile drafts. Version 2 records migrate without removing accounts, classifications, receipts, mileage, or preferences. Updates serialize through the store and save atomically before the UI reports success. Invalid or incompatible saved record structures recover to a fresh workspace with a notice; write failures show a retry action. Receipt replacement/deletion removes unreferenced files.

JPG, PNG, and PDF receipts are limited to **10 MB per file** and checked for allowed MIME type and file signature. Images preview locally; PDFs are downloaded for viewing. No OCR, extraction, malware scanning, or AI verification is claimed.

Data belongs to this browser and origin. Private mode, browser clearing, storage quotas, and a different localhost port can affect availability. There is no server backup, encryption guarantee, device synchronization, or cross-tab synchronization. Use one active tab and export records you want to keep. The optional browser-local account is a convenience sign in, not a server-authenticated account or a security boundary for stored records. A complete reset removes all Earnist demo records, files, preferences, and timing; restarting onboarding preserves financial records.

## Project structure

```text
src/
  App.tsx                  Routed shell, navigation, notices
  main.tsx                 Router and shared store entry point
  styles.css               Shared responsive, focus, motion, print styles
  domain/
    models.ts              Typed records and relationships
    sample.ts              Deterministic sample and empty records
    finance.ts             Allocations, totals, validation, undo, conversion
    rules.ts               Merchant matching, previews, safe rule application
    demoPolicy.ts          Shared demo-access wording
    csv.ts                 Parsing, mapping, duplicate detection, safe exports
    receipts.ts            Receipt validation
    download.ts            Local download helper
    finance.test.ts        Focused domain tests
    rules.test.ts          Rule behavior and record migration tests
  data/
    database.ts            Versioned IndexedDB and atomic persistence
    Store.tsx              Shared state and serialized updates
  components/              Controls, modal, editor, receipts, CSV, charts, swipe card
  pages/                   Onboarding, eight application areas, Demo guide
tests/workflows.spec.ts    Original desktop/mobile workflow tests
tests/client-demo.spec.ts  Connected client journey, rules, profile, migration
playwright.config.ts      Chrome desktop and Pixel 7 emulation
vite.config.ts            Vite and Vitest configuration
```

## Verification

Verified with Node.js 24: production build and type checks passed, **25 domain tests** passed, and **28 production-browser workflow cases** passed across Chrome desktop and Pixel 7 emulation. This includes the full first-swipe → dashboard → mixed correction → receipt → rule → export → reload client journey, rule previews/editing/disabling/conflicts and CSV application, resumable profile drafts, migration with receipt preservation, plus all original workflows. Desktop, mobile, and 320px screenshots were inspected. The existing development server was left running.

Vitest covers classification guards, split cent rounding, undo restoration, derived totals, filters, sample idempotence, receipt coverage, mileage conversion, schema validation/migration, merchant rule matching/application, CSV parsing/validation/duplicates, safe exports, and receipt validation. Browser tests exercise the connected client journey, rules, profiles, onboarding, rapid duplicate clicks, keyboard/touch review, corrections, receipts, imports, mileage, report filtering/export/print, empty-record workflows, reset, persistence, simulation retry, and narrow layouts.

Playwright uses an installed **Google Chrome**. If Chrome is unavailable, run `npx playwright install chromium` and remove `channel: 'chrome'` from `playwright.config.ts`. Browser emulation is not physical-device or Safari testing. Print checks exercise the print action and print CSS; the operating system's Save PDF dialog is not automated.

For a restricted Windows environment with Node.js 24, native config loading avoids parent-directory access by esbuild. To test a separate production preview without disturbing an existing dev server:

Start `npm run preview -- --configLoader native --port 5277 --strictPort` in a separate terminal, then run the commands below in another terminal. Playwright reuses that preview. Stop the preview with Ctrl+C afterward. This also avoids Windows test-runner process-tree cleanup restrictions.

```powershell
npm run build
npm test -- --configLoader native
$env:EARNIST_TEST_PREVIEW = '1'
$env:EARNIST_TEST_PORT = '5277'
npm run test:e2e
Remove-Item Env:EARNIST_TEST_PREVIEW
Remove-Item Env:EARNIST_TEST_PORT
```

## Production integration boundaries

Production would require authenticated users, server storage and backup, authorization, tested financial-account consent/integration flows, audited import/reconciliation logic, receipt security controls, and validated tax-profile rules before estimation or official mappings. Those services should replace the local data adapter and simulation explicitly rather than changing the meaning of existing demo labels.

No real banking, server-side authentication, payments, tax filing, AI audits, OCR, or accountant marketplace is implemented. Public-site access was unavailable during implementation; branding follows the supplied black/white/electric-lime direction and useful existing demo content. Proposed MVP features are not claims about tested Earnist production capabilities or private screens. Nothing has been deployed.


## October 2026 client refinement

The latest written brief is implemented in the existing React prototype. Customer navigation is Home, Swipe, Ready to file, Reports, and More. Home leads with documentation completion; the score awaits a confirmed policy. Swipe sessions handle up to 20 expenses. More preserves recurring rules, income, mileage, profile, accounts, manual cash entry, personal transactions, and restorable trash. Receipts accept camera photos and email/text screenshots using the existing attachment validator.

Bank statements reuse the existing local file store (no database upgrade) with account/period metadata, previews, processing states, and CSV reconciliation. PDF/image extraction is not available. Identical source files and known CSV duplicates are excluded. Statement reconciliation allows only rows within its declared period.

Ready to file includes four record-review prompts and an explicit prototype AI review. The review is invalidated when underlying records change. Download report creates one standalone HTML file embedding available supporting statements/receipts, plus links to the existing CSV exports. Print / Save PDF remains available.

See [CLIENT_CONFIRMATIONS.md](CLIENT_CONFIRMATIONS.md) for specific decisions awaiting Adrian. Pricing/trial/AI/scoring/marketplace behavior remains clearly identified as unconfigured or a preview. The client presentation guide remains addressable for review outside the customer navigation.

`tests/refinement.spec.ts` checks the new desktop/mobile journeys, session completion, receipt capture, statement reconciliation and duplicate protection, report contents and HTML escaping, trash restoration, narrow layouts, empty states, web plan choices, and the CPA placeholder.


### Updated reference alignment

The October 9 client brief is reflected in the persona -> web plan choice -> first swipe journey. The public Earnist Pro price ($6/month) is used in the subscription preview; production trial duration remains awaiting confirmation. Mobile skips this choice. Home shows a documentation score calculated from receipt and purpose-note coverage for reviewed business expenses. Ready to file requires explicit swipe and statement confirmation before the demo final review. See CLIENT_CONFIRMATIONS.md for the remaining business decisions.


### Swipe gestures and demo replay

Swipe right for Business, left for Personal, up for Skip for later, and down for Move to trash. Matching buttons and arrow-key controls are available; Up/Down keyboard actions require card focus. Scroll outside the card on touch devices. Swipe no longer exposes Undo; correct classifications in Transactions or restore deleted cards in More -> Trash. The Swipe header links directly to Trash, where permanent deletion uses the existing confirmation and receipt cleanup.

Review demo cards resumes pending practice expenses or starts a fresh 20-card session after completion. It resets only the demo account, preserves receipts and notes on active cards, keeps trashed cards in Trash, and fills missing practice slots with fresh fictional records. Existing checking/card/manual transactions retain their decisions.


### Client presentation refinement

The shared presentation stylesheet preserves Earnist's lime/black/white direction while improving type sizes, paper surfaces, chart spacing, and screen hierarchy. Home prioritizes documentation and gives quick access to review, receipts, statements, and reports. More is a grouped dropdown on desktop and mobile, with keyboard navigation, Escape/outside-click dismissal, and direct manual cash-expense entry using the existing editor. The tools page remains available from the menu. Receipts has a transaction chooser that leads into the existing camera/image/PDF handling; statements summarize actual uploaded files, linked accounts, and pending reviews. A transparent receipt-and-note scoring formula has since been added; no AI integration or backend was added.

### Appearance

Use the sun/moon button in the top bar to switch between light and dark mode (also available during onboarding). The initial mode follows the device setting; an explicit choice is saved locally and survives refresh. Both palettes keep Earnist's lime accent. Printed and downloaded reports retain a light paper background.
"# Earnist" 
