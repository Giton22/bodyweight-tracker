<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useWeightStore } from '@/stores/weight'
import { useUnits } from '@/composables/useUnits'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const store = useWeightStore()
const { format } = useUnits()

const recentEntries = computed(() =>
  [...store.sortedEntries].reverse().slice(0, 10),
)

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Date</TableHead>
        <TableHead>Weight</TableHead>
        <TableHead>Note</TableHead>
        <TableHead class="w-[50px]" />
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-for="entry in recentEntries" :key="entry.id">
        <TableCell class="font-medium">{{ formatDate(entry.date) }}</TableCell>
        <TableCell>{{ format(entry.weightKg) }}</TableCell>
        <TableCell class="text-muted-foreground">{{ entry.note ?? '—' }}</TableCell>
        <TableCell>
          <Button
            variant="ghost"
            size="icon"
            class="h-8 w-8"
            @click="store.deleteEntry(entry.id)"
          >
            <Icon icon="lucide:trash-2" class="h-4 w-4 text-muted-foreground" />
          </Button>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>
