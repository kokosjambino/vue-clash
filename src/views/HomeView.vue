<script>
import items from '@/seeders/items.js'

import CardCharacter from '@/components/UI/Card/CardCharacter.vue'
import CardStats from '@/components/UI/Card/CardStats.vue'

import 'vue3-carousel/dist/carousel.css'
import { Carousel, Slide, Navigation } from 'vue3-carousel'

export default {
  components: {
    CardCharacter,
    CardStats,
    Carousel,
    Slide,
    Navigation
  },
  data() {
    return {
      items: items,

      // corousel
      settings: {
        itemsToShow: 2,
        wrapAround: true,
        snapAlign: 'center'
      },
      breakpoints: {
        300: {
          itemsToShow: 1
        },
        700: {
          itemsToShow: 2
        }
      }
    }
  }
}
</script>

<template>
  <carousel :settings="settings" :breakpoints="breakpoints">
    <slide class="card__wrapper" v-for="item in items" :key="item.id">
      <CardCharacter
        :name="`${item.lvl} lvl`"
        :title="item.title"
        :imgUrl="item.img"
        :link="`/${item.alias}`"
      >
        <template v-slot:body>
          {{ item.descr }}
        </template>
        <template v-slot:footer>
          <CardStats :info="item.info" />
        </template>
      </CardCharacter>
    </slide>

    <!-- addons -->
    <template #addons>
      <navigation />
    </template>
  </carousel>
</template>
