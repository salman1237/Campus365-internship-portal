# Appointment Letter Pad Template — Plan

## Goal
Build a web preview of a professional, reusable Campus365 / Skoder Technologies appointment-letter pad template. The page should look like a real printed letterhead with editable placeholder fields.

## What I'll build

1. **New route**: `/appointment-letter` in `src/routes/appointment-letter.tsx`.
2. **Letterhead component** that renders:
   - Header block with Campus365 logo mark, company name, "A Skoder Technologies Concern", BIN and Trade license numbers.
   - Company address and contact line.
   - Date field.
   - Recipient block (To, Name, Institution/Address).
   - Subject line.
   - Editable body paragraphs with placeholder text for role, dates, hours, stipend/status, responsibilities, confidentiality, and certificate.
   - Closing and authorized signatory block.
   - Footer with partner logos line and contact details.
3. **Editable form sidebar** so the user can fill in the template fields and see the letter update live.
4. **Print-friendly styling** using a print media query to remove UI chrome and output a clean A4/US letter page.

## Design direction
- Keep the existing Campus365 / Skoder Technologies visual identity.
- Use a clean, corporate blue/navy and white palette with subtle borders.
- Typography: professional serif for the letter body ( Georgia / Times ), clean sans for headers ( Inter / system-ui ).
- Paper-like background in preview, crisp white letter sheet centered on screen.

## Files to create / edit
- `src/routes/appointment-letter.tsx` — new route component.
- `src/styles.css` — add a `@utility` for the letter paper shadow and print styles.
- `src/routes/__root.tsx` — add a nav link to the new route (optional, minimal).

## Verification
- Run the dev build and open `/appointment-letter`.
- Screenshot the preview and confirm the letterhead renders cleanly, fields update, and print view hides the sidebar.
