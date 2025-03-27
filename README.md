# Documentación de Three.js con Vue 2

## Introducción

Three.js es una biblioteca JavaScript que permite crear y mostrar gráficos 3D animados en un navegador web utilizando WebGL. Cuando se combina con Vue 2, puedes crear potentes aplicaciones web 3D interactivas con un código estructurado y mantenible.

Esta documentación te ayudará a entender cómo implementar Three.js en tus proyectos Vue 2, con especial atención a los diferentes tipos de luces disponibles en Three.js.

## Instalación

Para comenzar a usar Three.js con Vue 2, primero debes instalar las dependencias necesarias:

```bash
npm install three gsap
```

Si necesitas funcionalidades adicionales como controles orbitales, cargadores específicos o procesamiento posterior, puedes importarlos directamente desde los módulos de Three.js.

## Estructura básica de un componente Vue con Three.js

```vue
<template>
  <div ref="sceneContainer" class="scene-container"></div>
</template>

<script>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default {
  name: 'ThreeScene',
  data() {
    return {
      scene: null,
      camera: null,
      renderer: null,
      controls: null
    };
  },
  mounted() {
    this.initScene();
    this.initCamera();
    this.initRenderer();
    this.initControls();
    this.addObjects();
    this.addLights();
    this.animate();
    window.addEventListener('resize', this.onWindowResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onWindowResize);
    this.dispose();
  },
  methods: {
    initScene() {
      this.scene = new THREE.Scene();
    },
    initCamera() {
      this.camera = new THREE.PerspectiveCamera(
        75, // FOV (campo de visión)
        this.$refs.sceneContainer.clientWidth / this.$refs.sceneContainer.clientHeight, // Relación de aspecto
        0.1, // Plano cercano
        1000 // Plano lejano
      );
      this.camera.position.z = 5;
    },
    initRenderer() {
      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setSize(
        this.$refs.sceneContainer.clientWidth,
        this.$refs.sceneContainer.clientHeight
      );
      this.renderer.shadowMap.enabled = true;
      this.$refs.sceneContainer.appendChild(this.renderer.domElement);
    },
    initControls() {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
    },
    addObjects() {
      // Aquí agregarías tus objetos 3D
    },
    addLights() {
      // Aquí configurarías tus luces
    },
    animate() {
      requestAnimationFrame(this.animate);
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    },
    onWindowResize() {
      this.camera.aspect = this.$refs.sceneContainer.clientWidth / this.$refs.sceneContainer.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(
        this.$refs.sceneContainer.clientWidth,
        this.$refs.sceneContainer.clientHeight
      );
    },
    dispose() {
      // Limpieza de recursos
    }
  }
};
</script>

<style>
.scene-container {
  width: 100%;
  height: 100vh;
}
</style>
```

## Tipos de luces en Three.js

Three.js ofrece varios tipos de luces para iluminar tus escenas 3D. Cada tipo tiene propiedades y comportamientos diferentes que afectan a cómo se ven los objetos en tu escena.

### 1. AmbientLight (Luz ambiental)

La luz ambiental es la más básica y afecta a todos los objetos de la escena por igual, independientemente de su posición.

```javascript
// Creación de luz ambiental
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // color, intensidad
this.scene.add(ambientLight);
```

**Propiedades principales:**
- `color`: El color de la luz (hexadecimal, rgb, etc.)
- `intensity`: La intensidad de la luz (valores típicos entre 0 y 1)

**Características:**
- Ilumina todos los objetos por igual desde todas las direcciones
- No proyecta sombras
- No tiene posición ni dirección
- Muy poco costosa computacionalmente

**Uso recomendado:** 
- Como iluminación base para evitar que las áreas en sombra sean completamente negras
- Para simular la luz dispersa en una escena
- Siempre debe usarse en combinación con otras luces para obtener efectos realistas

### 2. DirectionalLight (Luz direccional)

La luz direccional simula una fuente de luz distante como el sol. Los rayos de luz son paralelos y proyectan sombras de igual tamaño independientemente de la distancia.

```javascript
// Creación de luz direccional
const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // color, intensidad
directionalLight.position.set(5, 10, 7); // posición
directionalLight.target.position.set(0, 0, 0); // objetivo
directionalLight.castShadow = true; // proyectar sombras

// Configuración de sombras
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 500;
directionalLight.shadow.camera.left = -10;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.top = 10;
directionalLight.shadow.camera.bottom = -10;

this.scene.add(directionalLight);

// Visualizador de la luz (helper)
const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
this.scene.add(directionalLightHelper);
```

**Propiedades principales:**
- `color`: Color de la luz
- `intensity`: Intensidad de la luz
- `position`: Posición de la luz
- `target`: Objetivo hacia donde apunta la luz
- `castShadow`: Booleano que indica si la luz proyecta sombras

**Características:**
- Emite luz en una dirección específica
- Todos los rayos son paralelos entre sí
- Proyecta sombras de igual tamaño sin importar la distancia
- Requiere configuración adicional para las sombras

**Uso recomendado:**
- Para simular la luz solar o cualquier fuente de luz muy distante
- En escenas exteriores
- Cuando necesitas sombras nítidas y consistentes

### 3. PointLight (Luz puntual)

La luz puntual emite luz en todas las direcciones desde un punto único, como una bombilla.

```javascript
// Creación de luz puntual
const pointLight = new THREE.PointLight(0xff9000, 1, 100); // color, intensidad, distancia
pointLight.position.set(2, 3, 4); // posición
pointLight.castShadow = true; // proyectar sombras

// Configuración de sombras
pointLight.shadow.mapSize.width = 1024;
pointLight.shadow.mapSize.height = 1024;

this.scene.add(pointLight);

// Visualizador de la luz (helper)
const sphereSize = 0.5;
const pointLightHelper = new THREE.PointLightHelper(pointLight, sphereSize);
this.scene.add(pointLightHelper);
```

**Propiedades principales:**
- `color`: Color de la luz
- `intensity`: Intensidad de la luz
- `distance`: Distancia máxima a la que llega la luz (0 = infinito)
- `decay`: Velocidad con la que la intensidad disminuye con la distancia (predeterminado = 2)

**Características:**
- Emite luz en todas las direcciones
- La intensidad disminuye con la distancia
- Proyecta sombras en todas direcciones
- Más costosa computacionalmente que la luz direccional

**Uso recomendado:**
- Para simular bombillas, fuego, velas o cualquier fuente de luz que emita en todas direcciones
- En escenas interiores
- Para crear efectos de iluminación localizados

### 4. SpotLight (Luz focal)

La luz focal emite luz en forma de cono, como un foco o linterna.

```javascript
// Creación de luz focal
const spotLight = new THREE.SpotLight(0xffffff, 1); // color, intensidad
spotLight.position.set(0, 10, 0); // posición
spotLight.angle = Math.PI / 6; // ángulo del cono (30 grados)
spotLight.penumbra = 0.2; // difuminado de los bordes del cono
spotLight.decay = 2; // disminución de intensidad con la distancia
spotLight.distance = 50; // distancia máxima
spotLight.castShadow = true; // proyectar sombras

// Configuración de sombras
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
spotLight.shadow.camera.near = 0.5;
spotLight.shadow.camera.far = 500;

this.scene.add(spotLight);

// Visualizador de la luz (helper)
const spotLightHelper = new THREE.SpotLightHelper(spotLight);
this.scene.add(spotLightHelper);
```

**Propiedades principales:**
- `color`: Color de la luz
- `intensity`: Intensidad de la luz
- `distance`: Distancia máxima a la que llega la luz
- `angle`: Ángulo del cono de luz (en radianes)
- `penumbra`: Suavizado de los bordes del cono (0-1)
- `decay`: Velocidad con la que la intensidad disminuye con la distancia

**Características:**
- Emite luz en forma de cono
- Permite controlar el tamaño y suavidad del cono de luz
- Proyecta sombras dentro del cono
- Una de las luces más versátiles pero también más costosas computacionalmente

**Uso recomendado:**
- Para simular linternas, focos de escenario, o luces concentradas en un área
- Para iluminar objetos específicos con precisión
- Para crear efectos dramáticos de iluminación

### 5. HemisphereLight (Luz hemisférica)

La luz hemisférica simula la luz ambiental del cielo y la reflexión del suelo, proporcionando una iluminación suave y realista.

```javascript
// Creación de luz hemisférica
const hemisphereLight = new THREE.HemisphereLight(
  0x0000ff,  // Color del cielo
  0x00ff00,  // Color del suelo
  0.6        // Intensidad
);
this.scene.add(hemisphereLight);
```

**Propiedades principales:**
- `skyColor`: Color que viene desde arriba
- `groundColor`: Color que viene desde abajo
- `intensity`: Intensidad de la luz

**Características:**
- Emite luz desde dos direcciones (arriba y abajo) con colores diferentes
- No proyecta sombras
- Proporciona una iluminación ambiental más natural que `AmbientLight`
- Poco costosa computacionalmente

**Uso recomendado:**
- Para escenas exteriores donde quieres simular la iluminación natural del cielo y el reflejo del suelo
- Como base de iluminación para escenas que quieren reflejar el color ambiental del entorno
- Para dar un toque de color a las sombras

### 6. RectAreaLight (Luz de área rectangular)

La luz de área rectangular simula fuentes de luz con superficie como pantallas de TV, ventanas o paneles luminosos.

```javascript
// Importar el helper específico para este tipo de luz
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js';

// Creación de luz de área rectangular
const width = 5;
const height = 3;
const intensity = 5;
const rectLight = new THREE.RectAreaLight(0xffffff, intensity, width, height);
rectLight.position.set(0, 5, 0);
rectLight.lookAt(0, 0, 0);
this.scene.add(rectLight);

// Visualizador de la luz (helper)
const rectLightHelper = new RectAreaLightHelper(rectLight);
this.scene.add(rectLightHelper);
```

**Propiedades principales:**
- `color`: Color de la luz
- `intensity`: Intensidad de la luz
- `width`: Ancho de la fuente de luz
- `height`: Altura de la fuente de luz

**Características:**
- Emite luz desde una superficie rectangular
- Proyecta luz suave y difusa
- No proyecta sombras (en la implementación actual de Three.js)
- Más costosa computacionalmente que otras luces
- Funciona mejor con materiales tipo `MeshStandardMaterial` y `MeshPhysicalMaterial`

**Uso recomendado:**
- Para simular ventanas, pantallas, paneles de luz o cualquier fuente de luz con forma rectangular
- Para crear reflejos naturales en superficies metálicas o brillantes
- Para iluminación arquitectónica

## Consejos de rendimiento para luces en Three.js

1. **Limita el número de luces**: Cada luz adicional aumenta significativamente el costo de renderizado.

2. **Prioriza las luces según el tipo**: 
   - `AmbientLight` y `HemisphereLight` son las menos costosas
   - `DirectionalLight` tiene un costo moderado
   - `PointLight` y `SpotLight` son más costosas
   - `RectAreaLight` es generalmente la más costosa

3. **Gestiona las sombras con cuidado**:
   - Las sombras son muy costosas para el rendimiento
   - Usa `castShadow` solo en las luces y objetos donde sea necesario
   - Ajusta el tamaño del mapa de sombras (`shadow.mapSize`) según tus necesidades
   - Ajusta la cámara de sombras para abarcar solo lo necesario

4. **Utiliza baking cuando sea posible**:
   - Para escenas estáticas, considera pre-calcular (baking) las luces en texturas
   - Usa mapas de iluminación para obtener una iluminación más compleja sin el costo de múltiples luces

5. **Optimiza los helpers**:
   - Los helpers de luz son útiles para el desarrollo pero añaden costo
   - Asegúrate de eliminarlos en la versión de producción

## Implementación de iluminación en un componente Vue

A continuación, se muestra un ejemplo de cómo implementar diferentes luces en un componente Vue:

```javascript
// En el método addLights() de tu componente Vue
addLights() {
  // Luz ambiental base
  const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
  this.scene.add(ambientLight);
  
  // Luz principal (direccional, similar al sol)
  const mainLight = new THREE.DirectionalLight(0xffffff, 1);
  mainLight.position.set(10, 10, 10);
  mainLight.castShadow = true;
  
  // Configuración avanzada de sombras
  const shadowSize = 10;
  mainLight.shadow.camera.left = -shadowSize;
  mainLight.shadow.camera.right = shadowSize;
  mainLight.shadow.camera.top = shadowSize;
  mainLight.shadow.camera.bottom = -shadowSize;
  mainLight.shadow.camera.near = 0.5;
  mainLight.shadow.camera.far = 30;
  mainLight.shadow.mapSize.width = 2048;
  mainLight.shadow.mapSize.height = 2048;
  
  this.scene.add(mainLight);
  
  // Luz de relleno (para suavizar las sombras)
  const fillLight = new THREE.HemisphereLight(0x8888ff, 0x888844, 0.3);
  this.scene.add(fillLight);
  
  // Luz de acento (para destacar ciertos objetos)
  const accentLight = new THREE.SpotLight(0xff8800, 1);
  accentLight.position.set(-5, 3, -5);
  accentLight.angle = Math.PI / 8;
  accentLight.penumbra = 0.2;
  accentLight.castShadow = true;
  accentLight.shadow.mapSize.width = 1024;
  accentLight.shadow.mapSize.height = 1024;
  
  this.scene.add(accentLight);
}
```

## Animando luces

Puedes animar propiedades de las luces para crear efectos interesantes:

```javascript
// En tu método animate()
animate() {
  requestAnimationFrame(this.animate);
  
  // Hacer que la luz puntual se mueva en círculo
  const time = Date.now() * 0.001;
  this.pointLight.position.x = Math.sin(time) * 3;
  this.pointLight.position.z = Math.cos(time) * 3;
  
  // Cambiar color de la luz focal gradualmente
  const hue = ((time % 10) / 10) * 360;
  this.spotLight.color.setHSL(hue / 360, 1, 0.5);
  
  // Actualizar helpers si están presentes
  if (this.spotLightHelper) this.spotLightHelper.update();
  
  this.controls.update();
  this.renderer.render(this.scene, this.camera);
}
```

## Creando efectos de iluminación avanzados

### Efecto de luz parpadeante (como fuego o vela)

```javascript
createFlickeringLight() {
  const light = new THREE.PointLight(0xff7700, 1, 5);
  light.position.set(0, 1, 0);
  this.scene.add(light);
  
  // Función para hacer parpadear la luz
  const flicker = () => {
    // Variación aleatoria en intensidad
    light.intensity = 0.5 + Math.random() * 0.5;
    
    // Pequeña variación en posición
    light.position.x = 0.05 * (Math.random() - 0.5);
    light.position.y = 1 + 0.05 * (Math.random() - 0.5);
    light.position.z = 0.05 * (Math.random() - 0.5);
    
    // Continuar el efecto
    requestAnimationFrame(flicker);
  };
  
  flicker();
  
  return light;
}
```

### Efecto día/noche

```javascript
createDayNightCycle() {
  // Luz principal (sol/luna)
  const sunMoon = new THREE.DirectionalLight(0xffffff, 1);
  this.scene.add(sunMoon);
  
  // Luz ambiental (cielo)
  const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
  this.scene.add(ambientLight);
  
  // Función para actualizar el ciclo
  let time = 0;
  
  const updateCycle = () => {
    time += 0.001;
    const angle = time % (Math.PI * 2);
    
    // Posición del sol/luna
    sunMoon.position.y = Math.sin(angle) * 10;
    sunMoon.position.z = Math.cos(angle) * 10;
    
    // Es de día si el sol está sobre el horizonte
    const isDaytime = sunMoon.position.y > 0;
    
    if (isDaytime) {
      // Configuraciones diurnas
      sunMoon.intensity = 1;
      sunMoon.color.setHex(0xffffff);
      ambientLight.intensity = 0.5;
      ambientLight.color.setHex(0x8888ff);
      this.scene.background = new THREE.Color(0x87ceeb); // Cielo azul
    } else {
      // Configuraciones nocturnas
      sunMoon.intensity = 0.2;
      sunMoon.color.setHex(0xaaaaff);
      ambientLight.intensity = 0.1;
      ambientLight.color.setHex(0x222244);
      this.scene.background = new THREE.Color(0x111122); // Cielo nocturno
    }
  };
  
  // Añadir la función al bucle de animación
  this.dayNightUpdate = updateCycle;
  
  return { sunMoon, ambientLight, updateCycle };
}

// En tu método animate()
animate() {
  // ... otro código
  if (this.dayNightUpdate) this.dayNightUpdate();
  // ... otro código
}
```

## Compatibilidad con Materiales

No todos los materiales en Three.js responden a todos los tipos de luces. Aquí hay una tabla de referencia:

| Material | Ambient | Directional | Point | Spot | Hemisphere | RectArea |
|----------|---------|-------------|-------|------|------------|----------|
| MeshBasicMaterial | No | No | No | No | No | No |
| MeshLambertMaterial | Sí | Sí | Sí | Sí | Sí | No |
| MeshPhongMaterial | Sí | Sí | Sí | Sí | Sí | No |
| MeshStandardMaterial | Sí | Sí | Sí | Sí | Sí | Sí |
| MeshPhysicalMaterial | Sí | Sí | Sí | Sí | Sí | Sí |

**MeshBasicMaterial** no responde a ninguna luz ya que siempre muestra el color completo.

**MeshLambertMaterial** es eficiente pero no muestra reflejos pronunciados.

**MeshPhongMaterial** añade reflejos brillantes a las superficies.

**MeshStandardMaterial** utiliza un modelo de iluminación físicamente más preciso (PBR).

**MeshPhysicalMaterial** extiende el material estándar con opciones avanzadas como recubrimiento transparente y más control sobre la reflectividad.

## Conclusión

La iluminación es uno de los aspectos más importantes para crear escenas 3D convincentes y atractivas. Three.js ofrece un amplio conjunto de tipos de luces que puedes combinar para lograr los efectos deseados.

Al integrar Three.js con Vue 2, puedes crear componentes reutilizables que encapsulan la lógica de iluminación, facilitando el mantenimiento y la organización de tu código.

Experimenta con diferentes combinaciones de luces y ajusta sus propiedades para encontrar la configuración que mejor se adapte a tus necesidades específicas.

---

## Recursos adicionales

- [Documentación oficial de Three.js](https://threejs.org/docs/)
- [Ejemplos de Three.js](https://threejs.org/examples/)
- [Guía de iluminación en Three.js](https://threejsfundamentals.org/threejs/lessons/threejs-lights.html)
- [Trabajando con sombras en Three.js](https://threejsfundamentals.org/threejs/lessons/threejs-shadows.html)