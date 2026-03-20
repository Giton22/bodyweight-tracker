<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
</script>

<template>
  <div class="space-y-6 lg:space-y-8">
    <Card v-for="i in 4" :key="i" class="shadow-warm">
      <CardContent class="flex flex-col gap-4 pt-6">
        <div class="flex items-center justify-between">
          <Skeleton class="h-6 w-32" />
          <Skeleton class="h-5 w-16" />
        </div>
        <Skeleton class="h-[140px] w-full" />
        <Skeleton class="h-4 w-48" />
      </CardContent>
    </Card>
  </div>
</template>
