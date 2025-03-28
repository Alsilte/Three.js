<template>
    <!-- 
        Contenedor de la escena 3D
        - Usa ref para referenciar el elemento del DOM
        - Evento de doble clic para resetear vista
    -->
    <div ref="scene" class="scene">
        <!-- 
            Canvas de renderizado 
            - Span usado como contenedor del renderizador WebGL
            - Evento de doble clic llama a resetView()
        -->
        <span class="scene__canvas" @dblclick="resetView()"> </span>
    </div>
</template>

<script>
// Importaciones de Three.js y otros recursos necesarios
import hdrFile from '@/assets/environments/environment.hdr';

import { markRaw } from "vue";
import { gsap } from "gsap";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { RectAreaLight } from 'three';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js';


import {
    DirectionalLightHelper,
    PointLightHelper,
    SpotLightHelper,
    HemisphereLightHelper
} from "three";

export default {
    name: "Scene",
    // Props que recibe el componente
    props: {
        // Props recibidas del padre para configurar escena
        // Configuración de luces desde el menú
        lightSettings: {
            type: Object,
            default: () => ({
                ambient: { enabled: false, intensity: 1 },
                directional: { enabled: false, intensity: 1 },
                point: { enabled: false, intensity: 1 },
                spot: { enabled: false, intensity: 1 }
            })
        },
        // Control del entorno HDR
        environmentEnabled: {
            type: Boolean,
            default: false
        },
        hdrIntensity: {
            type: Number,
            default: 0.75
        }
    },
    // Estado local del componente
    data() {
        return {
            scene: null,          // Escena principal de Three.js
            camera: null,         // Cámara perspectiva
            renderer: null,       // Renderizador WebGL
            controls: null,       // Controles de órbita para la cámara
            environmentMap: null, // Mapa de entorno HDR
            defaultBackground: new THREE.Color(0xffffff),
            // Objetos de luces y sus helpers visuales
            lights: {
                ambient: { instance: null },
                directional: { instance: null, helper: null },
                point: { instance: null, helper: null },
                spot: { instance: null, helper: null },
                hemisphere: { instance: null, helper: null },
                rect: { instance: null }
            },
            cachedEnvironmentMap: null,
            currentHdrTexture: null
        };
    },

    // Lifecycle hooks y observadores
    created() {
        window.addEventListener("resize", this.setResize);
    },
    unmounted() {
        window.removeEventListener("resize", this.setResize);
        this.setDispose();
    },

    // Observadores de props reactivas
    watch: {

        // Observa cambios en configuración de luces
        lightSettings: {
            handler(newSettings) {
                this.updateLights(newSettings);
            },
            deep: true // Observa cambios profundos en el objeto
        },

        // Observa activación/desactivación de entorno HDR
        environmentEnabled: {
            handler(newVal) {
                if (newVal) {
                    this.setEnvironment();  // Activa entorno
                } else {
                    this.scene.environment = null;
                    this.scene.background = this.defaultBackground;
                }
            }
        },

        // Observa cambios en intensidad HDR
        hdrIntensity: {
            handler(newVal) {
                if (this.environmentEnabled && this.currentHdrTexture) {
                    this.updateHDRIntensity(newVal);
                }
            }
        }
    },

    // Hook de ciclo de vida: se ejecuta al montar componente
    async mounted() {
        this.setScene();
        this.setLighting();
        this.setCamera();
        this.setRenderer();
        this.setControls();
        this.setResize();

        if (this.environmentEnabled) {
            await this.setEnvironment();
        }



        // Crear geometría del cubo
        const geometryCube = new THREE.BoxGeometry(1, 1, 1);
        const materialCubo = new THREE.MeshStandardMaterial({
            color: 0x00ff00,
            metalness: 0.5,
            roughness: 0.1,

        });

        const cubo = new THREE.Mesh(geometryCube, materialCubo);
        cubo.castShadow = true; // El cubo proyecta sombras
        cubo.receiveShadow = true; // El cubo recibe sombras
        this.scene.add(cubo);

        // Crear geometría del plano
        const geometryPlane = new THREE.PlaneGeometry(10, 10); // Aumenta el tamaño del plano
        const materialPlane = new THREE.MeshStandardMaterial({ // Cambiado a MeshStandardMaterial
            color: 0xffff00,
            side: THREE.DoubleSide,
            metalness: 0.1,
            roughness: 0.8
        }); // Material visible por ambos lados
        const plane = new THREE.Mesh(geometryPlane, materialPlane);
        plane.receiveShadow = true; // El plano recibe sombras

        // Rotar el plano para que quede horizontal
        plane.rotation.x = -Math.PI / 2; // Rota 90 grados en el eje X

        // Posicionar el plano justo debajo del cubo
        plane.position.y = -0.51; // Ajusta la posición en el eje Y para que el cubo "se apoye" en el plano

        // Añadir el plano a la escena
        this.scene.add(plane);
        /* const faceSize = 1; // Tamaño de cada cara
         const half = faceSize / 2; // Mitad del tamaño de la cara
         const cubeParts = [];
 
         // Configuración de las posiciones y rotaciones finales para formar el cubo
         const transforms = [
             // Frente
             { position: [0, 0, half], rotation: [0, 0, 0] },
             // Atrás
             { position: [0, 0, -half], rotation: [0, Math.PI, 0] },
             // Arriba
             { position: [0, half, 0], rotation: [-Math.PI / 2, 0, 0] },
             // Abajo
             { position: [0, -half, 0], rotation: [Math.PI / 2, 0, 0] },
             // Derecha
             { position: [half, 0, 0], rotation: [0, -Math.PI / 2, 0] },
             // Izquierda
             { position: [-half, 0, 0], rotation: [0, Math.PI / 2, 0] },
         ];
 
         // Crear las caras del cubo con posiciones y rotaciones iniciales aleatorias
         transforms.forEach(({ position, rotation }, i) => {
             const materialClone = material.clone();
             const face = new THREE.Mesh(new THREE.PlaneGeometry(faceSize, faceSize), materialClone);
 
             // Generar posiciones iniciales aleatorias fuera del área visible
             const randomX = (Math.random() - 0.5) * 20; // Rango: -10 a 10
             const randomY = (Math.random() - 0.5) * 20; // Rango: -10 a 10
             const randomZ = (Math.random() - 0.5) * 20; // Rango: -10 a 10
 
             // Generar rotaciones iniciales aleatorias
             const randomRotX = Math.random() * Math.PI * 2; // Rango: 0 a 2π
             const randomRotY = Math.random() * Math.PI * 2; // Rango: 0 a 2π
             const randomRotZ = Math.random() * Math.PI * 2; // Rango: 0 a 2π
 
             // Asignar posiciones y rotaciones iniciales aleatorias
             face.position.set(randomX, randomY, randomZ);
             face.rotation.set(randomRotX, randomRotY, randomRotZ);
 
             // Añadir la cara a la escena y al array de partes del cubo
             cubeParts.push(face);
 
             // Animar hacia la posición y rotación final para formar el cubo
             gsap.to(face.position, {
                 x: position[0],
                 y: position[1],
                 z: position[2],
                 duration: 5,
                 ease: "power2.inOut",
             });
 
             gsap.to(face.rotation, {
                 x: rotation[0],
                 y: rotation[1],
                 z: rotation[2],
                 duration: 5,
                 ease: "power2.inOut",
             });
         });
         // Animación GSAP: rotación continua
         /*gsap.to(cube.rotation, {
             y: Math.PI * 5,
             duration: 3,
             repeat: -1,
             ease: 'power1.inOut'
         });
 
         // Animación GSAP: rebote vertical
         gsap.to(cube.position, {
             y: 1.5,
             duration: 1.5,
             yoyo: true,
             repeat: -1,
             ease: 'sine.inOut'
         });*/


        // Inicia bucle de animación
        this.setAnimate();

        // Aplica configuración inicial de luces
        this.updateLights(this.lightSettings);
    },
    methods: {
        // Inicializa la escena de Three.js
        setScene() {
            this.scene = markRaw(new THREE.Scene());
            this.defaultBackground = new THREE.Color(0xffffff);
            this.scene.background = this.defaultBackground;
        },

        // Configura todas las luces disponibles en la escena
        setLighting() {
            RectAreaLightUniformsLib.init();
            // Ambient Light
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
            ambientLight.visible = false;
            this.scene.add(ambientLight);
            this.lights.ambient.instance = ambientLight;

            // Directional Light
            const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
            directionalLight.position.set(2, 5, 2);
            directionalLight.visible = false;
            directionalLight.castShadow = true; // Permite proyectar sombras
            // Configurar calidad de sombras
            directionalLight.shadow.mapSize.width = 2048;
            directionalLight.shadow.mapSize.height = 2048;
            directionalLight.shadow.camera.near = 0.1;
            directionalLight.shadow.camera.far = 500;
            this.scene.add(directionalLight);
            this.lights.directional.instance = directionalLight;

            // Directional Light Helper
            const directionalHelper = new THREE.DirectionalLightHelper(directionalLight, 1, 0xff0000);
            directionalHelper.visible = false;
            this.scene.add(directionalHelper);
            this.lights.directional.helper = directionalHelper;

            // Point Light
            const pointLight = new THREE.PointLight(0xffffff, 1);
            pointLight.position.set(5, 5, 5);
            pointLight.visible = false;
            pointLight.castShadow = true; // Permite proyectar sombras
            pointLight.shadow.mapSize.width = 2048;
            pointLight.shadow.mapSize.height = 2048;
            this.scene.add(pointLight);
            this.lights.point.instance = pointLight;

            const pointHelper = new PointLightHelper(pointLight, 0.5, 0xff0000);
            pointHelper.visible = false;
            this.scene.add(pointHelper);
            this.lights.point.helper = pointHelper;


            // Spot Light
            const spotLight = new THREE.SpotLight(0xffffff, 1);
            spotLight.position.set(1, 2, 1);
            spotLight.visible = false;
            spotLight.castShadow = true; // Permite proyectar sombras
            spotLight.shadow.mapSize.width = 2048;
            spotLight.shadow.mapSize.height = 2048;
            this.scene.add(spotLight);
            this.lights.spot.instance = spotLight;

            // SpotLight Helper
            const spotHelper = new SpotLightHelper(spotLight, 0xff0000);
            spotHelper.visible = false;
            this.scene.add(spotHelper);
            this.lights.spot.helper = spotHelper;

            // Hemisphere Light
            const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
            hemisphereLight.visible = false;
            this.scene.add(hemisphereLight);
            this.lights.hemisphere.instance = hemisphereLight;

            // Hemisphere Helper
            const hemiHelper = new HemisphereLightHelper(hemisphereLight, 1, 0xff0000);
            hemiHelper.visible = false;
            this.scene.add(hemiHelper);
            this.lights.hemisphere.helper = hemiHelper;

            RectAreaLightUniformsLib.init();

            const rectLight = new RectAreaLight(0xffffff, 5, 4, 4);
            rectLight.position.set(0, 2, -3);
            rectLight.lookAt(0, 0, 0);
            rectLight.visible = false;
            this.scene.add(rectLight);
            this.lights.rect.instance = rectLight;

            const rectLightHelper = new RectAreaLightHelper(rectLight, 1, 0xff0000);
            rectLight.add(rectLightHelper); // O scene.add(rectLightHelper), cualquiera funciona
        },

        // Configura el entorno HDR
        async setEnvironment() {
            try {
                if (this.performanceProfile === 'low') {
                    this.scene.environment = null;
                    this.scene.background = new THREE.Color(0xffffff);
                    return;
                }

                const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
                let floatType = THREE.FloatType;
                let exposure = this.hdrIntensity;

                if (isIOS) {
                    floatType = THREE.HalfFloatType;
                }

                // Carga diferida del único HDR usando import.meta.glob
                const hdrFiles = import.meta.glob('@/assets/environments/environment.hdr', { as: 'url' });
                const hdrFile = await hdrFiles['/src/assets/environments/environment.hdr']();

                const loader = new RGBELoader().setDataType(floatType);
                const hdrTexture = await new Promise((resolve, reject) => {
                    loader.load(
                        hdrFile,
                        resolve,
                        undefined,
                        reject
                    );
                });

                hdrTexture.mapping = THREE.EquirectangularReflectionMapping;
                this.currentHdrTexture = hdrTexture;

                // Ajustar exposición
                this.applyHDRIntensity(hdrTexture, exposure);

                const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
                pmremGenerator.compileEquirectangularShader();

                const envMap = pmremGenerator.fromEquirectangular(hdrTexture).texture;

                pmremGenerator.dispose();

                this.scene.environment = envMap;
                this.scene.background = new THREE.Color(0xffffff);
            } catch (error) {
                console.error('Failed to load environment file:', error);
            }
        },

        // Aplica la intensidad al mapa HDR
        applyHDRIntensity(hdrTexture, intensity) {
            const data = hdrTexture.image.data;
            for (let i = 0; i < data.length; i += 4) {
                data[i] *= intensity;
                data[i + 1] *= intensity;
                data[i + 2] *= intensity;
            }
            hdrTexture.needsUpdate = true;
        },

        // Actualiza la intensidad del HDR
        updateHDRIntensity(intensity) {
            if (!this.currentHdrTexture || !this.environmentEnabled) return;

            // Create a fresh copy from the original texture
            this.setEnvironment();
        },

        // Actualiza el estado de las luces según la configuración
        updateLights(settings) {

            // Itera sobre cada tipo de luz
            for (const [type, setting] of Object.entries(settings)) {
                const light = this.lights[type]?.instance;
                const helper = this.lights[type]?.helper;

                if (light) {
                    light.visible = setting.enabled;
                    light.intensity = setting.intensity;
                }

                if (helper) {
                    helper.visible = setting.enabled;

                    if (helper instanceof THREE.SpotLightHelper) {
                        helper.update();
                    }
                }
            }
        },

        // Configura la cámara perspectiva
        setCamera() {
            this.camera = markRaw(
                new THREE.PerspectiveCamera(
                    75,
                    this.$refs.scene.clientWidth / this.$refs.scene.clientHeight,
                    0.1,
                    1000
                )
            );
            this.camera.position.set(3, 2, 3);
            this.camera.lookAt(0, 0, 0);
        },

        // Inicializa el renderizador WebGL
        setRenderer() {
            this.renderer = markRaw(new THREE.WebGLRenderer({ antialias: true }));
            this.renderer.setSize(
                this.$refs.scene.clientWidth,
                this.$refs.scene.clientHeight
            );
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

            this.$refs.scene
                .querySelector(".scene__canvas")
                .appendChild(this.renderer.domElement);
        },

        // Configura los controles de órbita
        setControls() {
            this.controls = markRaw(
                new OrbitControls(this.camera, this.renderer.domElement)
            );
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.2;
            this.controls.enableZoom = true;
        },

        // Limpia recursos cuando el componente se destruye
        setDispose() {
            if (this.controls) {
                this.controls.dispose();
                this.controls = null;
            }

            if (this.scene) {
                this.scene.traverse((object) => {
                    if (object.geometry) {
                        object.geometry.dispose();
                    }
                    if (object.material) {
                        if (Array.isArray(object.material)) {
                            object.material.forEach((material) => material.dispose());
                        } else {
                            object.material.dispose();
                        }
                    }
                });
            }

            if (this.renderer) {
                this.renderer.dispose();
                if (this.renderer.domElement) {
                    this.renderer.domElement.remove();
                }
                this.renderer = null;
            }
        },

        // Maneja el redimensionamiento de la ventana
        setResize() {
            this.camera.aspect =
                this.$refs.scene.clientWidth / this.$refs.scene.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(
                this.$refs.scene.clientWidth,
                this.$refs.scene.clientHeight
            );
        },

        // Resetea la vista de la cámara
        resetView() {
            if (this.controls) {
                this.controls.reset();
                this.camera.position.set(3, 2, 3);
                this.camera.lookAt(0, 0, 0);
            }
        },

        // Loop de animación principal
        setAnimate() {
            const animate = () => {

                requestAnimationFrame(animate);

                if (this.controls) {
                    this.controls.update();
                }

                this.renderer.render(this.scene, this.camera);
            };
            animate();
        }
    },
};
</script>

<style lang="scss">
// Estilos para el contenedor de la escena
.scene {
    height: 100%;

    &__canvas {
        display: block;
        width: 100%;
        height: 100%;
    }
}
</style>