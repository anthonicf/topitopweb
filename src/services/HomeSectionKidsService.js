import HomeSectionKidsModel from '../models/HomeSectionKidsModel.js';

const STORAGE_KEY = 'topitop_home_section_kids';

const MOCK_KIDS_PHOTOS = [
  { id: 'kid-1', urlImagen: 'images/KidsTop/kids_1.jpg', orden: 1, activo: true },
  { id: 'kid-2', urlImagen: 'images/KidsTop/kids_2.webp', orden: 2, activo: true },
  { id: 'kid-3', urlImagen: 'images/KidsTop/kids_3.jpg', orden: 3, activo: true },
  { id: 'kid-4', urlImagen: 'images/KidsTop/kids_4.jpg', orden: 4, activo: true },
  { id: 'kid-5', urlImagen: 'images/KidsTop/kids_5.jpg', orden: 5, activo: true }
];

/**
 * SERVICE layer - Manages persistence for "Kids TOP" section in localStorage.
 * Clean Code: Handles storage abstraction, error propagation, and mocks.
 */
export default class HomeSectionKidsService {
  /**
   * Obtiene todas las fotos de la persistencia.
   * @returns {Promise<HomeSectionKidsModel[]>}
   */
  static async fetchAll() {
    try {
      let data = localStorage.getItem(STORAGE_KEY);
      
      if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_KIDS_PHOTOS));
        data = JSON.stringify(MOCK_KIDS_PHOTOS);
      }

      const parsedList = JSON.parse(data);
      return parsedList.map(item => HomeSectionKidsModel.fromJSON(item));
    } catch (error) {
      throw new Error(`Error al leer sección "Kids TOP" del almacenamiento: ${error.message}`);
    }
  }

  /**
   * Guarda el listado completo de fotos de Kids en la persistencia.
   * @param {HomeSectionKidsModel[]} items 
   * @returns {Promise<void>}
   */
  static async saveAll(items) {
    try {
      const plainList = items.map(item => item.toJSON());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plainList));
    } catch (error) {
      throw new Error(`Error al escribir sección "Kids TOP" en el almacenamiento: ${error.message}`);
    }
  }
}
