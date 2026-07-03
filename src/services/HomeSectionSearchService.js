import HomeSectionSearchModel from '../models/HomeSectionSearchModel.js';

const STORAGE_KEY = 'topitop_home_section_search';

const MOCK_SEARCH_ITEMS = [
  { id: 'search-1', categoria: 'Accesorios', subcategoria: 'Mujer Top', urlImagen: 'images/LoMasBuscado/cartera_mb.png', activo: true },
  { id: 'search-2', categoria: 'Calzados', subcategoria: 'Mujer Top', urlImagen: 'images/LoMasBuscado/calzado_mb.png', activo: true },
  { id: 'search-3', categoria: 'Calzados', subcategoria: 'Hombre Top', urlImagen: 'images/LoMasBuscado/calzadoHombres_mb.png', activo: true },
  { id: 'search-4', categoria: 'Calzados', subcategoria: 'Kid Top', urlImagen: 'images/LoMasBuscado/calzadosKidTop_mb.png', activo: true },
  { id: 'search-5', categoria: 'Calzados', subcategoria: 'Mujer Top', urlImagen: 'images/LoMasBuscado/calzadoMujer_mb.png', activo: true }
];

/**
 * SERVICE layer - Manages persistence for "Lo más buscado" section in localStorage.
 * Clean Code: Handles storage abstraction, error propagation, and mocks.
 */
export default class HomeSectionSearchService {
  /**
   * Obtiene todos los elementos buscados de la persistencia.
   * @returns {Promise<HomeSectionSearchModel[]>}
   */
  static async fetchAll() {
    try {
      let data = localStorage.getItem(STORAGE_KEY);
      
      if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_SEARCH_ITEMS));
        data = JSON.stringify(MOCK_SEARCH_ITEMS);
      }

      const parsedList = JSON.parse(data);
      return parsedList.map(item => HomeSectionSearchModel.fromJSON(item));
    } catch (error) {
      throw new Error(`Error al leer sección "Lo más buscado" del almacenamiento: ${error.message}`);
    }
  }

  /**
   * Guarda el listado completo de categorías en la persistencia.
   * @param {HomeSectionSearchModel[]} items 
   * @returns {Promise<void>}
   */
  static async saveAll(items) {
    try {
      const plainList = items.map(item => item.toJSON());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plainList));
    } catch (error) {
      throw new Error(`Error al escribir sección "Lo más buscado" en el almacenamiento: ${error.message}`);
    }
  }
}
