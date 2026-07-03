import HomeSectionSearchModel from '../models/HomeSectionSearchModel.js';
import HomeSectionSearchService from '../services/HomeSectionSearchService.js';

/**
 * CONTROLLER layer - Logic and operations for "Lo más buscado" homepage section.
 * Clean Code: Handles coordination without touching the DOM, implements SRP.
 */
export default class HomeSectionSearchController {
  /**
   * Obtiene todas las categorías de la sección.
   * @returns {Promise<HomeSectionSearchModel[]>}
   */
  async getAllItems() {
    return await HomeSectionSearchService.fetchAll();
  }

  /**
   * Obtiene un elemento por su identificador.
   * @param {string} id 
   * @returns {Promise<HomeSectionSearchModel>}
   */
  async getItemById(id) {
    const items = await HomeSectionSearchService.fetchAll();
    const matchItem = items.find(item => item.id === id);

    if (!matchItem) {
      throw new Error(`Elemento con ID ${id} no encontrado.`);
    }

    return matchItem;
  }

  /**
   * Crea y valida un nuevo elemento.
   * @param {Object} dataData 
   * @returns {Promise<HomeSectionSearchModel>}
   */
  async createItem(dataData) {
    const items = await HomeSectionSearchService.fetchAll();
    
    // Generación de ID incremental único
    const uniqueId = `search-${Date.now()}`;
    const newItem = new HomeSectionSearchModel({ ...dataData, id: uniqueId });
    
    const { isValid, errors } = newItem.validate();
    if (!isValid) {
      const errorMsg = Object.values(errors).join(' ');
      throw new Error(`Validación fallida: ${errorMsg}`);
    }

    items.push(newItem);
    await HomeSectionSearchService.saveAll(items);
    return newItem;
  }

  /**
   * Actualiza un elemento existente previa validación.
   * @param {string} id 
   * @param {Object} dataData 
   * @returns {Promise<HomeSectionSearchModel>}
   */
  async updateItem(id, dataData) {
    const items = await HomeSectionSearchService.fetchAll();
    const targetIndex = items.findIndex(item => item.id === id);

    if (targetIndex === -1) {
      throw new Error(`Elemento con ID ${id} no encontrado para actualizar.`);
    }

    const updatedItem = new HomeSectionSearchModel({ ...dataData, id });
    const { isValid, errors } = updatedItem.validate();
    
    if (!isValid) {
      const errorMsg = Object.values(errors).join(' ');
      throw new Error(`Validación fallida al actualizar: ${errorMsg}`);
    }

    items[targetIndex] = updatedItem;
    await HomeSectionSearchService.saveAll(items);
    return updatedItem;
  }

  /**
   * Elimina un elemento.
   * @param {string} id 
   * @returns {Promise<boolean>}
   */
  async deleteItem(id) {
    const items = await HomeSectionSearchService.fetchAll();
    const filteredItems = items.filter(item => item.id !== id);

    if (items.length === filteredItems.length) {
      throw new Error(`Elemento con ID ${id} no encontrado para eliminar.`);
    }

    await HomeSectionSearchService.saveAll(filteredItems);
    return true;
  }

  /**
   * Alterna la visibilidad (activo/inactivo) de un elemento.
   * @param {string} id 
   * @returns {Promise<HomeSectionSearchModel>}
   */
  async toggleVisibility(id) {
    const items = await HomeSectionSearchService.fetchAll();
    const matchItem = items.find(item => item.id === id);

    if (!matchItem) {
      throw new Error(`Elemento con ID ${id} no encontrado.`);
    }

    matchItem.activo = !matchItem.activo;
    await HomeSectionSearchService.saveAll(items);
    return matchItem;
  }
}
