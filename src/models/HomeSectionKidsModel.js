import { isPositiveNumber, isValidImageUrl } from '../utils/validators.js';

/**
 * MODEL layer - Represents a kid photo item in the "Kids TOP" gallery.
 * Clean Code: Implements SRP, positive integer ordering validation.
 */
export default class HomeSectionKidsModel {
  constructor({ id = null, urlImagen = '', orden = 0, activo = true } = {}) {
    this.id = id;
    this.urlImagen = urlImagen;
    this.orden = Number(orden);
    this.activo = Boolean(activo);
  }

  /**
   * Valida la integridad del modelo.
   * @returns {{ isValid: boolean, errors: Object }}
   */
  validate() {
    const errors = {};

    if (!isValidImageUrl(this.urlImagen)) {
      errors.urlImagen = 'La URL de la imagen no es válida o no corresponde a una extensión de imagen común.';
    }

    if (!isPositiveNumber(this.orden) || !Number.isInteger(this.orden)) {
      errors.orden = 'El orden de visualización debe ser un número entero positivo.';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Serializa el objeto a JSON plano.
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      urlImagen: this.urlImagen,
      orden: this.orden,
      activo: this.activo
    };
  }

  /**
   * Deserializa JSON plano a una instancia.
   * @param {Object} json 
   * @returns {HomeSectionKidsModel}
   */
  static fromJSON(json) {
    return new HomeSectionKidsModel(json);
  }
}
