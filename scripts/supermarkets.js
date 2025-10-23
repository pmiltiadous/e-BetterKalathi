let supermarketsData = null
let sortAscending = true

async function fetchSupermarkets () {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]')
  const town = localStorage.getItem('town') || ''
  const list = document.querySelector('#supermarket-list tbody')

  if (!cart.length || !town) {
    list.innerHTML = "<tr><td colspan='3'>No cart or town data found.</td></tr>"
    return
  }

  try {
    const response = await fetch('/checkout/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ town, cart })
    })

    supermarketsData = await response.json()
    renderSupermarkets()
  } catch (err) {
    console.error(err)
    list.innerHTML =
      "<tr><td colspan='3'>Failed to fetch supermarket prices.</td></tr>"
  }
}

function renderSupermarkets () {
  const list = document.querySelector('#supermarket-list tbody')
  if (!supermarketsData?.supermarkets?.length) {
    list.innerHTML = "<tr><td colspan='3'>No supermarkets found.</td></tr>"
    return
  }

  let supermarkets = [...supermarketsData.supermarkets]
  supermarkets.sort((a, b) =>
    sortAscending ? a.total - b.total : b.total - a.total
  )

  list.innerHTML = supermarkets
    .map(
      (s, idx) => `
      <tr>
          <td class="supermarket-name-cell">
              ${
                s.companyPhotoFile
                  ? `<img src="data:image/jpeg;base64,${s.companyPhotoFile}" alt="${s.name}">`
                  : ''
              }
              <div>
                  <strong>${s.name}</strong><br>
                  ${s.postalAddress || ''}<br>
                  ${s.landPhone || ''}
                  ${
                    s.missing_count > 0
                      ? `<div style="color:red; font-size:0.85rem;">Missing ${s.missing_count} item(s)</div>`
                      : ''
                  }
              </div>
          </td>
          <td>€${s.total.toFixed(2)}</td>
          <td>
              <button class="view-items-btn" data-idx="${idx}">View Items</button>
          </td>
      </tr>
      <tr id="breakdown-${idx}" class="item-breakdown-row" style="display:none;">
        <td colspan="3">
          <div class="item-breakdown-table">
              <div class="item-breakdown-header">
                  <span class="col name">Item</span>
                  <span class="col qty">Qty</span>
                  <span class="col total">Total</span>
              </div>
              ${s.products
                .map(
                  p => `
                  <div class="item-breakdown-row">
                      <span class="col name">${p.name}</span>
                      <span class="col qty">${p.quantity}</span>
                      <span class="col total">€${(p.price * p.quantity).toFixed(
                        2
                      )}</span>
                  </div>
              `
                )
                .join('')}
          </div>
        </td>
      </tr>
    `
    )
    .join('')

  const sortIndicator = document.querySelector('.sort-indicator')
  if (sortIndicator) sortIndicator.textContent = sortAscending ? '↑' : '↓'

  document.querySelectorAll('.view-items-btn').forEach(btn => {
    btn.onclick = () => {
      const idx = btn.dataset.idx
      const row = document.getElementById(`breakdown-${idx}`)
      if (row)
        row.style.display = row.style.display === 'none' ? 'table-row' : 'none'
    }
  })
}

document.addEventListener('DOMContentLoaded', () => {
  const priceHeader = document.getElementById('price-header')
  if (priceHeader) {
    priceHeader.addEventListener('click', () => {
      sortAscending = !sortAscending
      renderSupermarkets()
    })
  }

  fetchSupermarkets()
})
