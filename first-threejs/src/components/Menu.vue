<template>
    <!-- 
        Contenedor principal del menú de configuración de luces
        - Usa v-for para iterar sobre diferentes tipos de luces
        - Cada luz tiene un checkbox para activar/desactivar
        - Slider para ajustar intensidad de cada luz
    -->
    <div class="menu">
        <h2 class="menu__title">Lighting Options</h2>
        
        <!-- 
            Iteración dinámica sobre configuraciones de luces
            - :key genera una clave única para cada elemento
            - v-model enlaza el estado de habilitación/intensidad
            - @change y @input disparan eventos de actualización
        -->
        <div v-for="(config, key) in lights" :key="key" class="menu__item">
            <!-- Checkbox reactivo para cada luz 
            
            v-model="lights[key].enabled"  // Enlace bidireccional de estado
            @change="emitLightUpdate"      // Emite evento al cambiar
                -->
            <input 
                type="checkbox" 
                :id="`${key}Light`" 
                :name="`${key}Light`" 
                v-model="lights[key].enabled"  
                @change="emitLightUpdate"      
            />
            <label :for="`${key}Light`">{{ formatLabel(key) }}</label>
            
            <!-- Slider de intensidad reactivo 
            
            v-model.number="lights[key].intensity"  // Enlace numérico de intensidad
            :min="range[key]?.min || 0"             // Rango mínimo dinámico
            :max="range[key]?.max || 2"             // Rango máximo dinámico
            :step="range[key]?.step || 0.1"         // Paso de incremento dinámico
            :value="lights[key].intensity" 
            @input="emitLightUpdate"                // Emite evento al modificar
            :disabled="!lights[key].enabled"        // Desactiva si luz no está habilitada
            -->
            <input 
                type="range" 
                v-model.number="lights[key].intensity"  
                :min="range[key]?.min || 0"             
                :max="range[key]?.max || 2"             
                :step="range[key]?.step || 0.1"         
                :value="lights[key].intensity" 
                @input="emitLightUpdate"                
                :disabled="!lights[key].enabled"        
            />
        </div>

        <!-- 
            Control de HDR 
            - Checkbox para activar/desactivar
            - Slider de intensidad solo visible cuando está activado

            v-model="hdrEnabled"      // Enlace de estado HDR
            @change="emitHDRToggle"   // Emite evento de cambio
        -->
        <div class="menu__item">
            <input 
                type="checkbox" 
                id="hdrToggle" 
                v-model="hdrEnabled"      
                @change="emitHDRToggle"   
            >
            <label for="hdrToggle">Activar HDR</label>
        </div>
        
        <!-- Slider de intensidad HDR (condicional) 
        
        v-model.number="hdrIntensity"   // Enlace numérico de intensidad
        :min="range.hdr?.min || 0"      // Rango mínimo dinámico
        :max="range.hdr?.max || 2"      // Rango máximo dinámico
        :step="range.hdr?.step || 0.1"  // Paso de incremento dinámico
        @input="emitHDRIntensity"       // Emite evento de cambio
        -->
        <div class="menu__item" v-if="hdrEnabled">
            <label for="hdrIntensity">HDR Intensity</label>
            <input 
                type="range" 
                id="hdrIntensity" 
                v-model.number="hdrIntensity"   
                :min="range.hdr?.min || 0"      
                :max="range.hdr?.max || 2"      
                :step="range.hdr?.step || 0.1"  
                @input="emitHDRIntensity"       
            />
        </div>
    </div>
</template>

<script>
export default {
    name: "Menu",
    
    // Props recibidas del componente padre
    props: {
        // Valor inicial del entorno HDR
        environmentEnabled: {
            type: Boolean,
            default: false
        },
        // Valor inicial de intensidad HDR
        hdrIntensityValue: {
            type: Number,
            default: 0.75
        }
    },
    
    // Estado local reactivo del componente
    data() {
        return {
            // Configuración inicial de luces 
            lights: {
                ambient: { enabled: false, intensity: 5 },      // Luz ambiental
                directional: { enabled: false, intensity: 2.5 },// Luz direccional
                point: { enabled: false, intensity: 250 },      // Luz de punto
                spot: { enabled: false, intensity: 50 },        // Luz de foco
                hemisphere: { enabled: false, intensity: 25 },  // Luz hemisférica
                rect: { enabled: false, intensity: 25 },        // Luz de área rectangular
            },
            // Rangos de intensidad para cada tipo de luz
            range: {
                ambient: { min: 0, max: 10, step: 0.5},
                directional: { min: 0, max: 5, step: 0.1 },
                point: { min: 0, max: 500, step: 0.1 },
                spot: { min: 0, max: 100, step: 0.1 },
                hemisphere: { min: 0, max: 50, step: 0.1 },
                rect: { min: 0, max: 50, step: 1 },
            },
            // Estado y configuración de HDR
            hdrEnabled: true,
            hdrIntensity: 0.75,
        };
    },
    
    // Hook de ciclo de vida: se ejecuta al crear el componente
    created() {
        // Inicializa valores desde props del padre
        this.hdrEnabled = this.environmentEnabled;
        this.hdrIntensity = this.hdrIntensityValue;
    },
    
    // Observadores para detectar cambios en props
    watch: {
        // Actualiza estado HDR si cambia en el padre
        environmentEnabled(newVal) {
            this.hdrEnabled = newVal;
        },
        // Actualiza intensidad HDR si cambia en el padre
        hdrIntensityValue(newVal) {
            this.hdrIntensity = newVal;
        }
    },
    
    // Métodos para emitir eventos al padre
    methods: {
        // Emite configuración actualizada de luces
        emitLightUpdate() {
            this.$emit('update-lights', { ...this.lights });
        },
        
        // Emite estado de activación de HDR
        emitHDRToggle() {
            this.$emit('toggle-hdr', this.hdrEnabled);
        },
        
        // Emite intensidad de HDR
        emitHDRIntensity() {
            this.$emit('update-hdr-intensity', Number(this.hdrIntensity));
        },
        
        // Formatea etiquetas de luces
        formatLabel(key) {
            const labels = {
                ambient: 'Ambiental',
                directional: 'Directional',
                point: 'Point',
                spot: 'Spot',
                hemisphere: 'Hemisférica',
                rect: 'React Area'
            };
            return labels[key] || key;
        }
    },
}
</script>

<style lang="scss" scoped>
// Estilos del menú
.menu {
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    font-family: Arial, sans-serif;
    padding-top: calc(40vh);
    color: white;
    
    &__title {
        font-size: 1.5rem;
        font-weight: bold;
        margin-bottom: 20px;
    }
    
    &__item {
        display: flex;
        align-items: center;
        margin-bottom: 15px;
        gap: 10px;
        
        input[type="checkbox"] {
            margin-right: 10px;
            accent-color: #ff0303;
        }
        
        input[type="range"] {
            width: 100%;
            cursor: pointer;
        }
        
        label {
            font-size: 1rem;
            cursor: pointer;
            min-width: 100px;
        }
    }
    
    &__item:last-child {
        margin-bottom: 0;
    }

    @media (max-width: 869px) {
        padding-top: calc(10vh);

    }
}
</style>