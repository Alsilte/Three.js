<template>
  <div class="menu">
    <h2 class="menu__title">Lighting Options</h2>
    
    <div v-for="(config, key) in lights" 
      :key="key" 
      class="menu__item">
      <input type="checkbox" 
        :id="`${key}Light`" 
        :name="`${key}Light`" 
        v-model="lights[key].enabled"
        @change="emitLightUpdate" />
      <label :for="`${key}Light`">{{ formatLabel(key) }}</label>

      <input type="range" 
        v-model.number="lights[key].intensity" 
        :min="range[key]?.min || 0" 
        :max="range[key]?.max || 2"
        :step="range[key]?.step || 0.1" 
        :value="lights[key].intensity" 
        @input="emitLightUpdate"
        :disabled="!lights[key].enabled" />
    </div>

    <div class="menu__item">
      <input type="checkbox" 
        id="hdrToggle" 
        v-model="hdrEnabled" 
        @change="emitHDRToggle" />
      <label for="hdrToggle">Activar HDR</label>
    </div>

    <div class="menu__item" v-if="hdrEnabled">
      <label for="hdrIntensity">HDR Intensity</label>
      <input type="range" 
        id="hdrIntensity" 
        v-model.number="hdrIntensity" 
        :min="range.hdr?.min || 0"
        :max="range.hdr?.max || 2" 
        :step="range.hdr?.step || 0.1"
        @input="emitHDRIntensity" />
    </div>
    <div class="menu__item">
      <label for="scaleX">Escala eje X</label>
      <input type="range" id="scaleX" 
        v-model.number="scaleX" 
        :min="range.scale?.min || 0.1" 
        :max="range.scale?.max || 2" 
        :step="range.scale?.step || 0.1" 
        @input="emitScaleX" />
    </div>
    <div class="menu__item">
      <label for="scaleY">Escala eje Y</label>
      <input type="range" id="scaleY" 
        v-model.number="scaleY" 
        :min="range.scale?.min || 0.1" 
        :max="range.scale?.max || 10" 
        :step="range.scale?.step || 0.1" 
        @input="emitScaleY" />
    </div>
    <div class="menu__texturas">
      <div v-for="(textureGroup, index) in groupedTextures" :key="index" class="menu__texturas__container">
        <img :src="textureGroup.baseColor.img" :alt="textureGroup.baseColor.name"
          :class="{ 'selected': isBaseTextureActive(textureGroup.baseColor.name) }"
          @click="selectBaseTexture(textureGroup.baseColor)" />
        <p>{{ textureGroup.baseColor.processedName }}</p>
        <select v-if="isBaseTextureActive(textureGroup.baseColor.name)"
          @change="updateTexture(textureGroup.baseColor.marca, $event.target.value)">
          <option v-for="variant in textureGroup.variants" :key="variant" :value="variant">
            {{ formatTextureOption(variant) }}
          </option>
        </select>


      </div>
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
      default: false,
    },
    // Valor inicial de intensidad HDR
    hdrIntensityValue: {
      type: Number,
      default: 0.75,
    },
  },

  // Estado local reactivo del componente
  data() {
    return {
      // Configuración inicial de luces
      lights: {
        ambient: { enabled: false, intensity: 5 }, // Luz ambiental
        directional: { enabled: false, intensity: 2.5 }, // Luz direccional
        point: { enabled: false, intensity: 250 }, // Luz de punto
        spot: { enabled: false, intensity: 50 }, // Luz de foco
        hemisphere: { enabled: false, intensity: 25 }, // Luz hemisférica
        rect: { enabled: false, intensity: 25 }, // Luz de área rectangular
      },
      // Rangos de intensidad para cada tipo de luz
      range: {
        ambient: { min: 0, max: 10, step: 0.5 },
        directional: { min: 0, max: 5, step: 0.1 },
        point: { min: 0, max: 500, step: 0.1 },
        spot: { min: 0, max: 100, step: 0.1 },
        hemisphere: { min: 0, max: 50, step: 0.1 },
        rect: { min: 0, max: 50, step: 1 },
      },
      scaleX: 1,
      scaleY: 1,  
       // Array de texturas cargadas dinámicamente
      allTextures: Object.entries(import.meta.glob("@/assets/texturas/*.webp"))
        .map(([key, value]) => {
          const filename = key.split("/").pop();
          const parts = filename.split("_");
          const baseNameParts = parts.slice(0, -1);
          const suffixWithExtension = parts.slice(-1)[0];
          const suffix = suffixWithExtension.replace(/\.(webp|jpg|png)$/, "");

          const processedName = filename
            .replace(/\.(webp|jpg|png)$/, "") // Remove file extension
            .replace(/[_-]/g, " ") // Replace underscores and hyphens with spaces
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" "); // Capitalize each word

          return {
            key,
            filename,
            baseName: baseNameParts.join("_"),
            suffix,
            processedName,
            img: `/src/assets/texturas/${filename}`, // Construye la URL de la imagen
          };
        }),
      // Estado y configuración de HDR
      hdrEnabled: true,
      hdrIntensity: 0.75,
      selectedBaseTexture: null,
      selectedTextureOptions: {}, // To store the selected option for each base texture
    };
  },

  computed: {
    groupedTextures() {
      const groups = [];

      const baseColors = this.allTextures.filter(t => t.suffix === 'baseColor');

      baseColors.forEach(base => {
        const baseNameParts = base.baseName.split('_');
        const marca = baseNameParts[0]; // e.g. 'bera'
        const color = baseNameParts.slice(1).join('_'); // e.g. 'white'

        // Buscar variantes con este 'marca'
        const variants = new Set();

        this.allTextures.forEach(tex => {
          if (
            tex.suffix !== 'baseColor' &&
            tex.baseName.startsWith(marca)
          ) {
            const variant = tex.baseName.replace(`${marca}_`, '').split('_')[0];
            variants.add(variant);
          }
        });

        groups.push({
          baseColor: {
            ...base,
            name: base.baseName,
            processedName: base.processedName,
            marca,
            color,
          },
          variants: Array.from(variants).sort(),
        });
      });

      return groups;
    }
  },
  // Hook de ciclo de vida: se ejecuta al crear el componente
  created() {
    console.log(this.allTextures);
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
    },
  },

  // Métodos para emitir eventos al padre
  methods: {

    emitScaleY() {
      this.$emit('update-scale-y', this.scaleY);
    },
    emitScaleX() {
      this.$emit('update-scale-x', this.scaleX);
    },
    selectBaseTexture(texture) {
      console.log('Menu - Seleccionando textura base:', {
        nombre: texture.processedName,
        marca: texture.marca,
        ruta: texture.img
      });
      this.selectedBaseTexture = texture.name;
      this.$emit('select-texture', texture);
    },
    isBaseTextureActive(textureName) {
      return this.selectedBaseTexture === textureName;
    },
    updateTexture(marca, variant) {
      console.log('Menu - Actualizando texturas para:', {
        marca: marca,
        variante: variant
      });
      
      // Buscar todas las texturas relacionadas (metallic y roughness)
      const relatedTextures = this.allTextures.filter(tex =>
        tex.baseName.startsWith(`${marca}_${variant}`) &&
        (tex.suffix === 'metallic' || tex.suffix === 'roughness')
      );

      console.log('Menu - Texturas relacionadas encontradas:', 
        relatedTextures.map(tex => ({
          nombre: tex.processedName,
          tipo: tex.suffix,
          ruta: tex.img
        }))
      );

      // Emitir cada textura encontrada
      relatedTextures.forEach(texture => {
        this.$emit('select-texture', texture);
      });
    },

    formatTextureOption(option) {
  return option
    .replace(/[_-]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}, 
    // Emite configuración actualizada de luces
    emitLightUpdate() {
      this.$emit("update-lights", { ...this.lights });
    },

    // Emite estado de activación de HDR
    emitHDRToggle() {
      this.$emit("toggle-hdr", this.hdrEnabled);
    },

    // Emite intensidad de HDR
    emitHDRIntensity() {
      this.$emit("update-hdr-intensity", Number(this.hdrIntensity));
    },

    // Formatea etiquetas de luces
    formatLabel(key) {
      const labels = {
        ambient: "Ambiental",
        directional: "Directional",
        point: "Point",
        spot: "Spot",
        hemisphere: "Hemisférica",
        rect: "React Area",
      };
      return labels[key] || key;
    },
  },
};
</script>

<style lang="scss" scoped>
.menu {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #222;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  color: #fff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  transition: all 0.3s ease-in-out;

  &__title {
    font-size: 1.8rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    text-align: center;
    color: #00e676; /* Accent color */
  }

  &__item {
    display: flex;
    align-items: center;
    margin-bottom: 1.2rem;
    gap: 10px;
    width: 100%;
    font-size: 1rem;

    input[type="checkbox"] {
      accent-color: #00e676;
      margin-right: 10px;
    }

    input[type="range"] {
      width: 100%;
      cursor: pointer;
      border-radius: 8px;
      background-color: #444;
      height: 8px;
      outline: none;
      transition: background-color 0.3s ease;

      &:hover {
        background-color: #555;
      }

      &::-webkit-slider-runnable-track {
        height: 8px;
      }

      &::-webkit-slider-thumb {
        background: #00e676;
        border: none;
        height: 16px;
        width: 16px;
        border-radius: 50%;
        cursor: pointer;
      }

      &::-moz-range-thumb {
        background: #00e676;
        border: none;
        height: 16px;
        width: 16px;
        border-radius: 50%;
        cursor: pointer;
      }
    }

    label {
      font-size: 1rem;
      color: #bbb;
      flex: 1;
    }

    .menu__value {
      font-size: 0.9rem;
      color: #fff;
      font-weight: 500;
      min-width: 40px;
      text-align: right;
    }
  }

  &__texturas {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    width: 100%;
    margin-top: 2rem;

    &__container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      padding: 0.5rem;
      border-radius: 10px;
      background-color: #646363;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      transition: background-color 0.3s ease;

      &:hover {
        background-color: #444;
      }

      img {
        width: 100px;
        height: auto;
        border-radius: 8px;
        cursor: pointer;
        transition: transform 0.3s ease;

        &:hover {
          transform: scale(1.1);
        }

        &.selected {
          border: 2px solid #00e676;
        }
      }

      p {
        font-size: 1rem;
        color: #ddd;
        text-align: center;
        margin-top: 0.5rem;
      }

      select {
        width: 120px;
        padding: 8px;
        margin-top: 5px;
        border-radius: 8px;
        background-color: #916b6b;
        color: white;
        border: 1px solid #555;
        font-size: 0.9rem;
        text-align: center;
        cursor: pointer;
        transition: background-color 0.3s ease;

        &:hover {
          background-color: #555;
        }
      }
    }
  }

  &__item:last-child {
    margin-bottom: 0;
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 1rem;
    max-width: 100%;
    .menu__texturas {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 480px) {
    .menu__texturas {
      grid-template-columns: 1fr;
    }
  }
}

</style>