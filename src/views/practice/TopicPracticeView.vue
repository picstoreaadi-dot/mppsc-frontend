<template>
  <div style="min-height: 100vh; background: #0f172a; padding-bottom: 6rem;">
    <LanguageToggle />

    <!-- Header -->
    <div style="background: #1e293b; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3); position: sticky; top: 0; z-index: 10;">
      <div style="max-width: 80rem; margin: 0 auto; padding: 1rem 1.5rem;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <button @click="$router.back()" style="padding: 0.5rem; border-radius: 0.5rem; background: rgba(59, 130, 246, 0.1); border: none; cursor: pointer;">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <h1 style="font-size: 1.5rem; font-weight: 700; color: white;">Topic Practice</h1>
          <div style="width: 2.5rem;"></div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div style="max-width: 80rem; margin: 0 auto; padding: 2rem 1.5rem;">
      <div style="text-align: center; padding: 4rem 2rem;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">📚</div>
        <h2 style="font-size: 1.5rem; font-weight: 700; color: white; margin-bottom: 0.5rem;">Topic Practice</h2>
        <p style="color: #94a3b8;">Select a topic from the dashboard to start practicing</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LanguageToggle from '@/components/common/LanguageToggle.vue'
</script>
