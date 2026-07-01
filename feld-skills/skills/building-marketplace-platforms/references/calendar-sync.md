# Calendar Sync (iCal Two-Way) Reference

## Contents
- Export / import architecture
- iCal builder essentials
- Gotchas

---

## Phase 13, iCal calendar sync (patterns)

```
EXPORT: listings.calendar_token (uuid, secret) -> GET /api/calendar/<token>.ics
        -> VCALENDAR of confirmed bookings + owner blocks, SUMMARY "Reserved" (no PII)
IMPORT: external_calendars (listing_id, ical_url, last_synced_at, last_sync_error)
        -> cron every 4h: fetch -> parse VEVENTs -> write availability blocks
          (source = 'ical_import:<sub_id>' for targeted stale cleanup)
```

iCal builder essentials: `BEGIN:VCALENDAR/VERSION:2.0/PRODID/...`, `VEVENT` with
`DTSTART;VALUE=DATE` / `DTEND;VALUE=DATE` (DTEND **exclusive**), fold lines >75
octets with CRLF+space, `X-PUBLISHED-TTL:PT4H`.

Gotchas:
- **Return empty valid VCALENDAR, not 404, for unknown tokens**, apps permanently unsubscribe on 404.
- DTEND is the checkout day, not the last night.
- Test-fetch (`HEAD`, accept 405) a subscription URL before saving.
- Consolidate consecutive blocked days into ranges before emitting.

---
