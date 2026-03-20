<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { Icon } from '@iconify/vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const props = defineProps<{
  title: string
  icon?: string
  editing: boolean
  summary?: string
  description?: string
  class?: HTMLAttributes['class']
}>()

const emit = defineEmits<{
  (e: 'edit'): void
  (e: 'cancel'): void
}>()
</script>

<template>
  <Card
    :class="
      cn(
        'border-l-[3px] border-l-primary/40 transition-all duration-200 hover:shadow-warm-md',
        editing && 'shadow-warm-md',
        props.class,
      )
    "
  >
    <CardHeader class="flex flex-row items-start justify-between gap-3 space-y-0 pb-2">
      <div class="min-w-0 flex-1">
        <CardTitle class="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Icon v-if="icon" :icon="icon" class="h-4 w-4 text-primary" />
          <span>{{ title }}</span>
        </CardTitle>
        <p v-if="summary" class="mt-2 text-2xl font-bold leading-tight">
          {{ summary }}
        </p>
        <p v-if="description" class="mt-1 text-xs text-muted-foreground">
          {{ description }}
        </p>
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <slot v-if="editing" name="header-actions" />
        <Button
          v-if="editing"
          type="button"
          variant="ghost"
          size="sm"
          class="h-8"
          @click="emit('cancel')"
        >
          Cancel
        </Button>
        <Button v-else type="button" variant="outline" size="sm" class="h-8" @click="emit('edit')">
          Edit
        </Button>
      </div>
    </CardHeader>
    <CardContent
      :class="
        cn(
          'transition-all duration-200',
          editing ? 'grid grid-rows-[1fr] opacity-100' : 'grid grid-rows-[0fr] opacity-0',
        )
      "
    >
      <div class="overflow-hidden">
        <slot />
      </div>
    </CardContent>
  </Card>
</template>
