<template>
    <div ref="scene" class="scene">
        <span class="scene__canvas" @dblclick="resetView()"> </span>
    </div>
</template>

<script>
import { markRaw } from "vue";
import { gsap } from "gsap";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { RectAreaLight } from 'three'; // ✅ correcto
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js'; // ✅ correcto
import {
    DirectionalLightHelper,
    PointLightHelper,
    SpotLightHelper,
    HemisphereLightHelper
} from "three";



export default {
    name: "Scene",
    props: {
        lightSettings: {
            type: Object,
            default: () => ({
                ambient: { enabled: false, intensity: 1 },
                directional: { enabled: false, intensity: 1 },
                point: { enabled: false, intensity: 1 },
                spot: { enabled: false, intensity: 1 }
            })
        }
    },
    data() {
        return {
            scene: null,
            camera: null,
            renderer: null,
            controls: null,
            lights: {
                ambient: { instance: null },
                directional: { instance: null, helper: null },
                point: { instance: null, helper: null },
                spot: { instance: null, helper: null },
                hemisphere: { instance: null, helper: null },
                rect: { instance: null } // sin helper aún
            }
        };
    },
    created() {
        window.addEventListener("resize", this.setResize);
    },
    unmounted() {
        window.removeEventListener("resize", this.setResize);
        this.setDispose();
    },
    watch: {
        lightSettings: {
            handler(newSettings) {
                this.updateLights(newSettings);
            },
            deep: true
        }
    },
    async mounted() {
        this.setScene();
        this.setLighting();
        this.setCamera();
        this.setRenderer();
        this.setControls();
        this.setResize();

        // Create the cube
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({
            color: 0x00ff00,
            metalness: 0.5,
            roughness: 0.1,
        });

        // Create the mesh and add it to the scene
        const cube = new THREE.Mesh(geometry, material);
        this.scene.add(cube);

        // Start the animation loop
        this.setAnimate();

        // Apply initial light settings
        this.updateLights(this.lightSettings);
    },
    methods: {
        setScene() {
            this.scene = markRaw(new THREE.Scene());
            this.scene.background = new THREE.Color(0xffffff);
        },
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
            this.scene.add(directionalLight);
            this.lights.directional.instance = directionalLight;

            // Directional Light Helper
            const directionalHelper = new THREE.DirectionalLightHelper(directionalLight, 1, 0xff0000); // Color rojo
            directionalHelper.visible = false; // Cambia a true si quieres que sea visible por defecto
            this.scene.add(directionalHelper);
            this.lights.directional.helper = directionalHelper;

            // Point Light
            const pointLight = new THREE.PointLight(0xffffff, 1);
            pointLight.position.set(5, 5, 5);
            pointLight.visible = false;
            this.scene.add(pointLight);
            this.lights.point.instance = pointLight;

            const pointHelper = new PointLightHelper(pointLight, 0.5,  0xff0000); // ✅ helper real
            pointHelper.visible = false;
            this.scene.add(pointHelper);
            this.lights.point.helper = pointHelper;


            // Spot Light
            const spotLight = new THREE.SpotLight(0xffffff, 1);
            spotLight.position.set(1, 2, 1);
            spotLight.visible = false;
            this.scene.add(spotLight);
            this.lights.spot.instance = spotLight;

            // SpotLight Helper
            const spotHelper = new SpotLightHelper(spotLight,  0xff0000);
            spotHelper.visible = false;
            this.scene.add(spotHelper);
            this.lights.spot.helper = spotHelper;

            // Hemisphere Light
            const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
            hemisphereLight.visible = false;
            this.scene.add(hemisphereLight);
            this.lights.hemisphere.instance = hemisphereLight;

            // Hemisphere Helper
            const hemiHelper = new HemisphereLightHelper(hemisphereLight, 1,  0xff0000);
            hemiHelper.visible = false;
            this.scene.add(hemiHelper);
            this.lights.hemisphere.helper = hemiHelper;

            RectAreaLightUniformsLib.init();

            const rectLight = new RectAreaLight(0xffffff, 5, 4, 4); // intensidad, ancho, alto
            rectLight.position.set(0, 2, -3);
            rectLight.lookAt(0, 0, 0);
            rectLight.visible = false;
            this.scene.add(rectLight);
            this.lights.rect.instance = rectLight;

        },
        updateLights(settings) {
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
        setCamera() {
            this.camera = markRaw(
                new THREE.PerspectiveCamera(
                    50,
                    this.$refs.scene.clientWidth / this.$refs.scene.clientHeight,
                    0.1,
                    2000
                )
            );
            this.camera.position.set(3, 2, 3);
            this.camera.lookAt(0, 0, 0);
        },
        setRenderer() {
            this.renderer = markRaw(new THREE.WebGLRenderer({ antialias: true }));
            this.renderer.setSize(
                this.$refs.scene.clientWidth,
                this.$refs.scene.clientHeight
            );
            this.renderer.shadowMap.enabled = true;
            this.$refs.scene
                .querySelector(".scene__canvas")
                .appendChild(this.renderer.domElement);
        },
        setControls() {
            this.controls = markRaw(
                new OrbitControls(this.camera, this.renderer.domElement)
            );
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.2;
            this.controls.enableZoom = true;
        },
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
        setResize() {
            this.camera.aspect =
                this.$refs.scene.clientWidth / this.$refs.scene.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(
                this.$refs.scene.clientWidth,
                this.$refs.scene.clientHeight
            );
        },
        resetView() {
            if (this.controls) {
                this.controls.reset();
                this.camera.position.set(3, 2, 3);
                this.camera.lookAt(0, 0, 0);
            }
        },
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

<style lang="scss" scoped>
.scene {
    height: 100%;

    &__canvas {
        display: block;
        width: 100%;
        height: 100%;
    }
}
</style>