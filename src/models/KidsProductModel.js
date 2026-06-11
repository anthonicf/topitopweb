import BaseProductModel from './BaseProductModel.js';

/**
 * MODEL layer - Represents a product in the Kids collection.
 * Clean Code: Inherits from BaseProductModel, adds 'edadRecomendada' attribute and kid sizing.
 */
export default class KidsProductModel extends BaseProductModel {
  constructor(data = {}) {
    super(data);
    this.edadRecomendada = data.edadRecomendada || '';
    this.tallasValidas = ['2', '4', '6', '8', '10', '12', '14'];
  }

  toJSON() {
    return {
      ...super.toJSON(),
      edadRecomendada: this.edadRecomendada,
      type: 'kids'
    };
  }

  static fromJSON(json) {
    return new KidsProductModel(json);
  }
}
