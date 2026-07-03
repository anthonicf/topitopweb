import BaseProductModel from './BaseProductModel.js';

/**
 * MODEL layer - Represents a product in the Mujer collection.
 * Clean Code: Inherits from BaseProductModel, adds 'tipoTela' attribute.
 */
export default class MujerProductModel extends BaseProductModel {
  constructor(data = {}) {
    super(data);
    this.tipoTela = data.tipoTela || '';
    this.tallasValidas = ['XS', 'S', 'M', 'L', 'XL'];
  }

  toJSON() {
    return {
      ...super.toJSON(),
      tipoTela: this.tipoTela,
      type: 'mujer'
    };
  }

  static fromJSON(json) {
    return new MujerProductModel(json);
  }
}
