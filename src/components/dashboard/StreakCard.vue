<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { Card, CardContent } from '@/components/ui/card'
import { useStreaks } from '@/composables/useStreaks'

const { currentStreak, bestStreak, streakJustIncreased } = useStreaks()

withDefaults(
  defineProps<{
    variant?: 'default' | 'diary'
  }>(),
  {
    variant: 'default',
  },
)
</script>

<template>
  <Card
    class="overflow-hidden"
    :class="[
      variant === 'diary'
        ? 'border-border bg-card text-card-foreground shadow-warm-lg'
        : 'animate-card-enter shadow-warm',
      { 'streak-glow': streakJustIncreased && variant === 'default' },
    ]"
  >
    <CardContent
      class="flex items-center gap-4"
      :class="variant === 'diary' ? 'px-5 py-5' : 'py-3'"
    >
      <div
        class="flex size-10 items-center justify-center rounded-full"
        :class="
          variant === 'diary'
            ? currentStreak > 0
              ? 'bg-primary/15'
              : 'bg-muted'
            : currentStreak > 0
              ? 'bg-amber-100 dark:bg-amber-900/30'
              : 'bg-muted'
        "
      >
        <Icon
          icon="lucide:flame"
          class="size-5"
          :class="
            variant === 'diary'
              ? currentStreak > 0
                ? 'text-primary'
                : 'text-muted-foreground'
              : currentStreak > 0
                ? 'text-amber-500 dark:text-amber-400'
                : 'text-muted-foreground'
          "
        />
      </div>
      <div class="flex-1">
        <div class="flex items-baseline gap-2">
          <span
            class="font-black"
            :class="[
              variant === 'diary' ? 'text-2xl text-card-foreground' : 'text-2xl',
              { 'streak-bump': streakJustIncreased && variant === 'default' },
            ]"
          >
            {{ currentStreak }}
          </span>
          <span
            class="text-sm font-medium"
            :class="variant === 'diary' ? 'text-muted-foreground' : 'text-muted-foreground'"
          >
            {{ currentStreak === 1 ? 'day' : 'days' }} streak
          </span>
        </div>
        <p
          v-if="currentStreak > 0 && bestStreak > currentStreak"
          class="text-xs"
          :class="variant === 'diary' ? 'text-muted-foreground' : 'text-muted-foreground'"
        >
          Best: {{ bestStreak }} days
        </p>
        <p
          v-else-if="currentStreak > 0 && bestStreak === currentStreak && bestStreak > 1"
          class="text-xs font-medium"
          :class="variant === 'diary' ? 'text-primary' : 'text-amber-500 dark:text-amber-400'"
        >
          Personal best!
        </p>
        <p
          v-else-if="currentStreak === 0"
          class="text-xs"
          :class="variant === 'diary' ? 'text-muted-foreground' : 'text-muted-foreground'"
        >
          Log today to start your streak!
        </p>
      </div>
    </CardContent>
  </Card>
</template>
