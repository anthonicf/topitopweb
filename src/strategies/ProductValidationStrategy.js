/**
 * STRATEGY Pattern - Defines validation behaviors for different product collections.
 * Clean Code: Decouples validation rules from models, conforms to Open-Closed Principle.
 */

export class ProductValidationStrategy {
  /**
   * Valida los datos específicos del producto.
   * @param {BaseProductModel} product 
   * @returns {{ isValid: boolean, errors: Object }}
   */
  validate(product) {
    return { isValid: true, errors: {} };
  }
}

export class HombreValidationStrategy extends ProductValidationStrategy {
  validate(product) {
    const errors = {};
    const validSizes = ['S', 'M', 'L', 'XL', 'XXL'];

    // Validar que no contenga tallas infantiles o extrañas
    const invalidSizes = product.tallas.filter(size => !validSizes.includes(size));
    if (invalidSizes.length > 0) {
      errors.tallas = `Las siguientes tallas no son válidas para Hombre: ${invalidSizes.join(', ')}. Las tallas válidas son: S, M, L, XL, XXL.`;
    }

    if (product.tallas.length === 0) {
      errors.tallas = 'Debe seleccionar al menos una talla de adulto (S, M, L, XL, XXL).';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

export class MujerValidationStrategy extends ProductValidationStrategy {
  validate(product) {
    const errors = {};
    const validSizes = ['XS', 'S', 'M', 'L', 'XL'];

    // Validar tipo de tela obligatorio
    if (!product.tipoTela || !product.tipoTela.trim()) {
      errors.tipoTela = 'El tipo de tela es obligatorio para la colección de mujer.';
    }

    // Validar tallas
    const invalidSizes = product.tallas.filter(size => !validSizes.includes(size));
    if (invalidSizes.length > 0) {
      errors.tallas = `Las siguientes tallas no son válidas para Mujer: ${invalidSizes.join(', ')}. Las tallas válidas son: XS, S, M, L, XL.`;
    }

    if (product.tallas.length === 0) {
      errors.tallas = 'Debe seleccionar al menos una talla de mujer (XS, S, M, L, XL).';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

export class KidsValidationStrategy extends ProductValidationStrategy {
  validate(product) {
    const errors = {};
    const validSizes = ['2', '4', '6', '8', '10', '12', '14'];

    // Validar edad recomendada obligatoria
    if (!product.edadRecomendada || !product.edadRecomendada.trim()) {
      errors.edadRecomendada = 'La edad recomendada es obligatoria para la colección infantil.';
    }

    // Validar tallas
    const invalidSizes = product.tallas.filter(size => !validSizes.includes(size));
    if (invalidSizes.length > 0) {
      errors.tallas = `Las siguientes tallas no son válidas para Niños: ${invalidSizes.join(', ')}. Las tallas válidas son: 2, 4, 6, 8, 10, 12, 14.`;
    }

    if (product.tallas.length === 0) {
      errors.tallas = 'Debe seleccionar al menos una talla infantil (2, 4, 6, 8, 10, 12, 14).';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

/**
 * Factory class/helper to get the correct Strategy based on Collection ID.
 */
export class ValidationStrategyFactory {
  static getStrategy(collectionId) {
    const colIdNormalized = String(collectionId).toLowerCase();

    if (colIdNormalized === 'hombre' || colIdNormalized === 'hombretop') {
      return new HombreValidationStrategy();
    }
    if (colIdNormalized === 'mujer' || colIdNormalized === 'mujertop') {
      return new MujerValidationStrategy();
    }
    if (colIdNormalized === 'kids' || colIdNormalized === 'kidstop') {
      return new KidsValidationStrategy();
    }

    return new ProductValidationStrategy();
  }
}
