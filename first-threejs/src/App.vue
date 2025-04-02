<template>
  <div class="app">
    <!-- 
      Componente Scene: 
      - Recibe configuraciones de luces y entorno como props
      - Usa dos puntos (:) para enlace de datos unidireccional 

      :lightSettings="lightSettings"           // Enlaza la configuración de luces
      :environmentEnabled="environmentEnabled" // Enlaza el estado del entorno
      :hdrIntensity="hdrIntensity"             // Enlaza la intensidad HDR
    -->


    <Scene 
      ref="sceneComponent"
      class="app__scene" 
      :lightSettings="lightSettings" 
      :environmentEnabled="environmentEnabled"
      :hdrIntensity="hdrIntensity"
      :scaleX="scaleX"
      :scaleY="scaleY" />

    <!-- 
      Componente Menu:
      - Recibe configuraciones iniciales
      - Emite eventos personalizados cuando cambian los controles
      - @update-lights: Actualiza configuración de luces
      - @toggle-hdr: Activa/desactiva entorno HDR
      - @update-hdr-intensity: Cambia intensidad HDR

      :environmentEnabled="environmentEnabled"  // Inicializa estado del entorno
      :hdrIntensityValue="hdrIntensity"         // Inicializa intensidad HDR
      @update-lights="updateLights"             // Escucha evento de actualización de luces
      @toggle-hdr="updateEnvironment"           // Escucha evento de toggle HDR
      @update-hdr-intensity="updateHDRIntensity" // Escucha evento de cambio de intensidad

      
    -->
    <Menu class="app__menu" 
      :environmentEnabled="environmentEnabled" 
      :hdrIntensityValue="hdrIntensity"
      @update-lights="updateLights" 
      @toggle-hdr="updateEnvironment" 
      @update-hdr-intensity="updateHDRIntensity"
      @select-texture="updateTexture"
      @update-scale-x="updateScaleX"
      @update-scale-y="updateScaleY" />

  </div>
</template>

<script>
import Scene from '@/components/Scene.vue'
import Menu from '@/components/Menu.vue'


export default {
  name: 'App',
  // Registro de componentes hijos
  components: {
    Scene,
    Menu
  },

  // Datos reactivos: cualquier cambio se propaga automáticamente
  data() {
    return {
      // Configuración inicial de luces, cada luz tiene estado de habilitación e intensidad
      lightSettings: {
        ambient: { enabled: false, intensity: 1 },     // Luz ambiental
        directional: { enabled: false, intensity: 1 }, // Luz direccional
        point: { enabled: false, intensity: 1 },       // Luz de punto
        spot: { enabled: false, intensity: 1 },        // Luz de foco
        hemisphere: { enabled: false, intensity: 1 },  // Luz hemisférica
        rect: { enabled: false, intensity: 1 }         // Luz de área rectangular
      },
      environmentEnabled: true,  // Estado inicial del entorno HDR
      hdrIntensity: 1,
      scaleX: 1,
      scaleY: 1,
               // Intensidad inicial del HDR
    }
  },

  // Métodos para manejar eventos de los componentes hijos
  methods: {

    updateScaleY(newScaleY) {
      this.scaleY = newScaleY;
    },
    updateScaleX(newScaleX) {
      this.scaleX = newScaleX;
    },

    updateTexture(texture) {
      // Pasar la textura seleccionada al componente Scene
      this.$refs.sceneComponent.updateCubeTexture(texture);
    },
    // Actualiza la configuración de luces cuando cambia en el menú
    updateLights(newValues) {
      // Usa spread operator para crear una copia y disparar reactividad
      this.lightSettings = { ...newValues };
    },

    // Activa/desactiva el entorno HDR
    updateEnvironment(enabled) {
      console.log('actualizado', enabled);
      this.environmentEnabled = enabled;
    },

    // Cambia la intensidad del HDR
    updateHDRIntensity(intensity) {
      this.hdrIntensity = intensity;
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

  @media (max-width: 869px) {
    flex-direction: column; // Cambia el diseño a una columna

    &__scene {
      width: 100%; // La escena ocupa todo el ancho
      height: 50%; // La escena ocupa la mitad de la altura
    }

    &__menu {
      width: 100%; // El menú ocupa todo el ancho
      height: 50%; // El menú ocupa la otra mitad de la altura
    }
  }
}
</style>