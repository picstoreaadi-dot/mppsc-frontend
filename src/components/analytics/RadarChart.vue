<template>
  <div class="w-full max-w-2xl mx-auto">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Chart, registerables } from 'chart.js'
import { storeToRefs } from 'pinia'
import { useAnalyticsStore } from '@/stores/analytics'
import { useSettingsStore } from '@/stores/settings'
import { TOPICS } from '@/types'

Chart.register(...registerables)

const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

const analyticsStore = useAnalyticsStore()
const settingsStore = useSettingsStore()
const { topicStats } = storeToRefs(analyticsStore)
const { language, darkMode } = storeToRefs(settingsStore)

onMounted(() => {
  createChart()
})

watch([topicStats, language, darkMode], () => {
  updateChart()
})

function createChart() {
  if (!chartCanvas.value || topicStats.value.length === 0) return

  const labels = topicStats.value.map(t => {
    const topic = TOPICS.find(topic => topic.id === t.topic)
    return language.value === 'hi' ? topic?.name_hi : topic?.name_en
  })

  const data = topicStats.value.map(t => t.accuracy_percentage)

  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return

  chartInstance = new Chart(ctx, {
    type: 'radar',
    data: {
      labels,
      datasets: [
        {
          label: language.value === 'hi' ? 'आपका प्रदर्शन' : 'Your Performance',
          data,
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 2,
          pointBackgroundColor: 'rgb(59, 130, 246)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgb(59, 130, 246)',
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: {
            stepSize: 20,
            color: darkMode.value ? '#94A3B8' : '#64748B',
            font: {
              size: 11,
            },
          },
          grid: {
            color: darkMode.value ? '#334155' : '#E2E8F0',
          },
          pointLabels: {
            color: darkMode.value ? '#E0E0E0' : '#1E293B',
            font: {
              size: language.value === 'hi' ? 11 : 12,
              family: language.value === 'hi' ? 'NotoSansDevanagari, sans-serif' : 'system-ui',
            },
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              return `${context.parsed.r.toFixed(1)}%`
            },
          },
        },
      },
    },
  })
}

function updateChart() {
  if (!chartInstance) {
    createChart()
    return
  }

  const labels = topicStats.value.map(t => {
    const topic = TOPICS.find(topic => topic.id === t.topic)
    return language.value === 'hi' ? topic?.name_hi : topic?.name_en
  })

  const data = topicStats.value.map(t => t.accuracy_percentage)

  chartInstance.data.labels = labels
  chartInstance.data.datasets[0].data = data
  chartInstance.data.datasets[0].label = language.value === 'hi' ? 'आपका प्रदर्शन' : 'Your Performance'

  if (chartInstance.options.scales?.r) {
    chartInstance.options.scales.r.ticks = {
      ...chartInstance.options.scales.r.ticks,
      color: darkMode.value ? '#94A3B8' : '#64748B',
    }
    chartInstance.options.scales.r.grid = {
      ...chartInstance.options.scales.r.grid,
      color: darkMode.value ? '#334155' : '#E2E8F0',
    }
    chartInstance.options.scales.r.pointLabels = {
      ...chartInstance.options.scales.r.pointLabels,
      color: darkMode.value ? '#E0E0E0' : '#1E293B',
    }
  }

  chartInstance.update()
}
</script>
