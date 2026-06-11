import HombreProductModel from './HombreProductModel.js';
import MujerProductModel from './MujerProductModel.js';
import KidsProductModel from './KidsProductModel.js';

/**
 * FACTORY Pattern - Factory to create the correct Product Model based on Collection ID.
 * Clean Code: Decouples controller logic from subclass instantiation, single point of creation.
 */
export default class ProductFactory {
  /**
   * Crea una instancia del modelo de producto adecuado.
   * @param {string} collectionId 
   * @param {Object} rawData 
   * @returns {BaseProductModel}
   */
  static create(collectionId, rawData) {
    const colIdNormalized = String(collectionId).toLowerCase();

    if (colIdNormalized === 'hombre' || colIdNormalized === 'hombretop') {
      return new HombreProductModel(rawData);
    }
    if (colIdNormalized === 'mujer' || colIdNormalized === 'mujertop') {
      return new MujerProductModel(rawData);
    }
    if (colIdNormalized === 'kids' || colIdNormalized === 'kidstop') {
      return new KidsProductModel(rawData);
    }

    throw new Error(`Identificador de colección no soportado: ${collectionId}`);
  }
}
