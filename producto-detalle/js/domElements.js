/**
 * CENTRALIZED DOM ELEMENTS MAP
 * Clean Code Principle: Single Source of Truth & DRY (Don't Repeat Yourself).
 * Avoids spread query selectors across multiple modules. All elements are queried once
 * and exported for ease of maintenance and consistency.
 */

export const ELEMENTS = {
  // Main view containers
  detailContainer: document.getElementById('productDetailsContainer'),
  errorContainer: document.getElementById('errorStateContainer'),
  errorMessage: document.getElementById('errorStateMessage'),

  // Gallery
  mainImage: document.getElementById('mainProductImage'),
  thumbnailsContainer: document.getElementById('thumbnailsContainer'),

  // Product info panel
  collection: document.getElementById('productCollection'),
  name: document.getElementById('productName'),
  code: document.getElementById('productCode'),
  
  // Prices
  priceActual: document.getElementById('priceActual'),
  priceOriginal: document.getElementById('priceOriginal'),
  discountBadge: document.getElementById('discountBadge'),

  // Size Selector
  sizeContainer: document.getElementById('sizeContainer'),
  sizeErrorMessage: document.getElementById('sizeErrorMessage'),
  sizeGuideLink: document.getElementById('sizeGuideLink'),

  // Quantity Selector
  quantityInput: document.getElementById('quantityInput'),
  quantityDecreaseBtn: document.getElementById('quantityDecreaseBtn'),
  quantityIncreaseBtn: document.getElementById('quantityIncreaseBtn'),

  // Actions
  addToCartBtn: document.getElementById('addToCartBtn'),
  favHeartBtn: document.getElementById('favHeartBtn'),

  // Share
  shareFacebook: document.getElementById('shareFacebook'),
  shareWhatsapp: document.getElementById('shareWhatsapp'),
  shareCopyLink: document.getElementById('shareCopyLink'),
  
  // Accordions (selected globally on main)
  accordions: document.querySelectorAll('.accordion-item')
};
