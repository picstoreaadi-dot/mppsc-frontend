<template>
  <div class="w-full">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

interface Props {
  chartData?: {
    labels: string[]
    datasets: any[]
  }
}

const props = defineProps<Props>()
const chartCanvas = ref<HTMLCanvasElement | null>(null)

onMounted(() => {
  if (!chartCanvas.value || !props.chartData) return

  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return

  new Chart(ctx, {
    type: 'line',
    data: props.chartData,
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
        },
      },
    },
  })
})
</script>
