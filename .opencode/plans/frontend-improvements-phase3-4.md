# Frontend Improvements Plan: Phase 3 (Code Quality) & Phase 4 (UX)

## Phase 3: Code Quality & Organization

### 3.1 Extract Shared Date Utilities

**Problem:** 3 date formatting variants duplicated across 6 files, plus `todayISO()` duplicated across 4 files.

**Solution:** Create `src/lib/date.ts` with all shared date functions:

```ts
// src/lib/date.ts

/** Returns today's date as YYYY-MM-DD in local time */
export function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Format a date string as "Mon Jan 1" (short, for tables) */
export function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

/** Format a date string as "Monday, January 1, 2025" (long, for dialogs) */
export function formatDateLong(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

/** Format a timestamp (ms or Date) as "Jan 1" (compact, for chart axes) */
export function formatDateCompact(ms: number | Date): string {
  return new Date(ms).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}
```

**Files to update (remove inline definitions, import from `@/lib/date`):**

| File                            | Remove                    | Replace with                                            |
| ------------------------------- | ------------------------- | ------------------------------------------------------- |
| `stores/weight.ts:65`           | `todayISO()` function     | `import { todayISO } from '@/lib/date'`                 |
| `QuickLogWeight.vue:14`         | `todayISO()` function     | `import { todayISO } from '@/lib/date'`                 |
| `LogCaloriesDialog.vue:21`      | `localDateISO()` function | `import { todayISO } from '@/lib/date'` (rename usages) |
| `LogWeightDialog.vue:23`        | `localDateISO()` function | `import { todayISO } from '@/lib/date'` (rename usages) |
| `EditCaloriesDayDialog.vue:115` | `formatDate()`            | `import { formatDateLong } from '@/lib/date'`           |
| `EditWeightDialog.vue:47`       | `formatDate()`            | `import { formatDateLong } from '@/lib/date'`           |
| `RecentEntries.vue:58`          | `formatDate()`            | `import { formatDateShort } from '@/lib/date'`          |
| `DailyCaloriesTable.vue:29`     | `formatDate()`            | `import { formatDateShort } from '@/lib/date'`          |
| `WeightChart.vue:35`            | `formatDate()`            | `import { formatDateCompact } from '@/lib/date'`        |
| `KcalChart.vue:37`              | `formatDate()`            | `import { formatDateCompact } from '@/lib/date'`        |

---

### 3.2 Add Reverse Unit Conversion to `useUnits`

**Problem:** `useUnits.ts` has `convert(kg)` (kg-to-display) but no reverse function. 9+ locations manually do `value / 2.20462` or `value * 2.20462`.

**Solution:** Add `toKg(displayValue)` and `kgToDisplay(kg)` to `useUnits.ts`:

```ts
/** Convert a display-unit value back to kg */
function toKg(displayValue: number): number {
  return isKg.value ? displayValue : Math.round((displayValue / KG_TO_LBS) * 10) / 10
}

/** Format kg value as display string without unit label */
function kgToDisplayStr(kg: number): string {
  return String(convert(kg))
}
```

**Files to update (replace manual conversion with `toKg()`):**

| File                   | Line(s) | Current code                                   | Replace with                                                                                                                             |
| ---------------------- | ------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `QuickLogWeight.vue`   | 42      | `isKg ? val : val / 2.20462`                   | `toKg(val)`                                                                                                                              |
| `LogWeightDialog.vue`  | 72      | `isKg ? val : val / 2.20462`                   | `toKg(val)`                                                                                                                              |
| `EditWeightDialog.vue` | 65      | `isKg ? val : val / 2.20462`                   | `toKg(val)`                                                                                                                              |
| `SettingsView.vue`     | 51,57   | `kgToDisplay()` / `displayToKg()` inline funcs | Use composable `convert()` / `toKg()`                                                                                                    |
| `SetupView.vue`        | 47      | `n / 2.20462`                                  | `toKg(n)`                                                                                                                                |
| `groups.ts`            | 217     | `kg * 2.20462`                                 | Use `convert()` from `useUnits` (but this is a store, not a component -- needs the store's unit value passed in or accessed differently) |

Note: `groups.ts:217` is in a store action that receives `unit` as a parameter. The cleanest fix here is to add a **pure function** `kgToLbs(kg)` and `lbsToKg(lbs)` to `useUnits.ts` or `lib/utils.ts` that doesn't need the composable:

```ts
// Pure conversion helpers (no reactivity needed)
export const KG_TO_LBS = 2.20462
export function kgToLbs(kg: number): number {
  return Math.round(kg * KG_TO_LBS * 10) / 10
}
export function lbsToKg(lbs: number): number {
  return Math.round((lbs / KG_TO_LBS) * 10) / 10
}
```

For `SettingsView.vue` lines 149, 159, 160: These are in computed getters displaying weight ranges. They should use `convert()` from the composable since they have access to it.

---

### 3.3 Remove Dead Code

**Files to delete:**

- `src/components/dashboard/UnitToggle.vue` (27 lines, zero imports)
- `src/lib/mock-data.ts` (72 lines, zero imports)

---

### 3.4 Standardize Dialog Open/Close Pattern

**Current state:** 4 different patterns across 8 dialogs.

**Target:** 2 patterns (both are appropriate for different use cases):

- **Self-contained dialogs** (own their trigger): Use internal `open` ref with `v-model:open` -- `LogWeightDialog`, `LogCaloriesDialog`, `SetKcalGoalDialog`
- **Parent-controlled dialogs** (no trigger, opened externally): Use `defineModel<boolean>('open')` -- `EditWeightDialog`, `EditCaloriesDayDialog`, `CreateGroupDialog`, `JoinGroupDialog`, `RecentEntries` delete dialog

**Changes needed:**

- `EditWeightDialog.vue`: Replace `props.open` + `emit('update:open')` with `defineModel<boolean>('open')`. Remove defineProps/defineEmits for open, use `const open = defineModel<boolean>('open')` and `v-model:open` on Dialog.
- `EditCaloriesDayDialog.vue`: Same refactor.

---

### 3.5 Fix `as any` Casts in Groups Store

**Problem:** 3 `as any` casts to access PocketBase `expand` property.

**Solution:** Define typed expand interfaces in `src/lib/pocketbase.ts`:

```ts
// Add to pocketbase.ts

export interface GroupMemberWithUserExpand extends GroupMemberRecord {
  expand?: { user?: { id: string; name?: string; username?: string; email?: string } }
}

export interface GroupMemberWithGroupExpand extends GroupMemberRecord {
  expand?: { group?: GroupRecord }
}
```

Then update `groups.ts`:

- Line 26-27: Cast `r` as `GroupMemberWithUserExpand` instead of `any`
- Line 86: Cast `r` as `GroupMemberWithGroupExpand` instead of `any`

---

## Phase 4: UX Improvements

### 4.1 Add Empty States to Charts and Tables

**Install shadcn skeleton component** (optional -- could also use simple text empty states):

```bash
bunx shadcn-vue@latest add skeleton
```

**Components to add empty states:**

**WeightChart.vue:**

```vue
<template>
  <div v-if="data.length === 0" class="flex flex-col items-center justify-center py-12 text-center">
    <Icon icon="lucide:line-chart" class="h-10 w-10 text-muted-foreground/30" />
    <p class="mt-2 text-sm text-muted-foreground">No weight data in this range</p>
    <p class="text-xs text-muted-foreground">Log your first weight to see your chart</p>
  </div>
  <VisXYContainer v-else ... />
</template>
```

**KcalChart.vue:** Same pattern with calorie-specific messaging.

**DailyCaloriesTable.vue:** Add an empty `<TableRow>` with colspan message when `rows.length === 0`.

**RecentEntries.vue:** Same pattern.

---

### 4.2 Add Route Transitions

**Update `App.vue` template:**

```vue
<main>
  <RouterView v-slot="{ Component }">
    <Transition name="page" mode="out-in">
      <component :is="Component" />
    </Transition>
  </RouterView>
</main>
```

Add transition styles to `src/assets/index.css`:

```css
.page-enter-active,
.page-leave-active {
  transition: opacity 0.15s ease;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
}
```

This is a subtle opacity crossfade -- fast enough to not feel sluggish but enough to smooth page changes.

---

### 4.3 Add Page Titles

**Add `meta.title` to each route in `router/index.ts`:**

```ts
{ path: '/', name: 'dashboard', meta: { requiresAuth: true, title: 'Dashboard' }, ... },
{ path: '/settings', name: 'settings', meta: { requiresAuth: true, title: 'Settings' }, ... },
{ path: '/groups', name: 'groups', meta: { requiresAuth: true, title: 'Groups' }, ... },
{ path: '/groups/:id', name: 'group-detail', meta: { requiresAuth: true, title: 'Group' }, ... },
{ path: '/auth', name: 'auth', meta: { guestOnly: true, title: 'Sign In' }, ... },
{ path: '/setup', name: 'setup', meta: { guestOnly: true, title: 'Setup' }, ... },
{ path: '/:pathMatch(.*)*', name: 'not-found', meta: { title: 'Not Found' }, ... },
```

**Add `afterEach` hook:**

```ts
const APP_TITLE = 'Bodyweight Tracker'

router.afterEach((to) => {
  const title = to.meta.title as string | undefined
  document.title = title ? `${title} - ${APP_TITLE}` : APP_TITLE
})
```

**Update RouteMeta type:**

```ts
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    guestOnly?: boolean
    title?: string
  }
}
```

---

### 4.4 StatCard Accessibility Fix

**Problem:** Trend colors (green=down, red=up) are hardcoded and only communicated through color. Color-blind users can't distinguish them.

**Solution:** Add `aria-label` and a text indicator alongside the icon:

```vue
<span
  v-if="trend"
  class="flex items-center gap-1 text-xs"
  :class="
    trend === 'down'
      ? 'text-green-600 dark:text-green-400'
      : trend === 'up'
        ? 'text-red-600 dark:text-red-400'
        : 'text-muted-foreground'
  "
  :aria-label="`Trend: ${trendValue || trend}`"
>
  <Icon
    v-if="trend === 'down'"
    icon="lucide:trending-down"
    class="h-3 w-3"
    aria-hidden="true"
  />
  <Icon
    v-else-if="trend === 'up'"
    icon="lucide:trending-up"
    class="h-3 w-3"
    aria-hidden="true"
  />
  {{ trendValue }}
</span>
```

Also add `dark:` variants for the green/red colors so they're visible in dark mode.

---

## Summary

### Phase 3 Changes (Code Quality)

| #   | Task                          | Files                   | Impact                                |
| --- | ----------------------------- | ----------------------- | ------------------------------------- |
| 3.1 | Extract shared date utilities | 1 new + 10 updated      | Eliminate 10 duplicate functions      |
| 3.2 | Add reverse unit conversion   | 1 updated + 6 consumers | Eliminate 9 manual conversion inlines |
| 3.3 | Remove dead code              | 2 deleted               | Remove 99 lines of unused code        |
| 3.4 | Standardize dialog patterns   | 2 updated               | Consistent pattern across codebase    |
| 3.5 | Fix `as any` casts            | 2 updated               | Type safety for PocketBase expand     |

### Phase 4 Changes (UX)

| #   | Task                   | Files     | Impact                                         |
| --- | ---------------------- | --------- | ---------------------------------------------- |
| 4.1 | Add empty states       | 4 updated | Users see helpful messages instead of empty UI |
| 4.2 | Add route transitions  | 2 updated | Smooth page changes                            |
| 4.3 | Add page titles        | 1 updated | Browser tab shows current page                 |
| 4.4 | StatCard accessibility | 1 updated | Color-blind users, dark mode, screen readers   |

### New files: 1 (`src/lib/date.ts`)

### Deleted files: 2 (`UnitToggle.vue`, `mock-data.ts`)

### Total files modified: ~20

### New dependencies: 0
