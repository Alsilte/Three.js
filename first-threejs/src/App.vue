<template>
  <div class="app">
    <Scene class="app__scene" :lightSettings="lightSettings" />
    <Menu class="app__menu" @update-lights="updateLights" />
  </div>
</template>

<script>
import Scene from './components/Scene.vue';
import Menu from './components/Menu.vue';

export default {
  name: 'App',
  components: {
    Scene,
    Menu
  },
  data() {
    return {
      lightSettings: {
        ambient: { enabled: true, intensity: 1 },
        directional: { enabled: false, intensity: 1 },
        point: { enabled: false, intensity: 1 },
        spot: { enabled: false, intensity: 1 },
        hemisphere: { enabled: false, intensity: 1 },
        rect: { enabled: false, intensity: 1 }
      }

    }
  },
  methods: {
    updateLights(newValues) {
      this.lightSettings = { ...newValues };
    }
  }
}
</script>

<style lang="scss">
.app {
  display: flex;
  height: 100vh;
  width: 100dvw;

  &__scene {
    height: 100%;
    width: 65%;
    border: 1px solid rgb(255, 255, 255);
  }

  &__menu {
    width: calc(100% - 65%);
    background-color: rgba(11, 121, 84, 0.637);
    overflow-y: auto;
  }
}
</style>