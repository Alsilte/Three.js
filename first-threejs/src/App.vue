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
      class="app__scene"
      :lightSettings="lightSettings"           
      :environmentEnabled="environmentEnabled" 
      :hdrIntensity="hdrIntensity"             
    />

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
    <Menu 
      class="app__menu"
      :environmentEnabled="environmentEnabled"  
      :hdrIntensityValue="hdrIntensity"         
      @update-lights="updateLights"             
      @toggle-hdr="updateEnvironment"           
      @update-hdr-intensity="updateHDRIntensity" 
    />
  </div>
</template>

<script>
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
      environmentEnabled: false,  // Estado inicial del entorno HDR
      hdrIntensity: 0.75          // Intensidad inicial del HDR
    }
  },
  
  // Métodos para manejar eventos de los componentes hijos
  methods: {
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
}
</style>