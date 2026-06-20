# Cleanup Report

## Code Changes

### Removed

- Removed unused admin API route `POST /api/admin/assets/upload`
- Removed dead `uploadAsset` controller implementation
- Removed unused public frontend API helpers:
  - `fetchMenuItemBySlug`
  - `adminLogin`
  - `adminMe`
- Removed unused `isMock()` helper from `frontend/js/api.js`

### Refactored

- Replaced permissive generic admin CRUD writes with explicit resource allowlists
- Aggregated duplicate menu items in order creation so duplicate cart entries become a single order line
- Bound newsletter submission logic to every `data-newsletter-form` instead of only the first match
- Switched homepage testimonials to live API data with static fallback
- Switched site-wide social/settings integration to live `/api/settings` data with static fallback

### Deployment Cleanup

- Added repository-level `.gitignore`
- Added repository-level `.env.example`
- Added runtime config template injection for the static frontend container
- Removed insecure secret default from `docker-compose.yml`

## Dead Or Historical Artifacts Kept But Documented

| Item | Reason Kept |
| --- | --- |
| `.trae/` | Local IDE planning artifacts, not part of deployment |
| `bflux-main/readme.md` | Useful backend-specific reference even though root `README.md` is now primary |
| `frontend/js/data.js` | Serves as fallback content and local mock content when APIs are unavailable |
| `GET /api/delivery-zones` | Not currently consumed by the frontend, but still needed for future delivery estimation and admin management |

## Duplicate Assessment

- No second active frontend application exists; `frontend/` is authoritative.
- No duplicate backend application exists; `bflux-main/` is authoritative.
- `client/` is not present on disk and is treated as legacy residue only.
- Admin API logic is centralized in `frontend/admin/js/admin-api.js`; duplicated admin helpers in `frontend/js/api.js` were removed.

## Safety Notes

- Local `.env` files were not deleted automatically to avoid destroying user-managed secrets.
- No destructive git operations were used.
