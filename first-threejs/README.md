# first-threejs

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```
# Proyecto de Iluminación 3D con Vue y Three.js

## Estructura General del Proyecto

### Componentes Principales
1. **App.vue**: Componente principal y orquestador
2. **Menu.vue**: Interfaz de control de luces e iluminación
3. **Scene.vue**: Renderización de escena 3D con Three.js

## Flujo de Datos y Reactividad

### Arquitectura de Comunicación
```
App.vue (Componente Padre)
│
├── Menu.vue (Hijo Izquierdo)
│   - Emite eventos de configuración
│   - Recibe props iniciales
│
└── Scene.vue (Hijo Derecho)
    - Renderiza escena 3D
    - Recibe configuraciones
    - Actualiza renderizado
```

### Variables Reactivas Principales

#### En App.vue
```javascript
data() {
  return {
    // Estado central de configuraciones
    lightSettings: {
      ambient: { enabled: false, intensity: 1 },
      directional: { enabled: false, intensity: 1 },
      // ... otras luces
    },
    environmentEnabled: false,  // Estado del entorno HDR
    hdrIntensity: 0.75          // Intensidad del HDR
  }
}
```

### Flujo de Eventos y Props

#### 1. Inicialización
- `App.vue` define estado inicial
- Pasa configuraciones a `Menu.vue` y `Scene.vue` como props

#### 2. Interacción en Menu.vue
- Controles de interfaz generan eventos
- Usa `$emit` para comunicar cambios a `App.vue`

```javascript
// Ejemplo de emisión de eventos
methods: {
  emitLightUpdate() {
    // Envía nueva configuración de luces
    this.$emit('update-lights', { ...this.lights });
  },
  emitHDRToggle() {
    // Activa/desactiva HDR
    this.$emit('toggle-hdr', this.hdrEnabled);
  }
}
```

#### 3. Gestión en App.vue
- Métodos reciben eventos de `Menu.vue`
- Actualizan estado central

```javascript
methods: {
  updateLights(newValues) {
    // Actualiza configuración de luces
    this.lightSettings = { ...newValues };
  },
  updateEnvironment(enabled) {
    // Cambia estado del entorno
    this.environmentEnabled = enabled;
  }
}
```

#### 4. Renderización en Scene.vue
- Recibe props actualizadas
- Usa watchers para detectar cambios
- Actualiza escena 3D

```javascript
watch: {
  // Observa cambios en configuración de luces
  lightSettings: {
    handler(newSettings) {
      this.updateLights(newSettings);
    },
    deep: true  // Observa cambios profundos
  },
  // Observa cambios en entorno HDR
  environmentEnabled: {
    handler(newVal) {
      newVal ? this.setEnvironment() : this.clearEnvironment();
    }
  }
}
```

## Tipos de Reactividad

### 1. Props
- Transferencia unidireccional de datos
- Definidas con `:` en template
- Inmutables en componente hijo

### 2. v-model
- Enlace bidireccional
- Actualización instantánea de interfaz
- Usado en controles de Menu.vue

### 3. Eventos Personalizados
- `$emit` para comunicación hijo → padre
- Permiten actualizar estado central

### 4. Watchers
- Observan cambios en variables
- Ejecutan lógica cuando cambia un valor
- Útiles para actualizaciones complejas

## Ciclo de Actualización

1. Usuario modifica control en `Menu.vue`
2. Evento personalizado actualiza `App.vue`
3. `App.vue` modifica estado central
4. Props actualizadas se propagan a `Scene.vue`
5. `Scene.vue` renderiza cambios en escena 3D

## Consideraciones Técnicas

### Reactividad Profunda
- Usar `{ ...objeto }` para disparar actualizaciones
- `deep: true` en watchers para objetos complejos

### Rendimiento
- Watchers selectivos
- Uso de `markRaw()` para objetos no reactivos (Three.js)

## Patrones de Diseño

### Componente Contenedor (App.vue)
- Gestiona estado global
- Coordina comunicación entre componentes

### Componentes Presentacionales
- `Menu.vue`: Interfaz de control
- `Scene.vue`: Renderización

## Mejores Prácticas

- Mantener lógica de negocio en componente padre
- Usar props para configuración inicial
- Eventos para comunicación dinámica
- Watchers para efectos secundarios

## Posibles Mejoras
- Persistencia de estado
- Más tipos de luces
- Configuraciones predefinidas
- Animaciones de transición
```

Este documento ofrece una visión completa de cómo funciona la reactividad, los eventos y la comunicación entre componentes en tu proyecto Vue de iluminación 3D.

¿Te gustaría que profundice en algún aspecto en particular?