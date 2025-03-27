import * as THREE from "three";
import { gsap } from "gsap";
import { ADDITION, Brush, Evaluator, SUBTRACTION } from "three-bvh-csg";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

// import model from "@/assets/scene/modelo.fbx";

export function describeObject(object3D) {
  let table = [];

  // Función auxiliar para agregar filas al arreglo de la tabla
  function addTableEntry(object, materialName = "") {
    table.push({
      // objeto: object.name,
      objeto: object.name || "(sin nombre)",
      tipo: object.type,
      material: materialName,
    });
  }

  // Recorremos todos los elementos en la jerarquía
  object3D.traverse(function (object) {
    if (object.type === "Group") {
      // Si el objeto es un grupo, lo agregamos a la tabla sin material
      addTableEntry(object);
    } else if (object instanceof THREE.Mesh) {
      // Si el objeto es un Mesh, chequeamos si tiene materiales
      if (Array.isArray(object.material)) {
        object.material.forEach((material) => {
          addTableEntry(object, material.name);
        });
      } else {
        addTableEntry(object, object.material.name);
      }
    }
  });

  // Ordenamos por tipo de objeto y luego por nombre
  table.sort((a, b) => {
    if (a.tipo === b.tipo) {
      return a.objeto.localeCompare(b.objeto);
    }
    return a.tipo.localeCompare(b.tipo);
  });

  console.table(table);
}
export function cubeDebug(scale, position, texture) {
  // Crear el cubo
  let geometry = new THREE.BoxGeometry(scale.x, scale.y, scale.z); // Geometría de un cubo
  let material = new THREE.MeshStandardMaterial({
    color: 0x00ff00,
    roughness: 0.5,
    metalness: 0.5,
  });
  if (texture) {
    material.map = texture;
  }
  const cube = new THREE.Mesh(geometry, material);
  cube.position.copy(position);
  return cube;
}
export function cloneObject3D(sourceObject) {
  const clonedGeometry = sourceObject.geometry.clone();
  let clonedMaterials;

  // if (Array.isArray(sourceObject.material)) {
  //   clonedMaterials = sourceObject.material.map((mat) => mat.clone());
  // } else if (sourceObject.material) {
  //   clonedMaterials = sourceObject.material.clone();
  // } else {
  //   clonedMaterials = [];
  // }

  clonedMaterials = sourceObject.material;

  const object = new THREE.Mesh(clonedGeometry, clonedMaterials);
  object.position.copy(sourceObject.position);
  object.rotation.copy(sourceObject.rotation);
  object.scale.copy(sourceObject.scale);

  return object;
}
export function cloneObject3DRecursive(sourceObject) {
  // Clona las propiedades comunes de THREE.Object3D
  const clonedObject = new sourceObject.constructor(); // Crea un clon basado en el tipo exacto del objeto original

  // Clonar la geometría si está presente
  if (sourceObject.geometry) {
    clonedObject.geometry = sourceObject.geometry.clone();
  }

  // Clonar el material si está presente
  if (sourceObject.material) {
    if (Array.isArray(sourceObject.material)) {
      clonedObject.material = sourceObject.material.map((mat) => mat.clone());
    } else {
      clonedObject.material = sourceObject.material.clone();
    }
  }

  // Copiar transformaciones
  clonedObject.position.copy(sourceObject.position);
  clonedObject.rotation.copy(sourceObject.rotation);
  clonedObject.scale.copy(sourceObject.scale);
  clonedObject.quaternion.copy(sourceObject.quaternion);
  clonedObject.matrix.copy(sourceObject.matrix);
  clonedObject.matrixWorld.copy(sourceObject.matrixWorld);

  // Copiar otras propiedades relevantes (nombre, visibilidad, etc.)
  clonedObject.name = sourceObject.name;
  clonedObject.visible = sourceObject.visible;
  clonedObject.castShadow = sourceObject.castShadow;
  clonedObject.receiveShadow = sourceObject.receiveShadow;
  clonedObject.frustumCulled = sourceObject.frustumCulled;
  clonedObject.renderOrder = sourceObject.renderOrder;
  clonedObject.userData = { ...sourceObject.userData }; // Clonar datos personalizados

  // Recorrer y clonar los hijos (si tiene)
  sourceObject.children.forEach((child) => {
    const clonedChild = cloneObject3DRecursive(child); // Clon recursivo
    clonedObject.add(clonedChild);
  });

  return clonedObject; // Retorna el clon completo
}
export function setScaleUV(object, scaleU, scaleV) {
  if (!object.geometryIni) {
    console.log(
      "salva",
      "El objeto " + object.name + " no tiene geometría inicial"
    );
    return;
  }

  // Iterar sobre las coordenadas UV y modificarlas en base a la escala
  for (let i = 0; i < object.geometry.attributes.uv.array.length; i += 2) {
    object.geometry.attributes.uv.array[i] =
      object.geometryIni.attributes.uv.array[i] * scaleU; // Ajuste de UVs según scaleU
    object.geometry.attributes.uv.array[i + 1] =
      object.geometryIni.attributes.uv.array[i + 1] * scaleV; // Ajuste de UVs según scaleV
  }

  // Marcar las UVs como actualizadas
  object.geometry.attributes.uv.needsUpdate = true;
  object.material.needsUpdate = true;
}
export function setScaleTexture(object, scaleU, scaleV) {
  if (!object.material) {
    console.warn("El objeto no tiene materiales:", object);
    return;
  }

  const applyScaleToMaterial = (material, scale) => {
    if (!material || !scale) return; // Verifica que el material y la escala no sean nulos o indefinidos

    const textures = ["map", "normalMap", "roughnessMap", "metalnessMap"];

    textures.forEach((textureKey) => {
      if (material[textureKey]) {
        material[textureKey].repeat.set(scaleU, scaleV);
        material[textureKey].needsUpdate = true;
      }
    });
  };

  if (object.material.isMaterial) {
    // Material único
    applyScaleToMaterial(object.material, scaleU, scaleV);
  } else if (Array.isArray(object.material)) {
    // Multimaterial
    object.material.forEach((material, index) => {
      applyScaleToMaterial(material, scaleU, scaleV);
    });
  } else {
    console.warn("Formato de material desconocido en el objeto:", object);
  }
}
export function getScaleRelative(dimObjetoIni, dimIni, dim) {
  let diferencia = dimIni - dimObjetoIni;
  return (dim - diferencia) / dimObjetoIni;
}
export function animateScaleUV(object3D, targetScale, duration = 0.5) {
  object3D.children.forEach((element) => {
    if (element.material != null) {
      const materials = Array.isArray(element.material)
        ? element.material
        : [element.material];

      materials.forEach((material) => {
        if (material.map) {
          gsap.to(material.map.repeat, {
            x: targetScale.x,
            y: targetScale.y,
            duration: duration,
            ease: "power2.inOut",
          });
        }
        console.log(material);
        if (material.normalMap) {
          gsap.to(material.normalMap.repeat, {
            x: targetScale.x,
            y: targetScale.y,
            duration: duration,
            ease: "power2.inOut",
          });
        }

        if (material.roughnessMap) {
          gsap.to(material.roughnessMap.repeat, {
            x: targetScale.x,
            y: targetScale.y,
            duration: duration,
            ease: "power2.inOut",
          });
        }

        if (material.metalnessMap) {
          gsap.to(material.metalnessMap.repeat, {
            x: targetScale.x,
            y: targetScale.y,
            duration: duration,
            ease: "power2.inOut",
          });
        }
        material.needsUpdate = true;
      });
    }
  });

  if (object3D.material != null) {
    const materials = Array.isArray(object3D.material)
      ? object3D.material
      : [object3D.material];

    materials.forEach((material) => {
      if (material.map) {
        gsap.to(material.map.repeat, {
          x: targetScale.x,
          y: targetScale.y,
          duration: duration,
          ease: "power2.inOut",
        });
      }
      console.log(material);
      if (material.normalMap) {
        gsap.to(material.normalMap.repeat, {
          x: targetScale.x,
          y: targetScale.y,
          duration: duration,
          ease: "power2.inOut",
        });
      }

      if (material.roughnessMap) {
        gsap.to(material.roughnessMap.repeat, {
          x: targetScale.x,
          y: targetScale.y,
          duration: duration,
          ease: "power2.inOut",
        });
      }

      if (material.metalnessMap) {
        gsap.to(material.metalnessMap.repeat, {
          x: targetScale.x,
          y: targetScale.y,
          duration: duration,
          ease: "power2.inOut",
        });
      }
      material.needsUpdate = true;
    });
  }
}
export function hideChildren(object) {
  if (!object || !object.children) {
    throw new Error(
      "Invalid object provided. Ensure it's a THREE.Object3D instance."
    );
  }

  // Recorremos todos los hijos y los ponemos invisibles
  object.children.forEach((child) => {
    child.visible = false;
  });
}
export function setVisible(parentObject, nameArray, isVisible, prefix = "") {
  if (
    !Array.isArray(nameArray) ||
    typeof parentObject !== "object" ||
    typeof isVisible !== "boolean"
  ) {
    throw new Error(
      "Invalid arguments. Ensure correct types for nameArray, parentObject, and isVisible."
    );
  }

  // Iterar sobre los nombres en el array
  nameArray.forEach((name) => {
    const fullName = prefix + name; // Agregar el prefijo al nombre
    const foundObject = parentObject.getObjectByName(fullName);
    if (foundObject) {
      foundObject.visible = isVisible;
    }
  });
}

export function setScale3D(object, boolean, dimIni, dimScale, axis) {
  let partL, partR;

  // boolean.position.copy(object.position);
  switch (axis) {
    case "x":
      boolean.rotation.set(0, 0, 0);
      object.position.x = -(dimIni - dimScale) / 2;
      partR = substraction(object, boolean);

      boolean.rotation.set(0, Math.PI, 0);
      object.position.x = (dimIni - dimScale) / 2;
      partL = substraction(object, boolean);

      break;
    case "y":
      break;
    case "z":
      boolean.rotation.set(0, -Math.PI / 2, 0);
      object.position.z = -(dimIni - dimScale) / 2;
      partR = substraction(object, boolean);

      boolean.rotation.set(0, Math.PI / 2, 0);
      object.position.z = (dimIni - dimScale) / 2;
      partL = substraction(object, boolean);
      break;
    default:
      break;
  }

  return addition([partR, partL]);
  // return partR;
  // return object;
}
export function setOffset(object3D, newOffset) {
  if (object3D.material != null) {
    if (object3D.material.isMaterial) {
      if (object3D.material.map != null) {
        object3D.material.map.offset.set(newOffset.x, newOffset.y);
        object3D.material.map.needsUpdate = true;
      }
    } else {
      object3D.material.forEach((material) => {
        if (material.map != null) {
          material.map.offset.set(newOffset.x, newOffset.y);
          material.map.needsUpdate = true;
        }
      });
    }
  } else {
    // console.log('No tiene materiales', object3D);
  }
}
export function substraction(objectA, objectB) {
  let result;
  let brushA, brushB;
  let evaluator;

  // try {
  // Only runs when there is an error/exception
  brushA = new Brush(objectA.geometry, objectA.material);
  brushA.position.copy(objectA.position);
  brushA.rotation.copy(objectA.rotation);
  brushA.scale.copy(objectA.scale);
  brushA.updateMatrixWorld();

  brushB = new Brush(objectB.geometry, objectB.material);
  brushB.position.copy(objectB.position);
  brushB.rotation.copy(objectB.rotation);
  brushB.scale.copy(objectB.scale);
  brushB.updateMatrixWorld();

  evaluator = new Evaluator();
  result = evaluator.evaluate(brushA, brushB, SUBTRACTION);
  result.updateMatrixWorld();
  return result;
}
export function addition(objects) {
  let result;
  let brushA;
  let brushB;
  let evaluator;

  result = objects[0];
  objects.shift();

  evaluator = new Evaluator();
  objects.forEach((object) => {
    brushA = new Brush(result.geometry, result.material);
    brushA.position.copy(object.position);
    brushA.rotation.copy(object.rotation);
    brushA.scale.copy(object.scale);
    //brushA.updateMatrixWorld();

    brushB = new Brush(object.geometry, object.material);
    brushB.position.copy(object.position);
    brushB.rotation.copy(object.rotation);
    brushB.scale.copy(object.scale);
    //brushB.updateMatrixWorld();

    result = evaluator.evaluate(brushA, brushB, ADDITION);
  });

  return result;
}
export function loadTexture(file) {
  return new Promise((resolve) => {
    // Crear un cargador de texturas y cargar la textura
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      file,
      (texture) => {
        texture.name = file;
        resolve(texture);
      },
      undefined,
      (error) => {
        console.error("Error al cargar la textura:", error);
      }
    );
  });
}
export function loadModelGLTF(file) {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load(
      "modelos/" + file + ".glb",
      (gltf) => {
        resolve(gltf.scene);
      },
      undefined,
      (error) => {
        reject(error);
      }
    );
  });
}
export function loadModelFBX(file) {
  return new Promise((resolve, reject) => {
    const loader = new FBXLoader();

    loader.load(
      model,
      (fbx) => {
        resolve(fbx);
      },
      undefined,
      (error) => {
        reject(error);
      }
    );
  });
}
export function setTransparent(object3D, colorCod) {
  let that = this;
  let color = new THREE.Color(colorCod);
  let material = new THREE.MeshStandardMaterial({
    color: colorCod,
    transparent: true,
    opacity: 0.2,
  });

  object3D.traverse(function (object) {
    // Verificar si el objeto es una malla (geometry + material)
    if (object instanceof THREE.Mesh) {
      that.setMaterialObject3D(object, [material]);
      // Asignar el nuevo material
      // if (Array.isArray(object.material)) {
      // 	object.material.forEach((material) => {
      // 		material.transparent = true;
      // 		material.opacity = 0.2;
      // 		material.color = color;
      // 		// material.flatShading = true;
      // 	});
      // } else {
      // 	object.material.transparent = true;
      // 	object.material.opacity = 0.2;
      // 	object.material.color = color;
      // 	// object.material.flatShading = true;
      // }
    } else if (object.type == "Object3D" || object.type == "Group") {
    } else {
      console.log("No es Objeto", object);
    }
  });
}
export function setMaterialObject3D(object, sourceMaterial) {
  //console.log(object.material)

  if (Array.isArray(object.material)) {
    object.material[0] = sourceMaterial[0].clone();
    object.material[1] = sourceMaterial[1].clone();
    object.material[2] = sourceMaterial[2].clone();

    // object.material[1] = sourceMaterial[1].clone()
    // object.material.forEach((material: any, indice: number) => {
    //   material = sourceMaterial[indice];
    // });
  } else {
    object.material = sourceMaterial[0].clone();
  }
}

// Función para convertir kelvin a color RGB
export function kelvinToRGB(kelvin) {
  let temp = kelvin / 100;
  let red, green, blue;

  if (temp <= 66) {
    red = 255;
    green =
      temp <= 19 ? 0 : 99.4708025861 * Math.log(temp - 10) - 161.1195681661;
    blue =
      temp <= 19 ? 0 : 138.5177312231 * Math.log(temp - 10) - 305.0447927307;
  } else {
    red = 329.698727446 * Math.pow(temp - 60, -0.1332047592);
    green = 288.1221695283 * Math.pow(temp - 60, -0.0755148492);
    blue = 255;
  }

  return new THREE.Color(
    Math.min(Math.max(red, 0), 255) / 255,
    Math.min(Math.max(green, 0), 255) / 255,
    Math.min(Math.max(blue, 0), 255) / 255
  );
}
