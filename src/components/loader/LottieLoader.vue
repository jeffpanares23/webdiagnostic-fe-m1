<template>
  <transition name="fade-scale" appear>
    <div
      v-if="visible"
      class="flex flex-col items-center justify-center h-screen bg-white"
    >
      <DotLottieVue
        :src="animationSource"
        style="height: 300px; width: 300px"
        autoplay
        loop
      />
    </div>
  </transition>
</template>

<script setup>
import { DotLottieVue } from "@lottiefiles/dotlottie-vue";
import { computed, defineProps, ref } from "vue";

const props = defineProps({
  type: {
    type: String,
    default: "login", // "login" | "logout"
  },
  userType: {
    type: String,
    default: "client", // "client" | "internal"
  },
});

const visible = ref(true);

const animationSource = computed(() => {
  return "https://lottie.host/a320513e-508b-47fc-997a-5e2f2ad5bbb3/QvP4AEzyKc.lottie"; // Logout animation
});
</script>

<style scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
