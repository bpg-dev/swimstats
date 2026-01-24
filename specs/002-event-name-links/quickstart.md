# Quickstart: Event and Meet Name Links

**Feature**: 002-event-name-links
**Date**: 2026-01-24

## Overview

This feature adds two types of clickable navigation links:

1. **Event names** → navigate to All Times page filtered by that event
2. **Meet names** → navigate to Meet Details page

## Prerequisites

- Node.js 18+
- npm or pnpm
- Frontend development server running

## Quick Setup

```bash
# Ensure you're on the feature branch
git checkout 002-event-name-links

# Install dependencies (if needed)
cd frontend && npm install

# Start development server
npm run dev
```

## Implementation Steps

### Step 1: Create EventLink Component

Create `frontend/src/components/ui/EventLink.tsx`:

```typescript
import { Link } from 'react-router-dom';
import { EventCode, getEventInfo } from '../../types/time';

interface EventLinkProps {
  event: EventCode;
  className?: string;
  children?: React.ReactNode;
}

export function EventLink({ event, className, children }: EventLinkProps) {
  const eventInfo = getEventInfo(event);
  const displayName = children ?? eventInfo?.name ?? event;

  return (
    <Link
      to={`/all-times?event=${event}`}
      className={`
        font-medium text-slate-900 dark:text-slate-100
        underline decoration-slate-300 dark:decoration-slate-600 underline-offset-2
        hover:text-blue-600 hover:decoration-blue-600
        dark:hover:text-blue-400 dark:hover:decoration-blue-400
        focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
        focus-visible:ring-offset-2 rounded
        transition-colors
        ${className ?? ''}
      `.trim()}
      aria-label={`View all times for ${eventInfo?.name ?? event}`}
    >
      {displayName}
    </Link>
  );
}
```

### Step 2: Create MeetLink Component

Create `frontend/src/components/ui/MeetLink.tsx`:

```typescript
import { Link } from 'react-router-dom';

interface MeetLinkProps {
  meetId: number;
  meetName: string;
  className?: string;
}

export function MeetLink({ meetId, meetName, className }: MeetLinkProps) {
  return (
    <Link
      to={`/meets/${meetId}`}
      className={`
        font-medium text-slate-900 dark:text-slate-100
        underline decoration-slate-300 dark:decoration-slate-600 underline-offset-2
        hover:text-blue-600 hover:decoration-blue-600
        dark:hover:text-blue-400 dark:hover:decoration-blue-400
        focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
        focus-visible:ring-offset-2 rounded
        transition-colors
        ${className ?? ''}
      `.trim()}
      aria-label={`View details for ${meetName}`}
    >
      {meetName}
    </Link>
  );
}
```

### Step 3: Update TimeHistory Component

In `frontend/src/components/times/TimeHistory.tsx`, replace event and meet name displays:

```typescript
import { EventLink } from '../ui/EventLink';
import { MeetLink } from '../ui/MeetLink';

// Replace event name display
// Before:
<div className="font-medium text-slate-900">
  {eventInfo?.name || time.event}
</div>

// After:
<EventLink event={time.event} />

// Replace meet name display
// Before:
<span className="text-slate-600">{time.meet_name}</span>

// After:
<MeetLink meetId={time.meet_id} meetName={time.meet_name} />
```

### Step 4: Update MeetTimesList Component

In `frontend/src/components/meets/MeetTimesList.tsx`, replace event name headers:

```typescript
import { EventLink } from '../ui/EventLink';

// Before:
<span className="font-medium text-slate-700">
  {eventInfo?.name ?? event}
</span>

// After:
<EventLink event={event as EventCode} />
```

### Step 5: Update AllTimesList Component

In `frontend/src/components/times/AllTimesList.tsx`, add meet links:

```typescript
import { MeetLink } from '../ui/MeetLink';

// Replace meet name display
// Before:
<span className="text-slate-600">{time.meet_name}</span>

// After:
<MeetLink meetId={time.meet_id} meetName={time.meet_name} />
```

### Step 6: Update Progress Page

In `frontend/src/pages/Progress.tsx`, wrap event name in chart title:

```typescript
import { EventLink } from '../components/ui/EventLink';

// Before:
<CardTitle>Time Progression - {selectedEventInfo?.name}</CardTitle>

// After:
<CardTitle>
  Time Progression - <EventLink event={selectedEvent} />
</CardTitle>
```

## Testing

### Run Tests

```bash
cd frontend
npm test
```

### Manual Testing Checklist

**Event Links:**

1. **Progress Page**:
   - [ ] Click event name in chart title → navigates to All Times with event filter
   - [ ] Tab to event name → focus ring visible
   - [ ] Press Enter on focused link → navigates

2. **Meet Details** (click any meet):
   - [ ] Click event name in times list → navigates to All Times with event filter

3. **TimeHistory Component**:
   - [ ] Click event name → navigates to All Times with event filter

4. **All Times Page**:
   - [ ] Event name is NOT a link (no circular navigation)

**Meet Links:**

1. **All Times Page**:
   - [ ] Click meet name → navigates to Meet Details page

2. **TimeHistory Component**:
   - [ ] Click meet name → navigates to Meet Details page

3. **Meet Details Page**:
   - [ ] Meet name in header is NOT a link (no circular navigation)

**Accessibility (both):**

- [ ] All links keyboard accessible (Tab, Enter)
- [ ] Focus states visible
- [ ] Screen reader announces links correctly

## Files Changed

| File | Change |
|------|--------|
| `frontend/src/components/ui/EventLink.tsx` | NEW - Reusable event link component |
| `frontend/src/components/ui/MeetLink.tsx` | NEW - Reusable meet link component |
| `frontend/src/components/times/TimeHistory.tsx` | MODIFY - Use EventLink and MeetLink |
| `frontend/src/components/times/AllTimesList.tsx` | MODIFY - Use MeetLink |
| `frontend/src/components/meets/MeetTimesList.tsx` | MODIFY - Use EventLink |
| `frontend/src/pages/Progress.tsx` | MODIFY - Use EventLink |
| `frontend/tests/components/links.test.tsx` | NEW - EventLink and MeetLink unit tests |
| `frontend/tests/components/progress.test.tsx` | MODIFY - Add event/meet link integration tests |
| `frontend/tests/components/meets.test.tsx` | MODIFY - Add event link integration tests |
| `frontend/tests/components/alltimes.test.tsx` | MODIFY - Add meet link integration tests |
| `frontend/tests/components/times.test.tsx` | MODIFY - Add event/meet link integration tests |

## Troubleshooting

### Link Not Navigating

- Verify event code is valid (check `VALID_EVENTS` in types/time.ts)
- Verify meet ID is a valid number
- Check React Router is properly configured
- Ensure Link component is from 'react-router-dom'

### Styling Issues

- Check TailwindCSS is processing the component file
- Verify dark mode classes have `dark:` prefix
- Check className prop is being merged correctly

### Accessibility Issues

- Ensure `aria-label` is set
- Verify `focus-visible` styles are present
- Test with actual keyboard (not just mouse)

### Meet ID Missing

- Ensure time entries include `meet_id` field
- Check API response includes meet ID
- Verify data types (number vs string)
