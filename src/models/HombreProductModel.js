import BaseProductModel from './BaseProductModel.js';

/**
 * MODEL layer - Represents a product in the Hombre collection.
 * Clean Code: Inherits from BaseProductModel, handles adult sizing defaults.
 */
export default class HombreProductModel extends BaseProductModel {
  constructor(data = {}) {
    super(data);
    // Asegurar que las tallas son válidas para Hombre o vacías para configurar
    this.tallasValidas = ['S', 'M', 'L', 'XL', 'XXL'];
  }

  toJSON() {
    return {
      ...super.toJSON(),
      type: 'hombre'
    };
  }

  static fromJSON(json) {
    return new HombreProductModel(json);
  }
}
