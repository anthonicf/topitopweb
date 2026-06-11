import CategoryModel from '../models/CategoryModel.js';
import ProductRepository from './ProductRepository.js';

const STORAGE_KEY = 'topitop_categories';

const DEFAULT_CATEGORIES = [
  // Hombre
  { id: 'cat-hombre-1', nombre: 'Camisas de Lino', descripcion: 'Camisas frescas y ligeras de lino premium.', urlImagenPortada: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=300', collectionId: 'hombre', orden: 1, activo: true, slug: 'camisas-de-lino' },
  { id: 'cat-hombre-2', nombre: 'Pantalones', descripcion: 'Pantalones elegantes y casuales.', urlImagenPortada: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=300', collectionId: 'hombre', orden: 2, activo: true, slug: 'pantalones' },
  { id: 'cat-hombre-3', nombre: 'Polos', descripcion: 'Polos cómodos para el día a día.', urlImagenPortada: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=300', collectionId: 'hombre', orden: 3, activo: true, slug: 'polos' },
  { id: 'cat-hombre-4', nombre: 'Sacos', descripcion: 'Sacos y blazers para un estilo distinguido.', urlImagenPortada: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=300', collectionId: 'hombre', orden: 4, activo: true, slug: 'sacos' },
  { id: 'cat-hombre-5', nombre: 'Casacas', descripcion: 'Casacas y abrigos de temporada.', urlImagenPortada: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=300', collectionId: 'hombre', orden: 5, activo: true, slug: 'casacas' },

  // Mujer
  { id: 'cat-mujer-1', nombre: 'Vestidos', descripcion: 'Vestidos elegantes y de verano.', urlImagenPortada: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=300', collectionId: 'mujer', orden: 1, activo: true, slug: 'vestidos' },
  { id: 'cat-mujer-2', nombre: 'Blusas', descripcion: 'Blusas y camisas de moda femenina.', urlImagenPortada: 'https://images.unsplash.com/photo-1548624313-0396c75e4b1a?q=80&w=300', collectionId: 'mujer', orden: 2, activo: true, slug: 'blusas' },
  { id: 'cat-mujer-3', nombre: 'Jeans', descripcion: 'Jeans de diversos cortes y lavados.', urlImagenPortada: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=300', collectionId: 'mujer', orden: 3, activo: true, slug: 'jeans' },
  { id: 'cat-mujer-4', nombre: 'Casacas', descripcion: 'Casacas abrigadoras y ligeras.', urlImagenPortada: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=300', collectionId: 'mujer', orden: 4, activo: true, slug: 'casacas-mujer' },
  { id: 'cat-mujer-5', nombre: 'Accesorios', descripcion: 'Complementos perfectos para tu outfit.', urlImagenPortada: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=300', collectionId: 'mujer', orden: 5, activo: true, slug: 'accesorios' },

  // Kids
  { id: 'cat-kids-1', nombre: 'Polos', descripcion: 'Polos coloridos y cómodos.', urlImagenPortada: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=300', collectionId: 'kids', orden: 1, activo: true, slug: 'polos-kids' },
  { id: 'cat-kids-2', nombre: 'Pantalones', descripcion: 'Pantalones resistentes para jugar.', urlImagenPortada: 'https://images.unsplash.com/photo-1519278470478-c436a59b81eb?q=80&w=300', collectionId: 'kids', orden: 2, activo: true, slug: 'pantalones-kids' },
  { id: 'cat-kids-3', nombre: 'Casacas', descripcion: 'Casacas divertidas y abrigadoras.', urlImagenPortada: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=300', collectionId: 'kids', orden: 3, activo: true, slug: 'casacas-kids' },
  { id: 'cat-kids-4', nombre: 'Pijamas', descripcion: 'Pijamas suaves para un buen descanso.', urlImagenPortada: 'https://images.unsplash.com/photo-1519278470478-c436a59b81eb?q=80&w=300', collectionId: 'kids', orden: 4, activo: true, slug: 'pijamas-kids' },
  { id: 'cat-kids-5', nombre: 'Conjuntos', descripcion: 'Conjuntos listos para toda ocasión.', urlImagenPortada: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=300', collectionId: 'kids', orden: 5, activo: true, slug: 'conjuntos-kids' }
];

/**
 * REPOSITORY Pattern - Manages Category persistence and data access.
 * Clean Code: Handles storage abstraction, validation and relations checking.
 */
export default class CategoryRepository {
  static _loadAll() {
    let data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CATEGORIES));
      data = JSON.stringify(DEFAULT_CATEGORIES);
    }
    const list = JSON.parse(data);
    return list.map(item => CategoryModel.fromJSON(item));
  }

  static _saveAll(categories) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories.map(c => c.toJSON())));
  }

  static async findByCollection(collectionId) {
    const list = this._loadAll();
    return list
      .filter(item => item.collectionId === collectionId)
      .sort((a, b) => a.orden - b.orden);
  }

  static async findById(categoryId) {
    const list = this._loadAll();
    const found = list.find(item => item.id === categoryId);
    return found || null;
  }

  static async findBySlug(slug) {
    if (!slug) return null;
    const list = this._loadAll();
    const normalizedSlug = slug
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const found = list.find(item => item.slug.toLowerCase() === normalizedSlug);
    return found || null;
  }

  static async create(categoryData) {
    const list = this._loadAll();
    const uniqueId = `cat-${Date.now()}`;
    
    // Generar slug automático si no viene provisto
    const slug = categoryData.slug || CategoryModel.prototype.generateSlug(categoryData.nombre);
    
    // Asegurar unicidad de slug
    let finalSlug = slug;
    let counter = 1;
    while (list.some(cat => cat.slug === finalSlug)) {
      finalSlug = `${slug}-${counter++}`;
    }

    const newCategory = new CategoryModel({ ...categoryData, id: uniqueId, slug: finalSlug });
    
    const { isValid, errors } = newCategory.validate();
    if (!isValid) throw new Error(`Validación de categoría fallida: ${Object.values(errors).join(' ')}`);

    list.push(newCategory);
    this._saveAll(list);
    return newCategory;
  }

  static async update(categoryId, data) {
    const list = this._loadAll();
    const index = list.findIndex(item => item.id === categoryId);
    if (index === -1) throw new Error(`Categoría con ID ${categoryId} no encontrada.`);

    // Recalcular slug si cambia el nombre
    let slug = list[index].slug;
    if (data.nombre && data.nombre !== list[index].nombre) {
      slug = CategoryModel.prototype.generateSlug(data.nombre);
      // Asegurar unicidad de slug
      let finalSlug = slug;
      let counter = 1;
      while (list.some((cat, idx) => cat.slug === finalSlug && idx !== index)) {
        finalSlug = `${slug}-${counter++}`;
      }
      slug = finalSlug;
    }

    const updated = new CategoryModel({
      ...list[index].toJSON(),
      ...data,
      slug,
      id: categoryId
    });

    const { isValid, errors } = updated.validate();
    if (!isValid) throw new Error(`Validación de categoría fallida: ${Object.values(errors).join(' ')}`);

    list[index] = updated;
    this._saveAll(list);
    return updated;
  }

  static async delete(categoryId) {
    const list = this._loadAll();
    const index = list.findIndex(item => item.id === categoryId);
    if (index === -1) throw new Error(`Categoría con ID ${categoryId} no encontrada.`);

    // Verificar si la categoría tiene productos
    const products = await ProductRepository.findByCategory(categoryId);
    if (products.length > 0) {
      throw new Error(`HAS_PRODUCTS:${products.length}`);
    }

    list.splice(index, 1);
    this._saveAll(list);
    return true;
  }

  static async toggleVisibility(categoryId) {
    const list = this._loadAll();
    const index = list.findIndex(item => item.id === categoryId);
    if (index === -1) throw new Error(`Categoría con ID ${categoryId} no encontrada.`);

    list[index].activo = !list[index].activo;
    this._saveAll(list);
    return list[index];
  }
}
