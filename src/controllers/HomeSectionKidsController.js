import HomeSectionKidsModel from '../models/HomeSectionKidsModel.js';
import HomeSectionKidsService from '../services/HomeSectionKidsService.js';

/**
 * CONTROLLER layer - Logic and operations for "Kids TOP" homepage gallery section.
 * Clean Code: Handles coordination without touching the DOM, implements SRP.
 */
export default class HomeSectionKidsController {
  /**
   * Obtiene todas las fotos de la sección.
   * @returns {Promise<HomeSectionKidsModel[]>}
   */
  async getAllItems() {
    const items = await HomeSectionKidsService.fetchAll();
    // Ordenamos los elementos por el campo "orden" de menor a mayor
    return items.sort((a, b) => a.orden - b.orden);
  }

  /**
   * Obtiene una foto por su identificador.
   * @param {string} id 
   * @returns {Promise<HomeSectionKidsModel>}
   */
  async getItemById(id) {
    const items = await HomeSectionKidsService.fetchAll();
    const matchItem = items.find(item => item.id === id);

    if (!matchItem) {
      throw new Error(`Foto con ID ${id} no encontrada.`);
    }

    return matchItem;
  }

  /**
   * Crea y valida una nueva foto de galería.
   * @param {Object} dataData 
   * @returns {Promise<HomeSectionKidsModel>}
   */
  async createItem(dataData) {
    const items = await HomeSectionKidsService.fetchAll();
    
    // Generación de ID incremental único
    const uniqueId = `kid-${Date.now()}`;
    const newKidPhoto = new HomeSectionKidsModel({ ...dataData, id: uniqueId });
    
    const { isValid, errors } = newKidPhoto.validate();
    if (!isValid) {
      const errorMsg = Object.values(errors).join(' ');
      throw new Error(`Validación fallida: ${errorMsg}`);
    }

    items.push(newKidPhoto);
    await HomeSectionKidsService.saveAll(items);
    return newKidPhoto;
  }

  /**
   * Actualiza una foto existente previa validación.
   * @param {string} id 
   * @param {Object} dataData 
   * @returns {Promise<HomeSectionKidsModel>}
   */
  async updateItem(id, dataData) {
    const items = await HomeSectionKidsService.fetchAll();
    const targetIndex = items.findIndex(item => item.id === id);

    if (targetIndex === -1) {
      throw new Error(`Foto con ID ${id} no encontrada para actualizar.`);
    }

    const updatedKidPhoto = new HomeSectionKidsModel({ ...dataData, id });
    const { isValid, errors } = updatedKidPhoto.validate();
    
    if (!isValid) {
      const errorMsg = Object.values(errors).join(' ');
      throw new Error(`Validación fallida al actualizar: ${errorMsg}`);
    }

    items[targetIndex] = updatedKidPhoto;
    await HomeSectionKidsService.saveAll(items);
    return updatedKidPhoto;
  }

  /**
   * Elimina una foto.
   * @param {string} id 
   * @returns {Promise<boolean>}
   */
  async deleteItem(id) {
    const items = await HomeSectionKidsService.fetchAll();
    const filteredItems = items.filter(item => item.id !== id);

    if (items.length === filteredItems.length) {
      throw new Error(`Foto con ID ${id} no encontrada para eliminar.`);
    }

    await HomeSectionKidsService.saveAll(filteredItems);
    return true;
  }

  /**
   * Alterna la visibilidad (activo/inactivo) de una foto.
   * @param {string} id 
   * @returns {Promise<HomeSectionKidsModel>}
   */
  async toggleVisibility(id) {
    const items = await HomeSectionKidsService.fetchAll();
    const matchItem = items.find(item => item.id === id);

    if (!matchItem) {
      throw new Error(`Foto con ID ${id} no encontrada.`);
    }

    matchItem.activo = !matchItem.activo;
    await HomeSectionKidsService.saveAll(items);
    return matchItem;
  }
}
