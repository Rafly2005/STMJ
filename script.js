(() => {
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const searchInput = document.querySelector('#product-search');
  const productCards = [...document.querySelectorAll('.product-card')];
  const status = document.querySelector('#search-status');
  const count = document.querySelector('.cart-count');
  const cartLink = document.querySelector('.cart-link');
  const toast = document.querySelector('#toast');
  const toastTitle = document.querySelector('#toast-title');
  const toastMessage = document.querySelector('#toast-message');
  let toastTimer;
  let resetButton;
  const savedCart = Number.parseInt(localStorage.getItem('stmj-cart-count') || '0', 10);
  let cart = Number.isFinite(savedCart) ? Math.max(0, savedCart) : 0;

  const updateCart = () => {
    cart = Math.max(0, cart);
    count.textContent = cart;
    cartLink.setAttribute('aria-label', `Keranjang, ${cart} item`);
    localStorage.setItem('stmj-cart-count', String(cart));
  };
  updateCart();

  menuToggle?.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    navMenu.classList.toggle('open', open);
  });
  navMenu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    menuToggle?.setAttribute('aria-label', 'Buka menu');
  }));

  const filterProducts = query => {
    const term = query.trim().toLocaleLowerCase('id');
    let shown = 0;
    productCards.forEach(card => {
      const matches = card.textContent.toLocaleLowerCase('id').includes(term);
      card.hidden = !matches;
      if (matches) shown++;
    });
    document.querySelectorAll('.category-card').forEach(item => {
      item.classList.remove('selected');
      item.setAttribute('aria-pressed', 'false');
    });
    resetButton?.remove();
    resetButton = undefined;
    status.textContent = term ? (shown ? `${shown} produk ditemukan.` : 'Produk tidak ditemukan. Coba kata kunci lain.') : '';
  };
  searchInput?.addEventListener('input', event => filterProducts(event.target.value));
  document.querySelector('.search-box')?.addEventListener('submit', event => {
    event.preventDefault();
    document.querySelector('#produk')?.scrollIntoView({ behavior: 'smooth' });
  });

  document.querySelectorAll('.category-card').forEach(category => {
    category.setAttribute('aria-pressed', 'false');
    category.addEventListener('click', event => {
    event.preventDefault();
    const selected = category.dataset.category;
    searchInput.value = '';
    productCards.forEach(card => { card.hidden = card.dataset.product !== selected; });
    document.querySelectorAll('.category-card').forEach(item => {
      const isSelected = item === category;
      item.classList.toggle('selected', isSelected);
      item.setAttribute('aria-pressed', String(isSelected));
    });
    resetButton?.remove();
    status.textContent = `Menampilkan kategori ${category.querySelector('h3').textContent}.`;
    resetButton = document.createElement('button');
    resetButton.type = 'button';
    resetButton.className = 'text-link category-reset';
    resetButton.textContent = 'Tampilkan semua';
    resetButton.addEventListener('click', () => {
      productCards.forEach(card => { card.hidden = false; });
      document.querySelectorAll('.category-card').forEach(item => {
        item.classList.remove('selected');
        item.setAttribute('aria-pressed', 'false');
      });
      status.textContent = '';
      resetButton.remove();
      resetButton = undefined;
    });
    status.append(' ', resetButton);
    document.querySelector('#produk')?.scrollIntoView({ behavior: 'smooth' });
    });
  });

  const showToast = (name) => {
    toastTitle.textContent = 'Berhasil ditambahkan';
    toastMessage.textContent = `${name} masuk ke keranjang.`;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
  };
  document.querySelectorAll('[data-add-to-cart]').forEach(button => button.addEventListener('click', () => {
    cart++;
    updateCart();
    showToast(button.dataset.name || 'Minuman');
  }));
  document.querySelector('#toast-close')?.addEventListener('click', () => {
    clearTimeout(toastTimer);
    toast.classList.remove('show');
  });

  // Sembunyikan gambar yang belum tersedia agar kartu tetap rapi dan mudah dibaca.
  document.querySelectorAll('img').forEach(img => img.addEventListener('error', () => {
    img.hidden = true;
    img.parentElement.classList.add('image-unavailable');
  }, { once: true }));
})();
