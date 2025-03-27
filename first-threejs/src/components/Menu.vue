<template>
    <div class="menu">
        <h2 class="menu__title">Lighting Options</h2>
        
        <!-- Opciones de luces -->
        <div v-for="(config, key) in lights" :key="key" class="menu__item">
            <input type="checkbox" :id="`${key}Light`" :name="`${key}Light`" v-model="lights[key].enabled"
                @change="emitLightUpdate" />
            <label :for="`${key}Light`">{{ formatLabel(key) }}</label>
            
            <input type="range" v-model.number="lights[key].intensity" 
                :min="range[key]?.min || 0" 
                :max="range[key]?.max || 2"
                :step="range[key]?.step || 0.1"
                :value="lights[key].intensity" 
                @input="emitLightUpdate" 
                :disabled="!lights[key].enabled" 
            />

        </div>

        <!-- Control para el entorno HDR -->
        <div class="menu__item">
            <input type="checkbox" id="hdrToggle" v-model="hdrEnabled" @change="emitHDRToggle">
            <label for="hdrToggle">Activar HDR</label>
        </div>
        
        <!-- Slider para la intensidad del HDR -->
        <div class="menu__item" v-if="hdrEnabled">
            <label for="hdrIntensity">HDR Intensity</label>
            <input type="range" id="hdrIntensity" v-model.number="hdrIntensity" 
                :min="range.hdr?.min || 0" 
                :max="range.hdr?.max || 2" 
                :step="range.hdr?.step || 0.1" 
                @input="emitHDRIntensity" />
        </div>
    </div>
</template>

<script>
export default {
    name: "Menu",
    props:{
        environmentEnabled: {
            type: Boolean,
            default: false
        },
        hdrIntensityValue: {
            type: Number,
            default: 0.75
        }
    },
    data() {
        return {
            lights: {
                ambient: { enabled: true, intensity: 5 },
                directional: { enabled: false, intensity: 2.5 },
                point: { enabled: false, intensity: 250 },
                spot: { enabled: false, intensity: 50 },
                hemisphere: { enabled: false, intensity: 25 },
                rect: { enabled: false, intensity: 25 },
            },
            range: {
                ambient: { min: 0, max: 10, step: 0.5},
                directional: { min: 0, max: 5, step: 0.1 },
                point: { min: 0, max: 500, step: 0.1 },
                spot: { min: 0, max: 100, step: 0.1 },
                hemisphere: { min: 0, max: 10, step: 0.1 },
                rect: { min: 0, max: 50, step: 1 },
            },
            hdrEnabled: false,
            hdrIntensity: 0.75,
        };
    },
    created() {
        this.hdrEnabled = this.environmentEnabled;
        this.hdrIntensity = this.hdrIntensityValue;
    },
    watch: {
        environmentEnabled(newVal) {
            this.hdrEnabled = newVal;
        },
        hdrIntensityValue(newVal) {
            this.hdrIntensity = newVal;
        }
    },
    methods: {
        emitLightUpdate() {
            this.$emit('update-lights', { ...this.lights });
        },
        emitHDRToggle() {
            this.$emit('toggle-hdr', this.hdrEnabled);
        },
        emitHDRIntensity() {
            this.$emit('update-hdr-intensity', Number(this.hdrIntensity));
        },
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
}
</style>