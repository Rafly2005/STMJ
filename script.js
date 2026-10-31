(() => {
  'use strict';

  const elements = {
    menuToggle: document.querySelector('.menu-toggle'),
    navMenu: document.querySelector('.nav-menu'),
    searchInput: document.querySelector('#product-search'),
    searchForm: document.querySelector('.search-box'),
    searchStatus: document.querySelector('#search-status'),
    productSection: document.querySelector('#produk'),
    productCards: [...document.querySelectorAll('.product-card')],
    categories: [...document.querySelectorAll('.category-card')],
    cartCount: document.querySelector('.cart-count'),
    cartLink: document.querySelector('.cart-link'),
    toast: document.querySelector('#toast'),
    toastTitle: document.querySelector('#toast-title'),
    toastMessage: document.querySelector('#toast-message'),
    toastClose: document.querySelector('#toast-close'),
  };

  const CART_STORAGE_KEY = 'stmj-cart-count';
  let toastTimer;
  let resetCategoryButton;

  function readCartCount() {
    try {
      const storedCount = Number.parseInt(localStorage.getItem(CART_STORAGE_KEY) || '0', 10);
      return Number.isFinite(storedCount) ? Math.max(0, storedCount) : 0;
    } catch {
      return 0;
    }
  }

  let cartCount = readCartCount();

  function saveCartCount() {
    try {
      localStorage.setItem(CART_STORAGE_KEY, String(cartCount));
    } catch {
      // Keranjang tetap bisa dipakai selama halaman terbuka meski storage diblokir.
    }
  }

  function renderCartCount() {
    if (elements.cartCount) elements.cartCount.textContent = cartCount;
    elements.cartLink?.setAttribute('aria-label', `Keranjang, ${cartCount} item`);
    saveCartCount();
  }

  function setMenuOpen(isOpen) {
    elements.menuToggle?.setAttribute('aria-expanded', String(isOpen));
    elements.menuToggle?.setAttribute('aria-label', isOpen ? 'Tutup menu' : 'Buka menu');
    elements.navMenu?.classList.toggle('open', isOpen);
  }

  function clearCategorySelection() {
    elements.categories.forEach(category => {
      category.classList.remove('selected');
      category.setAttribute('aria-pressed', 'false');
    });
    resetCategoryButton?.remove();
    resetCategoryButton = undefined;
  }

  function showAllProducts() {
    elements.productCards.forEach(card => { card.hidden = false; });
    clearCategorySelection();
    if (elements.searchStatus) elements.searchStatus.textContent = '';
  }

  function filterProducts(query) {
    const term = query.trim().toLocaleLowerCase('id');
    let visibleCount = 0;

    clearCategorySelection();
    elements.productCards.forEach(card => {
      const matches = card.textContent.toLocaleLowerCase('id').includes(term);
      card.hidden = !matches;
      if (matches) visibleCount++;
    });

    if (!elements.searchStatus) return;
    if (!term) {
      elements.searchStatus.textContent = '';
    } else if (visibleCount) {
      elements.searchStatus.textContent = `${visibleCount} produk ditemukan.`;
    } else {
      elements.searchStatus.textContent = 'Produk tidak ditemukan. Coba kata kunci lain.';
    }
  }

  function showCategory(category) {
    const selectedCategory = category.dataset.category;
    const categoryName = category.querySelector('h3')?.textContent || 'produk';

    if (elements.searchInput) elements.searchInput.value = '';
    elements.productCards.forEach(card => {
      card.hidden = card.dataset.product !== selectedCategory;
    });
    clearCategorySelection();
    category.classList.add('selected');
    category.setAttribute('aria-pressed', 'true');

    if (elements.searchStatus) {
      elements.searchStatus.textContent = `Menampilkan kategori ${categoryName}.`;
      resetCategoryButton = document.createElement('button');
      resetCategoryButton.type = 'button';
      resetCategoryButton.className = 'text-link category-reset';
      resetCategoryButton.textContent = 'Tampilkan semua';
      resetCategoryButton.addEventListener('click', showAllProducts, { once: true });
      elements.searchStatus.append(' ', resetCategoryButton);
    }

    elements.productSection?.scrollIntoView({ behavior: 'smooth' });
  }

  function showToast(productName) {
    if (!elements.toast) return;
    if (elements.toastTitle) elements.toastTitle.textContent = 'Berhasil ditambahkan';
    if (elements.toastMessage) elements.toastMessage.textContent = `${productName} masuk ke keranjang.`;

    elements.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => elements.toast.classList.remove('show'), 3200);
  }

  function hideToast() {
    clearTimeout(toastTimer);
    elements.toast?.classList.remove('show');
  }

  function hideUnavailableImage(image) {
    image.hidden = true;
    image.parentElement?.classList.add('image-unavailable');
  }

  function initializeMenu() {
    elements.menuToggle?.addEventListener('click', () => {
      const isOpen = elements.menuToggle.getAttribute('aria-expanded') !== 'true';
      setMenuOpen(isOpen);
    });

    elements.navMenu?.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => setMenuOpen(false));
    });
  }

  function initializeSearch() {
    elements.searchInput?.addEventListener('input', event => filterProducts(event.target.value));
    elements.searchForm?.addEventListener('submit', event => {
      event.preventDefault();
      elements.productSection?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  function initializeCategories() {
    elements.categories.forEach(category => {
      category.setAttribute('aria-pressed', 'false');
      category.addEventListener('click', event => {
        event.preventDefault();
        showCategory(category);
      });
    });
  }

  function initializeCart() {
    renderCartCount();
    document.querySelectorAll('[data-add-to-cart]').forEach(button => {
      button.addEventListener('click', () => {
        cartCount++;
        renderCartCount();
        showToast(button.dataset.name || 'Minuman');
      });
    });
    elements.toastClose?.addEventListener('click', hideToast);
  }

  function initializeImageFallbacks() {
    document.querySelectorAll('img').forEach(image => {
      image.addEventListener('error', () => hideUnavailableImage(image), { once: true });
    });
  }

  initializeMenu();
  initializeSearch();
  initializeCategories();
  initializeCart();
  initializeImageFallbacks();
})();
