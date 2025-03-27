<template>
    <div class="menu">
        <h2 class="menu__title">Lighting Options</h2>

        <div v-for="(config, key) in lights" :key="key" class="menu__item">
            <input type="checkbox" :id="`${key}Light`" :name="`${key}Light`" v-model="lights[key].enabled"
                @change="emitLightUpdate" />
            <label :for="`${key}Light`">{{ formatLabel(key) }}</label>

            <input type="range" v-model="lights[key].intensity" :min="range[key]?.min || 0" :max="range[key]?.max || 2"
                :step="range[key]?.step || 0.1" :disabled="!lights[key].enabled" :value="range[key]?.value" @input="emitLightUpdate" />
        </div>
    </div>
</template>

<script>
export default {
    name: "Menu",
    data() {
        return {
            lights: {
                ambient: { enabled: true, intensity: 25 },
                directional: { enabled: false, intensity: 2.5 },
                point: { enabled: false, intensity: 500 },
                spot: { enabled: false, intensity: 500 },
                hemisphere: { enabled: false, intensity: 25 },
                rect: { enabled: false, intensity: 25 },
            },
            range: {
                ambient: { min: 0, max: 50, step: 1  },
                directional: { min: 0, max: 5, step: 0.1 },
                point: { min: 0, max: 1000, step: 0.1 },
                spot: { min: 0, max: 1000, step: 0.1 },
                hemisphere: { min: 0, max: 50, step: 0.1},
                rect: { min: 0, max: 50, step: 1 },
            }

        };
    },
    methods: {
        emitLightUpdate() {
            this.$emit('update-lights', { ...this.lights });
        },
        formatLabel(key) {
            const labels = {
                ambient: 'Ambiental',
                directional: 'Directional',
                point: 'Point',
                spot: 'Spot',
                hemisphere: 'Hemisférica',
                rectArea: 'Área Rectangular'
            };
            return labels[key] || key;
        }
    }
};
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
            width: 100px;
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