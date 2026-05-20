let products = []
let cart = []
let categories = ['All']
let selectedCategory = 'All'
let searchQuery = ''
let currentPage = 1;
const itemsPerPage = 8;

const savedCart = localStorage.getItem('cart')
if (savedCart) cart = JSON.parse(savedCart)

fetch('/static/e_kalathi_products.json')
  .then(res => res.json())
  .then(data => {
    products = data
    const uniqueCategories = [
      ...new Set(products.map(p => p.productCategoryNameEnglish))
    ]
    categories = ['All', ...uniqueCategories]
    init()
  })
  .catch(err => console.error('Failed to load products:', err))

function init () {
  renderCategories()
  renderProducts()
  updateCart()
  loadTowns()
}

function renderCategories () {
  const container = document.getElementById('categories')
  container.innerHTML = categories
    .map(
      c =>
        `<button class="category-btn ${
          c === selectedCategory ? 'active' : ''
        }" onclick="selectCategory('${c}')">${c}</button>`
    )
    .join('')
}

function selectCategory (category) {
  selectedCategory = category
  document.getElementById('product-search').value = ''
  searchQuery = ''
  currentPage = 1; // Reset pagination back to page 1 on category change
  renderCategories()
  renderProducts()
}

function searchProducts (query) {
  searchQuery = query.toLowerCase()
  currentPage = 1; // Reset pagination back to page 1 when user types a search
  renderProducts()
}

function renderProducts() {
    const grid = document.getElementById('products-grid');
    const paginationControls = document.getElementById('pagination-controls');
    const countDisplay = document.getElementById('product-count');

    // 1. CALCULATE FILTERED ARRAY LOCALLY FROM GLOBAL STATES
    const filtered = products.filter(p => {
        const matchesCategory = selectedCategory === 'All' || p.productCategoryNameEnglish === selectedCategory;
        const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery);
        return matchesCategory && matchesSearch;
    });

    // Update the live product counters
    if (countDisplay) {
        countDisplay.textContent = `${filtered.length} products available`;
    }

    // Safety check if no elements match search/filter
    if (!filtered || !filtered.length) {
        grid.innerHTML = '<p style="grid-column:1/-1; text-align:center;">No products found</p>';
        if (paginationControls) paginationControls.innerHTML = ''; 
        return;
    }

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (currentPage > totalPages) {
        currentPage = 1;
    }

    // Slice array to extract only the chunks needed for the current view
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = filtered.slice(startIndex, endIndex);

    // 2. RENDER THE PRODUCT CARDS
    grid.innerHTML = paginatedItems
        .map(
            p => `
            <div class="product-card">
                <img src="${p.productThumbnailUrl}" alt="${p.name}" class="product-image">
                <div class="product-info">
                    <div class="product-category">
                        ${p.productCategoryNameEnglish || 'Uncategorized'}
                    </div>
                    <div class="product-name">${p.name}</div>
                    <div class="product-price">€${p.startPrice}</div>
                    <button class="add-to-cart-btn" onclick="addToCart(${p.productMasterId}, '${p.name.replace(/'/g, "\\'")}')">
                        Add to Basket
                    </button>
                </div>
            </div>
            `
        )
        .join('');

    // 3. RENDER THE PAGINATION BUTTONS
    renderPaginationButtons(totalPages);
}

function renderPaginationButtons(totalPages) {
    const paginationControls = document.getElementById('pagination-controls');
    if (!paginationControls) return;
    
    // Hide controls completely if everything fits on a single page
    if (totalPages <= 1) {
        paginationControls.innerHTML = '';
        return;
    }

    let buttonsHTML = '';

    // 1. "Prev" Button Control
    buttonsHTML += `
        <button class="page-btn ctrl-btn" 
                ${currentPage === 1 ? 'disabled' : ''} 
                onclick="changePage(${currentPage - 1})">
            &larr; Prev
        </button>
    `;

    // Controls how many sibling buttons show around the current page
    const positioningRange = 5; 

    for (let i = 1; i <= totalPages; i++) {
        // Always render the first page, the last page, and any page within our slider range
        if (
            i === 1 || 
            i === totalPages || 
            (i >= currentPage - positioningRange && i <= currentPage + positioningRange)
        ) {
            buttonsHTML += `
                <button class="page-btn ${currentPage === i ? 'active' : ''}" 
                        onclick="changePage(${i})">
                    ${i}
                </button>
            `;
        } 
        // Render ellipses indicators if we are exactly on the boundary edge of a hidden block
        else if (
            i === currentPage - positioningRange - 1 || 
            i === currentPage + positioningRange + 1
        ) {
            buttonsHTML += `<span class="pagination-separator">...</span>`;
        }
    }

    // 3. "Next" Button Control
    buttonsHTML += `
        <button class="page-btn ctrl-btn" 
                ${currentPage === totalPages ? 'disabled' : ''} 
                onclick="changePage(${currentPage + 1})">
            Next &rarr;
        </button>
    `;

    paginationControls.innerHTML = buttonsHTML;
}

// Action Trigger when a page number or directional button gets clicked
function changePage(pageNumber) {
    currentPage = pageNumber;
    renderProducts(); // Automatically pulls updated items from state values
    
    // Smoothly scroll user up to the product area title when changing pages
    const title = document.getElementById('section-title');
    if (title) title.scrollIntoView({ behavior: 'smooth' });
}

function addToCart (id, name) {
  const product = products.find(p => p.productMasterId === id)
  const existing = cart.find(i => i.productMasterId === id)
  if (existing) existing.quantity++
  else cart.push({ ...product, quantity: 1 })
  updateCart('add', name)
}

function updateQuantity (id, change) {
  const item = cart.find(i => i.productMasterId === id)
  if (!item) return
  item.quantity += change
  if (item.quantity <= 0) removeFromCart(id, item.name)
  else updateCart()
}

function removeFromCart (id, name = '') {
  const item = cart.find(i => i.productMasterId === id)
  cart = cart.filter(i => i.productMasterId !== id)
  updateCart('remove', item?.name || name)
}

function updateCart (actionType = null, itemName = '') {
  const count = cart.reduce((sum, i) => sum + i.quantity, 0)
  const total = cart.reduce((sum, i) => sum + i.startPrice * i.quantity, 0)
  document.getElementById('cart-count').textContent = count
  document.getElementById('cart-total').textContent = `€${total.toFixed(2)}`

  localStorage.setItem('cart', JSON.stringify(cart))

  const container = document.getElementById('cart-items')
  if (!cart.length) {
    container.innerHTML =
      '<div class="empty-cart"><p>Your cart is empty</p></div>'
    if (actionType === 'remove' && itemName)
      showToast('warning', `${itemName} removed from cart`)
    return
  }
  if (actionType === 'add' && itemName){
      showToast('success', `${itemName} added to cart`)
    }

  container.innerHTML = cart
    .map(
      item => `
      <div class="cart-item">
          <img src="${item.productThumbnailUrl}" alt="${
        item.name
      }" class="cart-item-image">
          <div class="cart-item-info">
              <div class="cart-item-name">${item.name}</div>
              <div class="cart-item-price">€${item.startPrice.toFixed(2)}</div>
              <div class="cart-item-controls">
                  <button class="qty-btn" onclick="updateQuantity(${
                    item.productMasterId
                  }, -1)">−</button>
                  <span class="qty-display">${item.quantity}</span>
                  <button class="qty-btn" onclick="updateQuantity(${
                    item.productMasterId
                  }, 1)">+</button>
                  <button class="remove-btn" onclick="removeFromCart(${
                    item.productMasterId
                  }, '${item.name}')">Remove</button>
              </div>
          </div>
      </div>
    `
    )
    .join('')
}

function toggleCart () {
  const cartModal = document.getElementById('cart-modal')
  const overlay = document.getElementById('cart-overlay')
  const isActive = cartModal.classList.contains('active')

  if (isActive) {
    cartModal.classList.remove('active')
    overlay.classList.remove('active')
    document.body.classList.remove('modal-open')
  } else {
    cartModal.classList.add('active')
    overlay.classList.add('active')
    document.body.classList.add('modal-open')
  }
}

async function checkout () {
  if (!cart.length) {
    showToast('warning', 'Your cart is empty!')
    return
  }

  const town = document.getElementById('cart-town').value
  if (!town) {
    showToast('warning', 'Please select a town!')
    return
  }

  document.getElementById('loader').style.display = 'flex'

  try {
    const response = await fetch('/checkout/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ town, cart })
    })
    const data = await response.json()

    if (data.error) showToast('error', data.error)
    else showToast('success', 'Checkout data fetched!')

    localStorage.setItem('cart', JSON.stringify(cart))
    localStorage.setItem('town', town)

    window.location.href = '/supermarkets/'
  } catch (err) {
    showToast('error', 'Something went wrong!')
  }
}

async function loadTowns () {
  const select = document.getElementById('cart-town')
  try {
    const response = await fetch('/regions/')
    const regions = await response.json()

    if (!regions?.regions?.length) {
      select.innerHTML = '<option value="">No towns available</option>'
      return
    }

    select.innerHTML = regions.regions
      .map(r => `<option value="${r.id}">${r.name}</option>`)
      .join('')
  } catch (err) {
    console.error('Failed to load towns:', err)
    select.innerHTML = '<option value="">Failed to load towns</option>'
  }
}