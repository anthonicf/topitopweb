import ProductFactory from '../models/ProductFactory.js';
import { ValidationStrategyFactory } from '../strategies/ProductValidationStrategy.js';

const STORAGE_KEY = 'topitop_products';

const DEFAULT_PRODUCTS = [
  // Hombres - Camisas de Lino (cat-hombre-1)
  {
    id: 'prod-hombre-1',
    nombre: 'Classic Blanco',
    descripcion: 'Camisa de lino clásica y transpirable. Ideal para ocasiones casuales y formales bajo el sol.',
    precio: 99.90,
    precioOriginal: 124.90,
    descuento: 20,
    urlImagen: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=500',
    galeriaImagenes: [],
    colores: ['Blanco'],
    tallas: ['S', 'M', 'L'],
    activo: true,
    destacado: true,
    categoryId: 'cat-hombre-1',
    collectionId: 'hombre',
    creadoEn: '2026-06-01T00:00:00.000Z',
    actualizadoEn: '2026-06-01T00:00:00.000Z'
  },
  {
    id: 'prod-hombre-2',
    nombre: 'Celeste Summer',
    descripcion: 'Camisa ligera de lino en tono celeste pastel. De calce relajado y fresco.',
    precio: 109.90,
    precioOriginal: 109.90,
    descuento: 0,
    urlImagen: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=500',
    galeriaImagenes: [],
    colores: ['Azul'],
    tallas: ['M', 'L', 'XL'],
    activo: true,
    destacado: false,
    categoryId: 'cat-hombre-1',
    collectionId: 'hombre',
    creadoEn: '2026-06-02T00:00:00.000Z',
    actualizadoEn: '2026-06-02T00:00:00.000Z'
  },
  {
    id: 'prod-hombre-3',
    nombre: 'Earth Beige',
    descripcion: 'Tono rústico natural de lino puro. Mangas regulables con botón para estilo arremangado.',
    precio: 109.90,
    precioOriginal: 109.90,
    descuento: 0,
    urlImagen: 'https://images.unsplash.com/photo-1620012253295-c05518e99309?q=80&w=500',
    galeriaImagenes: [],
    colores: ['Beige'],
    tallas: ['S', 'M', 'L'],
    activo: true,
    destacado: false,
    categoryId: 'cat-hombre-1',
    collectionId: 'hombre',
    creadoEn: '2026-06-03T00:00:00.000Z',
    actualizadoEn: '2026-06-03T00:00:00.000Z'
  },
  {
    id: 'prod-hombre-4',
    nombre: 'Sage Green',
    descripcion: 'Color verde salvia moderno de lino y algodón. Cuello mao y detalles premium.',
    precio: 119.90,
    precioOriginal: 119.90,
    descuento: 0,
    urlImagen: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=500',
    galeriaImagenes: [],
    colores: ['Gris'],
    tallas: ['S', 'M', 'L', 'XL'],
    activo: true,
    destacado: true,
    categoryId: 'cat-hombre-1',
    collectionId: 'hombre',
    creadoEn: '2026-06-04T00:00:00.000Z',
    actualizadoEn: '2026-06-04T00:00:00.000Z'
  },

  // Mujer - Vestidos (cat-mujer-1)
  {
    id: 'prod-mujer-1',
    nombre: 'Vestido Rojo Gala',
    descripcion: 'Vestido largo de fiesta en tela de seda satinada de caída espectacular.',
    precio: 149.90,
    precioOriginal: 199.90,
    descuento: 25,
    urlImagen: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=500',
    galeriaImagenes: [],
    colores: ['Rojo'],
    tallas: ['S', 'M'],
    activo: true,
    destacado: true,
    categoryId: 'cat-mujer-1',
    collectionId: 'mujer',
    tipoTela: 'Seda Satinada',
    creadoEn: '2026-06-05T00:00:00.000Z',
    actualizadoEn: '2026-06-05T00:00:00.000Z'
  },

  // Kids - Polos (cat-kids-1)
  {
    id: 'prod-kids-1',
    nombre: 'Polo Dino Kids',
    descripcion: 'Divertido polo de dinosaurios 100% algodón suave y antialérgico.',
    precio: 29.90,
    precioOriginal: 39.90,
    descuento: 25,
    urlImagen: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=500',
    galeriaImagenes: [],
    colores: ['Azul', 'Rojo'],
    tallas: ['4', '6', '8'],
    activo: true,
    destacado: true,
    categoryId: 'cat-kids-1',
    collectionId: 'kids',
    edadRecomendada: '4-8 años',
    creadoEn: '2026-06-06T00:00:00.000Z',
    actualizadoEn: '2026-06-06T00:00:00.000Z'
  }
];

/**
 * REPOSITORY Pattern - Manages Product persistence, data access and filtering.
 * Clean Code: Separates filtering logic, invokes factory and applies strategy pattern validations.
 */
export default class ProductRepository {
  static _loadAll() {
    let data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTS));
      data = JSON.stringify(DEFAULT_PRODUCTS);
    }
    const list = JSON.parse(data);
    return list.map(item => ProductFactory.create(item.collectionId, item));
  }

  static _saveAll(products) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products.map(p => p.toJSON())));
  }

  static async findByCategory(categoryId) {
    const list = this._loadAll();
    return list.filter(item => item.categoryId === categoryId);
  }

  static async findById(productId) {
    const list = this._loadAll();
    const found = list.find(item => item.id === productId);
    return found || null;
  }

  static async findDestacados() {
    const list = this._loadAll();
    return list.filter(item => item.activo && item.destacado);
  }

  static async create(productData) {
    const list = this._loadAll();
    const uniqueId = `prod-${Date.now()}`;
    
    // Instanciar usando la Factory según la colección
    const newProduct = ProductFactory.create(productData.collectionId, {
      ...productData,
      id: uniqueId,
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString()
    });

    // Validar usando la estrategia correspondiente de la colección
    const strategy = ValidationStrategyFactory.getStrategy(productData.collectionId);
    const { isValid, errors } = newProduct.validate(strategy);
    if (!isValid) throw new Error(`Validación de producto fallida: ${Object.values(errors).join(' ')}`);

    list.push(newProduct);
    this._saveAll(list);
    return newProduct;
  }

  static async update(productId, data) {
    const list = this._loadAll();
    const index = list.findIndex(item => item.id === productId);
    if (index === -1) throw new Error(`Producto con ID ${productId} no encontrado.`);

    const currentData = list[index].toJSON();
    const updatedData = {
      ...currentData,
      ...data,
      id: productId,
      actualizadoEn: new Date().toISOString()
    };

    const updated = ProductFactory.create(updatedData.collectionId, updatedData);
    const strategy = ValidationStrategyFactory.getStrategy(updatedData.collectionId);
    
    const { isValid, errors } = updated.validate(strategy);
    if (!isValid) throw new Error(`Validación al actualizar producto fallida: ${Object.values(errors).join(' ')}`);

    list[index] = updated;
    this._saveAll(list);
    return updated;
  }

  static async delete(productId) {
    const list = this._loadAll();
    const index = list.findIndex(item => item.id === productId);
    if (index === -1) throw new Error(`Producto con ID ${productId} no encontrado para eliminar.`);

    list.splice(index, 1);
    this._saveAll(list);
    return true;
  }

  /**
   * Filtra productos por categoría y filtros de búsqueda (tallas, colores, precio).
   */
  static async findWithFilters(categoryId, filters = {}) {
    let list = await this.findByCategory(categoryId);

    // Filtrar solo activos para la vista pública por defecto
    if (filters.soloActivos !== false) {
      list = list.filter(item => item.activo);
    }

    // Filtro por color
    if (filters.colores && filters.colores.length > 0) {
      list = list.filter(item => 
        item.colores.some(color => filters.colores.includes(color))
      );
    }

    // Filtro por talla
    if (filters.tallas && filters.tallas.length > 0) {
      list = list.filter(item => 
        item.tallas.some(talla => filters.tallas.includes(talla))
      );
    }

    // Filtro por rango de precio
    if (filters.precioMin !== undefined && filters.precioMin !== null) {
      list = list.filter(item => item.precio >= filters.precioMin);
    }
    if (filters.precioMax !== undefined && filters.precioMax !== null) {
      list = list.filter(item => item.precio <= filters.precioMax);
    }

    // Ordenamiento
    if (filters.ordenarPor) {
      if (filters.ordenarPor === 'precio-asc') {
        list.sort((a, b) => a.precio - b.precio);
      } else if (filters.ordenarPor === 'precio-desc') {
        list.sort((a, b) => b.precio - a.precio);
      }
    }

    return list;
  }
}
