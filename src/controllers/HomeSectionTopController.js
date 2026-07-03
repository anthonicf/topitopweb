import HomeSectionTopModel from '../models/HomeSectionTopModel.js';
import HomeSectionTopService from '../services/HomeSectionTopService.js';

/**
 * CONTROLLER layer - Logic and operations for "Lo más TOP" homepage section.
 * Clean Code: Handles coordination without touching the DOM, implements SRP.
 */
export default class HomeSectionTopController {
  /**
   * Obtiene todos los productos de la sección.
   * @returns {Promise<HomeSectionTopModel[]>}
   */
  async getAllItems() {
    return await HomeSectionTopService.fetchAll();
  }

  /**
   * Obtiene un producto por su identificador.
   * @param {string} id 
   * @returns {Promise<HomeSectionTopModel>}
   */
  async getItemById(id) {
    const items = await HomeSectionTopService.fetchAll();
    const matchItem = items.find(item => item.id === id);

    if (!matchItem) {
      throw new Error(`Producto con ID ${id} no encontrado.`);
    }

    return matchItem;
  }

  /**
   * Crea y valida un nuevo producto.
   * @param {Object} dataData 
   * @returns {Promise<HomeSectionTopModel>}
   */
  async createItem(dataData) {
    const items = await HomeSectionTopService.fetchAll();
    
    // Generación de ID incremental único
    const uniqueId = `top-${Date.now()}`;
    const newProduct = new HomeSectionTopModel({ ...dataData, id: uniqueId });
    
    const { isValid, errors } = newProduct.validate();
    if (!isValid) {
      const errorMsg = Object.values(errors).join(' ');
      throw new Error(`Validación fallida: ${errorMsg}`);
    }

    items.push(newProduct);
    await HomeSectionTopService.saveAll(items);
    return newProduct;
  }

  /**
   * Actualiza un producto existente previa validación.
   * @param {string} id 
   * @param {Object} dataData 
   * @returns {Promise<HomeSectionTopModel>}
   */
  async updateItem(id, dataData) {
    const items = await HomeSectionTopService.fetchAll();
    const targetIndex = items.findIndex(item => item.id === id);

    if (targetIndex === -1) {
      throw new Error(`Producto con ID ${id} no encontrado para actualizar.`);
    }

    const updatedProduct = new HomeSectionTopModel({ ...dataData, id });
    const { isValid, errors } = updatedProduct.validate();
    
    if (!isValid) {
      const errorMsg = Object.values(errors).join(' ');
      throw new Error(`Validación fallida al actualizar: ${errorMsg}`);
    }

    items[targetIndex] = updatedProduct;
    await HomeSectionTopService.saveAll(items);
    return updatedProduct;
  }

  /**
   * Elimina un producto.
   * @param {string} id 
   * @returns {Promise<boolean>}
   */
  async deleteItem(id) {
    const items = await HomeSectionTopService.fetchAll();
    const filteredItems = items.filter(item => item.id !== id);

    if (items.length === filteredItems.length) {
      throw new Error(`Producto con ID ${id} no encontrado para eliminar.`);
    }

    await HomeSectionTopService.saveAll(filteredItems);
    return true;
  }

  /**
   * Alterna la visibilidad (activo/inactivo) de un producto.
   * @param {string} id 
   * @returns {Promise<HomeSectionTopModel>}
   */
  async toggleVisibility(id) {
    const items = await HomeSectionTopService.fetchAll();
    const matchItem = items.find(item => item.id === id);

    if (!matchItem) {
      throw new Error(`Producto con ID ${id} no encontrado.`);
    }

    matchItem.activo = !matchItem.activo;
    await HomeSectionTopService.saveAll(items);
    return matchItem;
  }
}
