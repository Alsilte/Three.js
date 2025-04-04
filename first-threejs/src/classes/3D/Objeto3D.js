import * as THREE from 'three';  // Importa la biblioteca Three.js completa

/**
 * Clase para gestionar objetos 3D y sus materiales en Three.js
 * Proporciona métodos para configurar materiales, texturas y gestionar el modelo 3D
 */
export default class Object3D {
  /**
   * Constructor que inicializa un nuevo objeto 3D
   * @param {THREE.Object3D} object - Objeto 3D de Three.js a gestionar
   */
  constructor(object) {
    this.name = new String();           // Identificador del objeto como string
    this.model = object;                // Almacena el objeto 3D pasado como parámetro
    this.parts = [];                    // Array para almacenar partes o componentes del objeto
    this.result = null;                 // Variable para almacenar posibles resultados de operaciones
    this.materials = {};                // Objeto para almacenar materiales personalizados
    this.cotas = [];                    // Array para almacenar dimensiones o medidas
  }

  /**
   * Configura el material base con propiedades estándar
   * Crea un MeshStandardMaterial con valores predeterminados
   */
  setMaterials() {
    // Crea un material estándar con propiedades básicas
    this.materials.base = new THREE.MeshStandardMaterial({
      name: 'base',                     // Nombre del material para referencia
      map: null,                        // Mapa de textura difusa (color)
      roughnessMap: null,               // Mapa de rugosidad (cómo de áspera es la superficie)
      metalnessMap: null,               // Mapa de metalicidad (cómo de metálica se ve la superficie)
      normalMap: null,                  // Mapa normal (detalles de relieve)
      roughness: 0.5,                   // Valor de rugosidad (0=liso, 1=áspero)
      metalness: 0.5,                   // Valor de metalicidad (0=no metálico, 1=metálico)
    });
  }

  /**
   * Recorre el modelo 3D y aplica los materiales personalizados a sus partes
   * Reemplaza los materiales originales con los definidos en this.materials
   */
  setPartsMaterial() {
    // Recorre todos los nodos del objeto 3D (mesh, grupos, etc.)
    this.model.traverse((child) => {
      // Comprueba si el nodo es una malla y tiene material asignado
      if (child.isMesh && child.material) {
        // Convierte el material a un array para procesamiento uniforme
        // (algunos objetos pueden tener múltiples materiales)
        let materiales = Array.isArray(child.material)
          ? child.material                // Si ya es un array, lo usa directamente
          : [child.material];             // Si no, crea un array con el único material

        // Recorre cada material y lo reemplaza si existe uno personalizado con el mismo nombre
        materiales.forEach((mat, index) => {
          if (this.materials[mat.name]) {
            // Reemplaza el material con el personalizado
            materiales[index] = this.materials[mat.name];
          }
        });
        
        // Configura la malla para proyectar y recibir sombras
        child.castShadow = true;        // La malla proyectará sombras
        child.receiveShadow = true;     // La malla recibirá sombras

        // Asigna los materiales actualizados de vuelta a la malla
        child.material = Array.isArray(child.material)
          ? materiales                   // Si originalmente era un array, asigna el array completo
          : materiales[0];               // Si no, asigna solo el primer elemento
      }
    });
  }

  /**
   * Actualiza las texturas de los materiales
   * @param {Object} texturas - Objeto con las texturas a aplicar
   */
  setTextures(texturas) {
    // Función interna para actualizar un material con las texturas proporcionadas
    const actualizarMaterial = (material) => {
      // Asigna los mapas de texturas o null si no existen
      material.map = texturas.map || null;                 // Textura de color/difusa
      material.roughnessMap = texturas.roughnessMap || null; // Textura de rugosidad
      material.metalnessMap = texturas.metalnessMap || null; // Textura de metalicidad

      // Configura el mapa normal y su escala si existe
      if (texturas.normalMap) {
        material.normalMap = texturas.normalMap;           // Asigna el mapa normal
        material.normalScale.set(-0.4, -0.4);             // Configura la intensidad del efecto normal
      } else {
        material.normalMap = null;                        // Sin mapa normal
        material.normalScale.set(0, 0);                   // Sin efecto normal
      }

      // Marca el material para ser actualizado en el renderizado
      material.needsUpdate = true;
    };

    // Aplica las actualizaciones al material base
    actualizarMaterial(this.materials.base);
  }

  /**
   * Método para redibujar o actualizar el objeto (vacío, para implementar)
   * Probablemente destinado a ser sobrescrito en clases heredadas
   */
  redraw() {
    // Método vacío, para ser implementado según necesidades específicas
  }
}