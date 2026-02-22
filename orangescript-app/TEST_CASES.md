# OrangeScript - Manual Test Cases

> **App URL:** https://orangescript-app.vercel.app
>
> **Last updated:** 22 Feb 2026
>
> Run through each section after every deploy. Check the browser console (F12 / Cmd+Option+J) for errors after each step.

---

## 0. App Load & TDZ Regression

These checks catch Temporal Dead Zone (TDZ) crashes where a `const` function is referenced before it is declared. They show up as `"Cannot access 'Xx' before initialization"` in the console and result in a blank white screen.

| # | Step | Expected |
|---|------|----------|
| 0.1 | Open the app URL in a fresh tab | App loads without a white screen; no `ReferenceError` in console |
| 0.2 | Log in with valid credentials | Dashboard loads; patient list appears or "no patients" message shows |
| 0.3 | Select any patient | Prescription editor loads; no TDZ crash |
| 0.4 | Hard-refresh the page (Cmd+Shift+R / Ctrl+Shift+R) | App reloads cleanly; no console errors |

---

## 1. Authentication & Session

| # | Step | Expected |
|---|------|----------|
| 1.1 | Open the app in two browser tabs simultaneously | Second tab shows "session active in another tab" warning; editor is disabled |
| 1.2 | Close the first tab, refresh the second | Second tab takes over the session normally |
| 1.3 | Log out and log back in | Patient list and prescriptions reload from Supabase correctly |

---

## 2. Patient Management

| # | Step | Expected |
|---|------|----------|
| 2.1 | Create a new patient with name, phone, gender, DOB | Patient appears in the left-panel list |
| 2.2 | Edit patient name and phone | Changes persist after page refresh |
| 2.3 | Delete (unlink) a patient | Patient removed from list; prescriptions are NOT deleted |
| 2.4 | Search / filter patients in left panel | List filters correctly by name |

---

## 3. Prescription Editor - Basic

| # | Step | Expected |
|---|------|----------|
| 3.1 | Select a patient, type in Symptoms textarea | Text appears; no errors |
| 3.2 | Add sections using section shortcuts (Cmd+D for Diagnosis, Cmd+R for Rx, etc.) | Sections appear in the prescription pad |
| 3.3 | Type `\` in any textarea | Phrase dropdown appears |
| 3.4 | Select a phrase from the dropdown | Phrase is inserted; text turns blue (highlighted) |
| 3.5 | Type a phrase followed by `;` | "Phrase saved" toast appears; phrase is available in future dropdowns |
| 3.6 | Type `\\` in a textarea | Custom section creation prompt appears |
| 3.7 | Edit the Follow Up section with a date picker | Date is set correctly |

---

## 4. Auto-Save & Cloud Persistence

| # | Step | Expected |
|---|------|----------|
| 4.1 | Type content in a prescription; wait 15 seconds | "Saved" status appears in the top bar; `rxSaveStatus` updates |
| 4.2 | Click "Save Rx" button manually | Prescription saves immediately; status shows "Saved" |
| 4.3 | Refresh the page; select the same patient | Prescription content is restored from Supabase |
| 4.4 | Verify Known Conditions persist | Known Conditions field shows previously saved conditions |
| 4.5 | Verify Test Values persist | Test Values field shows previously saved values |

---

## 5. Sign Rx

| # | Step | Expected |
|---|------|----------|
| 5.1 | Create a prescription with content; click "Sign Rx" | Confirmation modal appears: "Once signed, this prescription cannot be edited or discarded. Continue?" |
| 5.2 | Confirm signing | Toast: "Prescription signed"; button changes to "Signed" (disabled) |
| 5.3 | Check the prescription pad | Green "SIGNED" stamp appears at bottom-right with date/time |
| 5.4 | Try typing in any textarea on a signed Rx | All inputs are disabled / read-only |
| 5.5 | Check "Save Rx" button on a signed Rx | Button is disabled |
| 5.6 | Check "Discard Rx" button on a signed Rx | Button is disabled; tooltip says "A signed prescription cannot be discarded" |
| 5.7 | Refresh the page; select the same patient | Signed state persists from Supabase; stamp is still visible; inputs are still read-only |
| 5.8 | Use keyboard shortcut Cmd+Shift+S (or Ctrl+Shift+S) on an unsigned Rx | Confirmation modal appears (same as 5.1) |
| 5.9 | Use Cmd+Shift+S on an already-signed Rx | Toast: "Already signed"; no action taken |
| 5.10 | Try signing a prescription with unsaved changes | Rx auto-saves first, then the sign confirmation modal appears |

---

## 6. Download Rx

| # | Step | Expected |
|---|------|----------|
| 6.1 | Click "Download" on a prescription with content | PNG image downloads with filename `Rx_PatientName_YYYY-MM-DD.png` |
| 6.2 | Open the downloaded image | Image shows the prescription with doctor header, patient info, all sections, and (if signed) the signed stamp |
| 6.3 | Click "Download" on an empty prescription (no patient) | Toast: "No patient selected" or "No patient data to download" |
| 6.4 | Download a signed prescription | Image downloads correctly with signed content |

---

## 7. Discard Rx

| # | Step | Expected |
|---|------|----------|
| 7.1 | Create an unsigned prescription with content; click "Discard Rx" | Confirmation modal: "Discard this prescription? This cannot be undone." |
| 7.2 | Confirm discard | Toast: "Prescription discarded"; Rx is removed from carousel; page navigates to adjacent Rx or a new blank one |
| 7.3 | Refresh the page | Discarded Rx is gone from Supabase (does not reappear) |
| 7.4 | Try discarding a signed Rx via button | Button is disabled; nothing happens |
| 7.5 | Try Cmd+Delete (or Ctrl+Delete) on a signed Rx | Nothing happens (handler returns early) |
| 7.6 | Discard the last remaining Rx for a patient | A new blank Rx page is created automatically |
| 7.7 | Use Cmd+Delete (or Ctrl+Backspace) on an unsigned Rx | Confirmation modal appears (same as 7.1) |

---

## 8. Templates

| # | Step | Expected |
|---|------|----------|
| 8.1 | Save a prescription as a template | Template appears in the Templates panel on the left |
| 8.2 | Click a template to apply it on an unsigned Rx | Sections and ICD codes load into the editor |
| 8.3 | Verify Known Conditions field after applying a template | Known Conditions stays as the patient's existing conditions (NOT overwritten by template) |
| 8.4 | Verify Test Values field after applying a template | Test Values field is empty (NOT overwritten by template) |
| 8.5 | Click a template while on a **signed** Rx | Toast: "Cannot apply template to a signed prescription"; no changes made |
| 8.6 | Edit a template name and sections | Changes persist after refresh |
| 8.7 | Delete a template | Template removed from list; not available after refresh |

---

## 9. ICD-10 Live API Search (Diagnosis & Known Conditions)

| # | Step | Expected |
|---|------|----------|
| 9.1 | In Running Diagnosis section, type `\diab` | "Searching..." appears briefly, then ICD-10 results load (e.g. "Diabetes mellitus") |
| 9.2 | Select a diagnosis from the dropdown | Diagnosis is inserted; text turns blue (highlighted as a phrase) |
| 9.3 | In Known Conditions field, type `\hyper` | "Searching..." appears, then ICD-10 results load (e.g. "Hypertension") |
| 9.4 | Select a condition from Known Conditions dropdown | Condition is inserted; ICD code is stored |
| 9.5 | Add a custom diagnosis by typing it and pressing `;` | Custom phrase is saved; appears at the top of dropdown in future searches |
| 9.6 | Verify custom phrases appear above API results | Custom matches show first, then API results below |
| 9.7 | Type fewer than 2 characters after `\` | No API call made; dropdown doesn't show or shows only custom phrases |
| 9.8 | Disconnect internet, then type `\fever` in Diagnosis | No crash; custom phrases still work; API results silently fail |

---

## 10. Orange Health API Search (Tests Advised & Test Values)

| # | Step | Expected |
|---|------|----------|
| 10.1 | In Tests Advised section, type `\cbc` | "Searching..." appears briefly, then test results load (e.g. "Complete Blood Count") |
| 10.2 | Select a test from the dropdown | Test name is inserted; text turns blue (highlighted) |
| 10.3 | In Test Values field (Patient Details), type `\liver` | "Searching..." appears, then test results load (e.g. "Liver Function Test") |
| 10.4 | Select a test from Test Values dropdown | Test name is inserted |
| 10.5 | Add a custom test by typing it and pressing `;` | Custom phrase is saved; appears at top of dropdown in future |
| 10.6 | Verify custom test phrases appear above API results | Custom matches first, API results merged below |
| 10.7 | Disconnect internet, then type `\blood` in Tests Advised | No crash; custom phrases still work; API results fail silently |

---

## 11. Phrase Highlighting (Blue Text)

| # | Step | Expected |
|---|------|----------|
| 11.1 | Insert a built-in phrase (e.g. from Symptoms) via `\` picker | Phrase appears in blue |
| 11.2 | Insert an API-sourced diagnosis via `\` picker | Diagnosis appears in blue (not plain text) |
| 11.3 | Insert an API-sourced test via `\` picker | Test name appears in blue |
| 11.4 | Type the same text manually (not via picker) | Text does NOT appear in blue (only picker-inserted phrases highlight) |
| 11.5 | Navigate away from the patient and come back | Previously highlighted phrases remain blue (saved in page data) |

---

## 12. Keyboard Shortcuts

Test on Mac (use Cmd) and Windows (use Ctrl).

| # | Shortcut | Action | Expected |
|---|----------|--------|----------|
| 12.1 | Cmd+S / Ctrl+S | Save Rx | Prescription saves; no browser "Save Page" dialog |
| 12.2 | Cmd+Shift+S / Ctrl+Shift+S | Sign Rx | Sign confirmation modal appears |
| 12.3 | Cmd+Down / Ctrl+Down | New Rx | New blank prescription page created |
| 12.4 | Cmd+Delete / Ctrl+Delete | Discard Rx | Discard confirmation modal appears (if unsigned) |
| 12.5 | Cmd+Left / Ctrl+Left | Navigate to previous Rx | Carousel moves to previous page |
| 12.6 | Cmd+Right / Ctrl+Right | Navigate to next Rx | Carousel moves to next page |
| 12.7 | Cmd+D | Add Diagnosis section | Diagnosis section added to Rx |
| 12.8 | Cmd+R | Add Rx section | Rx section added |
| 12.9 | Cmd+T | Add Treatment section | Treatment section added |
| 12.10 | Cmd+O | Add Tests Advised section | Tests Advised section added |
| 12.11 | Cmd+F | Add Follow Up section | Follow Up section added |
| 12.12 | Cmd+S on a signed Rx | Save Rx (disabled) | Nothing happens (handler returns early for signed Rx) |
| 12.13 | Cmd+N | Browser opens new window | NOT intercepted by app (no conflict) |

---

## 13. Shortcuts Modal

| # | Step | Expected |
|---|------|----------|
| 13.1 | Click "Keyboard Shortcuts" button in the left panel | Modal opens showing all shortcuts organized in groups |
| 13.2 | Verify Mac vs Windows labels | Mac shows "Cmd" symbols; Windows shows "Ctrl+" text |
| 13.3 | Close the modal via X or clicking outside | Modal closes |

---

## 14. Carousel / Rx Navigation

| # | Step | Expected |
|---|------|----------|
| 14.1 | Create multiple Rx pages for one patient | Carousel dots appear at the bottom |
| 14.2 | Click different dots | Editor switches to the selected Rx |
| 14.3 | Signed Rx page dot | Dot appears green (distinct from orange active / grey unsaved) |
| 14.4 | Saved (but unsigned) Rx page dot | Dot appears light green |
| 14.5 | Active page dot | Dot appears orange |
| 14.6 | Click the `+` button in carousel | New blank Rx page created |

---

## 15. Read-Only Mode (Signed Rx)

| # | Step | Expected |
|---|------|----------|
| 15.1 | On a signed Rx, check all textareas | All textareas are disabled / read-only |
| 15.2 | Check Known Conditions field | Disabled / read-only |
| 15.3 | Check Test Values field | Disabled / read-only |
| 15.4 | Check date picker (Follow Up) | Disabled |
| 15.5 | Check section delete icons | Hidden (not shown on signed Rx) |
| 15.6 | Check the "SIGNED" stamp | Visible at bottom-right with correct date/time in IST |
| 15.7 | Verify auto-save does NOT trigger for signed Rx | No save calls in network tab; "Save Rx" stays disabled |

---

## 16. Patient Notes

| # | Step | Expected |
|---|------|----------|
| 16.1 | Add a note for a patient | Note appears in the notes section |
| 16.2 | Delete a note | Note removed; persists after refresh |
| 16.3 | Notes persist across sessions | Refresh the page; notes are still there |

---

## 17. Edge Cases & Error Handling

| # | Step | Expected |
|---|------|----------|
| 17.1 | Sign an Rx that has never been saved to Supabase | Rx is auto-saved first, then signed |
| 17.2 | Rapidly click "Sign Rx" multiple times | Only one sign request is sent; no duplicate toasts |
| 17.3 | Discard the only Rx for a patient | New blank Rx is created; app does not crash |
| 17.4 | Apply a template then immediately sign | Template content is signed correctly |
| 17.5 | Log out while Rx is dirty (unsaved) | No crash; dirty state is cleared on logout |
| 17.6 | Open app on mobile / small screen | Layout is responsive; no horizontal overflow |
| 17.7 | Open browser console; check for any errors during normal use | No errors or warnings (except expected network failures if offline) |

---

## 18. Cross-Browser Checks

| # | Browser | Expected |
|---|---------|----------|
| 18.1 | Chrome (latest) | All features work |
| 18.2 | Safari (latest) | All features work |
| 18.3 | Firefox (latest) | All features work |
| 18.4 | Edge (latest) | All features work |
| 18.5 | Mobile Safari (iPhone) | App loads; basic editing works |
| 18.6 | Mobile Chrome (Android) | App loads; basic editing works |

---

## Quick Smoke Test (5-minute checklist)

For a fast sanity check after each deploy:

1. Open the app -- no white screen, no console errors
2. Log in -- patient list loads
3. Select a patient -- Rx editor loads
4. Type `\fever` in Symptoms -- phrase dropdown appears, select one -- turns blue
5. Type `\diab` in Diagnosis -- ICD-10 API results appear, select one -- turns blue
6. Type `\cbc` in Tests Advised -- Orange Health API results appear, select one -- turns blue
7. Click "Save Rx" -- saves successfully
8. Click "Sign Rx" -- confirm -- stamp appears, inputs become read-only
9. Try typing on the signed Rx -- inputs are disabled
10. Click "Discard Rx" on signed Rx -- button is disabled
11. Click "+ New Rx" -- new blank page appears
12. Click "Download" -- PNG downloads with correct content
13. Apply a template -- Known Conditions and Test Values are NOT overwritten
14. Hover on buttons -- tooltips with keyboard shortcuts appear
15. Cmd+S / Ctrl+S -- saves (no browser Save dialog)
