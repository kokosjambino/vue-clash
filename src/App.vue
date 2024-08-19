<script>
import HeaderCustom from '@/components/Header.vue'
import FooterCustom from '@/components/Footer.vue'

export default {
  components: {
    HeaderCustom,
    FooterCustom
  }
}
</script>

<template>
  <div class="wrapper">
    <HeaderCustom />
    <div class="wrapper-content">
      <section>
        <div class="container">
          <div class="view-sm isCenter">
            <nav>
              <RouterView />
            </nav>
          </div>
        </div>
      </section>
    </div>
  </div>
  <FooterCustom />
</template>

<style scoped></style>
