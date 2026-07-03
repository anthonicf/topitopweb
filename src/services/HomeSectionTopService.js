import HomeSectionTopModel from '../models/HomeSectionTopModel.js';

const STORAGE_KEY = 'topitop_home_section_top';

const MOCK_TOP_PRODUCTS = [
  { id: 'top-1', nombre: 'Miluska', color: 'CAMELL', precio: 99.90, descuento: 0, urlImagen: 'images/TopModelos/modelo_1.png', genero: 'mujer', activo: true },
  { id: 'top-2', nombre: 'Atlantic', color: 'BEIGE', precio: 79.90, descuento: 0, urlImagen: 'images/TopModelos/modelo_2.png', genero: 'mujer', activo: true },
  { id: 'top-3', nombre: 'Susana', color: 'BLANCO', precio: 89.90, descuento: 20, urlImagen: 'images/TopModelos/modelo_3.png', genero: 'mujer', activo: true },
  { id: 'top-4', nombre: 'Paolo', color: 'BLANCO', precio: 79.90, descuento: 0, urlImagen: 'images/TopModelos/modelo_4.png', genero: 'hombre', activo: true },
  { id: 'top-5', nombre: 'Camile', color: 'SOLID', precio: 99.90, descuento: 0, urlImagen: 'images/TopModelos/modelo_5.png', genero: 'mujer', activo: true }
];

/**
 * SERVICE layer - Manages persistence for "Lo más TOP" section in localStorage.
 * Clean Code: Handles storage abstraction, error propagation, and mocks.
 */
export default class HomeSectionTopService {
  /**
   * Obtiene todos los productos del almacenamiento.
   * @returns {Promise<HomeSectionTopModel[]>}
   */
  static async fetchAll() {
    try {
      let data = localStorage.getItem(STORAGE_KEY);
      
      if (!data) {
        // Inicializamos con Mock Data si el localStorage está vacío
        localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_TOP_PRODUCTS));
        data = JSON.stringify(MOCK_TOP_PRODUCTS);
      }

      const parsedList = JSON.parse(data);
      return parsedList.map(item => HomeSectionTopModel.fromJSON(item));
    } catch (error) {
      throw new Error(`Error al leer catálogo TOP del almacenamiento: ${error.message}`);
    }
  }

  /**
   * Guarda el listado completo de productos en el almacenamiento.
   * @param {HomeSectionTopModel[]} items 
   * @returns {Promise<void>}
   */
  static async saveAll(items) {
    try {
      const plainList = items.map(item => item.toJSON());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plainList));
    } catch (error) {
      throw new Error(`Error al escribir catálogo TOP en el almacenamiento: ${error.message}`);
    }
  }
}
