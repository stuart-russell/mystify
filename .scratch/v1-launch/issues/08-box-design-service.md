Status: ready-for-agent

## Parent

PRD: `.scratch/v1-launch/PRD.md`

## What to build

CRUD for the BoxDesign model and an admin UI section so merchants can customize their unboxing page.

**Box Design Service:**
- Create default BoxDesign when a new MysteryBox is created (all nullable fields, `animationStyle: "default"`)
- Read/Update BoxDesign by mysteryBoxId
- Delete BoxDesign when MysteryBox is deleted (cascade or manual cleanup)

**Admin UI:**
- Add a "Design" section to the box edit page (`/app/boxes/:boxId/edit`) or a separate tab
- Fields:
  - **Animation style** — dropdown/select with preset options (start with 2-3: "default" box flip, "slide" reveal, "fade" reveal). Store as string enum values.
  - **Box image** — Shopify image picker or URL input for the closed-box image shown before unboxing
  - **Open sound** — URL input for an audio file played on reveal
  - **Background color** — hex color picker input
  - **Background image** — URL input for a background image on the unbox page
- All fields are optional except animation style (which defaults to "default")
- Changes save with the existing edit-box SaveBar pattern

**On the create-box flow:** Optionally add a Design step, or defer until after initial save (edit-only). Recommendation: defer to edit-only for now to keep the create flow simple.

## Acceptance criteria

- [ ] BoxDesign record auto-created when a MysteryBox is created
- [ ] BoxDesign record deleted when MysteryBox is deleted
- [ ] Admin edit page has a Design section with all five fields
- [ ] Animation style dropdown shows 2-3 preset options
- [ ] Image/sound/background fields accept URL input
- [ ] Color field uses a color picker
- [ ] Design changes save via existing SaveBar pattern
- [ ] Default values applied for new BoxDesign records

## Blocked by

- `01-prisma-migration` (needs BoxDesign model)
