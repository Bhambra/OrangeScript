# OrangeScript - 30 Second Demo Script

> **Tip:** Record at 1x speed, then speed up to 1.5-2x in editing to fit 30 seconds.
> Use Mac Cmd+Shift+5 or Windows Win+G to screen record.
> Resize browser to ~1280x800 for a clean look.

---

## Pre-Recording Setup
- Log in to the app at https://orangescript-app.vercel.app
- Make sure you have at least one existing patient with a signed Rx (for showing the signed stamp)
- Clear any test data you don't want visible
- Start screen recording

---

## Scene 1: Add & Delete a Patient (~5s)

1. Click **"+ New Patient"** button in the left panel
2. Type: Name = `Rahul Mehra`, Phone = `9876543210`, Gender = `M`, Age = `35`
3. Click **Save** — patient appears in the list
4. Click the **delete icon (x)** next to the patient name
5. Confirm deletion — patient disappears

---

## Scene 2: Create a Prescription with Sections (~8s)

1. Select an existing patient from the left panel
2. The Rx editor loads with a blank prescription
3. In the **Symptoms** textarea, type `\` — the phrase dropdown appears
4. Select **"intermittent fever for 3 days with body ache"** — it appears in blue
5. Press **Cmd+D** (or Ctrl+D) — a **Running Diagnosis** section is added
6. In Diagnosis, type `\viral` — ICD-10 API results appear live — select **"Viral fever, unspecified"**
7. Press **Cmd+R** — **Rx** section is added
8. Type `\parac` — select **"Paracetamol 650mg"** from dropdown
9. After it, type: `, Tab Dolo 650 1-0-1 x 5 days`

---

## Scene 3: Create Your Own Shortcut (~4s)

1. In the Rx section, type `\`
2. Type `Dolo 650 1-0-1 x 5 days;` (note the semicolon at the end)
3. Toast appears: **"Phrase saved"**
4. Now type `\dolo` — your custom phrase appears at the top of the dropdown!

---

## Scene 4: Navigate Between Prescriptions (~3s)

1. Click **"+ New Rx"** button (or Cmd+Down) — a new blank Rx page is created
2. Notice the **carousel dots** at the bottom — two dots now
3. Click the **first dot** — switches back to the previous Rx
4. Click the **second dot** — switches to the new blank Rx
5. You can also use **Cmd+Left / Cmd+Right** to navigate

---

## Scene 5: Save & Sign a Prescription (~5s)

1. Go back to the prescription with content (Scene 2)
2. Click **"Save Rx"** (or Cmd+S) — status shows "Saved"
3. Click **"Sign Rx"** — confirmation modal appears
4. Click **Confirm** — green "SIGNED" stamp appears at bottom-right with date/time
5. Try clicking on a textarea — it's **disabled** (read-only)
6. Notice "Discard Rx" button is now **disabled** with tooltip
7. Click **"Download"** — PNG image downloads

---

## Scene 6: Save & Use Templates (~5s)

1. Click **"+ New Rx"** to create a fresh page
2. Add a few sections (Symptoms, Diagnosis, Rx) with content
3. In the left panel, find the **Templates** section, click **"+ Save as Template"**
4. Name it: `Viral Fever - Adult` → click **Save Template**
5. Now click **"+ New Rx"** again for a blank page
6. Click the **template name** in the left panel — sections auto-fill into the editor!
7. Notice: Known Conditions and Test Values are **NOT** overwritten

---

## End Screen

Pause for 2 seconds showing the full app with a signed prescription visible.

---

## Editing Tips

- **Speed up** repetitive parts (typing) to 2x-3x speed
- **Keep normal speed** for key moments: phrase dropdown, signing stamp, template apply
- Add **text captions** at the bottom for each scene if you want
- Background music: something light and upbeat (lo-fi or piano)
- Export at 1080p for best quality

## Suggested Caption Overlays

| Timestamp | Caption |
|-----------|---------|
| 0:00 | "Add patients in seconds" |
| 0:05 | "Smart sections with keyboard shortcuts" |
| 0:13 | "Create your own phrase shortcuts" |
| 0:17 | "Navigate between prescriptions" |
| 0:20 | "Sign to lock & download as image" |
| 0:25 | "Save templates for common prescriptions" |
| 0:28 | "OrangeScript - Digital Rx, made simple" |
