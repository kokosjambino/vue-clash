<template>
  <div class="card-stats">
    <div v-for="(stat, index) in info" :key="index" class="one-third">
      <div class="stat-value">{{ stat.value }}</div>
      <div class="stat">{{ stat.title }}</div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    info: {
      type: Array,
      required: true
    }
  }
}
</script>
