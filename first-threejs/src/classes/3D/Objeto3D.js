import * as THREE from 'three';

export default class Object3D {
  constructor(object) {
    this.name = new String();
    this.model = object;
    this.parts = [];
    this.result = null;
    this.materials = {};
    this.cotas = [];
  }
  setMaterials() {
    this.materials.base = new THREE.MeshStandardMaterial({
      name: 'base',
      map: null,
      roughnessMap: null,
      metalnessMap: null,
      normalMap: null,
      roughness: 0.5,
      metalness: 0.5,
    });
  }
  setPartsMaterial() {
    // Recorre todos los materiales del objeto 3D
    this.model.traverse((child) => {
      if (child.isMesh && child.material) {
        let materiales = Array.isArray(child.material)
          ? child.material
          : [child.material];

        materiales.forEach((mat, index) => {
          if (this.materials[mat.name]) {
            materiales[index] = this.materials[mat.name];
          }
        });
        child.castShadow = true;
        child.receiveShadow = true;

        // Asignar el array modificado al material del nodo
        child.material = Array.isArray(child.material)
          ? materiales
          : materiales[0];
      }
    });
  }
  setTextures(texturas) {
    const actualizarMaterial = (material) => {
      material.map = texturas.map || null;
      material.roughnessMap = texturas.roughnessMap || null;
      material.metalnessMap = texturas.metalnessMap || null;

      if (texturas.normalMap) {
        material.normalMap = texturas.normalMap;
        material.normalScale.set(-0.4, -0.4);
      } else {
        material.normalMap = null;
        material.normalScale.set(0, 0);
      }

      material.needsUpdate = true;
    };

    actualizarMaterial(this.materials.base);
  }
  redraw() {}
}
