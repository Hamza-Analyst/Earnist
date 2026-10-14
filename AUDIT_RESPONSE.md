# Earnist: demonstrate the changes, follow the records

Prepared by AiBit Sol for the local client demo. Source: **Earnist Summary by Aibit Sol Whatsapp +1 512 3555 234.pdf**, September 30, 2026, especially pages 2 and 5. These are the audit's reported observations, not an independent retest of Earnist's current production application.

The audit describes **16 steps, including 14 question screens**, with bank connection at **step 15**. It does not supply the exact wording and requirements of each question. The demo does not fabricate those questions, assume all are optional, or claim to replace genuine production consent and security requirements.

## What to show Adrian

Open **Demo guide** from the desktop sidebar or **Profile & settings → Demo guide** on mobile. It pairs reported problems with working workflows and offers direct navigation through the demonstration. It is optional and does not add a forced tour before the first swipe.

1. Enter the demo, select a work type or skip, and load the clearly labeled sample account.
2. In **Review**, mark Adobe Creative Cloud ($59.99) as business. Open **Overview**: business expenses increase from **$1,476.19 to $1,536.18**.
3. In **Transactions**, search Adobe, open the October 6 record, change Classification to Mixed and Business percentage to 60, attach a receipt, and save.
4. The business allocation becomes **$35.99**; the personal remainder is **$24.00**. The aggregate business total becomes **$1,512.18**. Cents are rounded once; both portions still sum to $59.99.
5. Reopen that saved record and choose **Create merchant rule**. Its category and 60% allocation prefill. Preview the match. Save without overwriting earlier reviewed records.
6. In **Reports**, inspect the total and receipt coverage, choose a period/account, and export Transaction CSV or use Print / Save PDF. CSV allocations sum to the displayed report total.
7. Reload. The corrected record, receipt file, rule, and unfinished review remain available.
8. Optionally add a new $100 Adobe Creative Cloud expense. The enabled exact merchant rule allocates **$60 to business expenses and $40 to personal spending**. Tax savings remain uncalculated.

Sample totals above assume the standard sample account was loaded into an otherwise empty workspace and the date filter is All time. The optional test card or additional manual/imported records change the totals; the interface always derives them from records.

## Reported issue to implemented response

| Area | Reported context / requested improvement | Working demonstration |
|---|---|---|
| Onboarding | 16 steps, 14 question screens, connection at step 15; installation prompt and lengthy tour before review | Brief demo entry, one optional work-type question, source choice, direct Review. Business and tax context follow later. No forced installation or tour. |
| Account connection | Account value appears too late | Early sample account and test card, with clear simulation labels, explanation, loading, error/retry, and records flowing into Review. Empty local records and CSV/manual entry remain available. |
| Financial language | Unsupported saved/deduction figures and missing income | Income, reviewed business allocations, personal allocations, and unreviewed expenses are separate. Transfers are excluded from income/spending. No tax savings or arbitrary limits are calculated. |
| Review control | Correct categories and mixed use, undo and skip | Category editing, percentage preview, business/personal controls, touch/keyboard equivalents, undo, skip/resume, reload persistence. |
| Records | Manage records after swiping | Search, filters, manual entry, editing, notes, receipt attachment/replacement/removal, deletion confirmation, bulk actions. |
| Repeated work | Preview and control merchant rules | Rules in primary navigation; create from a saved transaction or Rules, preview, edit, enable/disable, delete. Existing reviewed decisions remain. Ambiguous matches stay unreviewed. |
| Reports | Reports hidden under Money; naming conflicts | Reports in the main menu. Shared filtered totals, descriptive categories, mixed allocations, receipt coverage, underlying records, safe CSV export, printable summary. Menu/button names are consistent. |
| Profile | Collect information in context, resume later | Separate business and tax draft sections with purposes, optional proposed record context, explicit Save, persisted progress, report-year suggestions, and report context. No profile completion gates review or exports. |
| Trial / trust | Conflicting trial charging copy; unavailable store links | One shared demo-access policy: Free local demo, No expiry, No charges. No subscription, billing, invented production terms, or app-store links. |

## Merchant-rule behavior

- Rules match exact descriptions or contained merchant text, ignoring case and repeated whitespace. Contains is explicitly chosen; exact is the default.
- Enabled rules apply to **new unreviewed expenses** from manual entry, CSV import, or sample loading. Income, transfers, and explicitly reviewed/manual decisions are preserved.
- Creation and editing include a match preview and a $100 allocation example. Applying to existing unreviewed records is an **explicit unchecked opt-in**.
- More than one enabled match leaves the expense unreviewed. There is no hidden precedence rule.
- Editing/disabling/deleting a rule does not retroactively change reviewed records. Correct any individual record in Transactions.
- Rule application is an organization preference, not proof of deductibility, tax compliance, or recurring payment processing.

## Proposed contextual information requests

These fields are new demo design choices, not a mapping of the unknown original 14 prompts.

| Field | Purpose / consuming feature | Earliest request | Can be deferred in this demo? |
|---|---|---|---|
| Work type | Suggested categories in Review | Short setup | Yes; Skip for now |
| Display / business name | Workspace and report identity | Profile or report identity prompt | Yes |
| Business activity | Descriptive report context | Business profile after reviewing | Yes |
| Reporting year | Default date-range suggestion in Reports | Tax profile draft after reviewing | Yes; report filters remain editable |
| Tax country / jurisdiction | User-provided preparation context in report/JSON | Tax profile draft | Yes; no jurisdiction rules applied |
| Preparation notes | Questions/context for accountant in report/JSON | Tax profile draft | Yes |

When the actual questions become available, map each to its purpose, consuming feature, genuine requirement, earliest request, and skip/defer policy. A real estimation feature must request its validated required inputs before estimating. No amount of demo-profile completion enables a fictional tax engine here.

## Evidence and boundaries

Automated tests cover the complete client journey, derived totals, $100/60% allocation, rule preview/edit/disable/conflicts, future CSV/manual applications, deferred profile progress, export totals, receipt persistence, and migration from the previous version. Earlier workflows remain covered by the original browser suite.

Record schema version 3 migrates version 2 in place and preserves accounts, classifications, receipt relationships/files, notes, mileage, and preferences. The IndexedDB store version remains 2 because its object-store layout is unchanged.

No live banking, passwords, real billing, tax-limit formulas, AI audits/OCR, tax filing, or marketing SEO were added. Mileage remains available after the core workflow. Production trial/plan descriptions and the exact original question mapping require approved product inputs; this prototype does not present unverified terms as current Earnist policy.
