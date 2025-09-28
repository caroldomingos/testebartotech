// inicio.js — funcionalidades: dropdown clicável, pesquisa real, carrinho simples e favoritos (localStorage)

// show console test
console.log("inicio.js carregado");

// ----------------------
// DROPDOWN GÊNERO (abre ao clicar)
// ----------------------
const genreToggle = document.getElementById('genreToggle');
const genreMenu = document.getElementById('genreMenu');

if (genreToggle && genreMenu) {
  genreToggle.addEventListener('click', (e) => {
    e.preventDefault();
    const isShown = genreMenu.style.display === 'block';
    if (isShown) {
      genreMenu.style.display = 'none';
      genreToggle.setAttribute('aria-expanded', 'false');
      genreMenu.setAttribute('aria-hidden', 'true');
    } else {
      genreMenu.style.display = 'block';
      genreToggle.setAttribute('aria-expanded', 'true');
      genreMenu.setAttribute('aria-hidden', 'false');
    }
  });

  // fechamento ao clicar fora
  document.addEventListener('click', (e) => {
    if (!genreMenu.contains(e.target) && !genreToggle.contains(e.target)) {
      genreMenu.style.display = 'none';
      genreToggle.setAttribute('aria-expanded', 'false');
      genreMenu.setAttribute('aria-hidden', 'true');
    }
  });
}

// ----------------------
// Pesquisa (filtra cards por título e mostra menu de gêneros ao pesquisar)
// ----------------------
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');
const productGrid = document.getElementById('productGrid');
const scopeSelect = document.getElementById('search-scope');

function normalize(s){ return String(s||'').toLowerCase().trim(); }

if (searchBtn && searchInput && productGrid) {
  searchBtn.addEventListener('click', () => {
    const term = normalize(searchInput.value);
    const scope = scopeSelect.value; // all | vinil | cd | dvd

    const cards = Array.from(productGrid.querySelectorAll('.product-card'));
    let foundAny = false;

    cards.forEach(card => {
      const title = normalize(card.dataset.title);
      const type = card.dataset.type; // vinil | cd | dvd
      const matchScope = (scope === 'all') || (scope === type);
      const matchText = term === '' || title.includes(term);
      if (matchScope && matchText) {
        card.style.display = '';
        foundAny = true;
      } else {
        card.style.display = 'none';
      }
    });

    // se pesquisou algo, mostre o menu de gêneros (como você pediu)
    if (term.length > 0) {
      genreMenu.style.display = 'block';
      genreToggle.setAttribute('aria-expanded', 'true');
      genreMenu.setAttribute('aria-hidden', 'false');
    } else {
      // se não digitou nada, escondemos o menu (comportamento desejado)
      genreMenu.style.display = 'none';
      genreToggle.setAttribute('aria-expanded', 'false');
      genreMenu.setAttribute('aria-hidden', 'true');
    }

    if (!foundAny) {
      // se nenhum resultado, mostra mensagem (temporária dentro grid)
      if (!document.getElementById('noResultsMsg')) {
        const n = document.createElement('div');
        n.id = 'noResultsMsg';
        n.style.gridColumn = '1/-1';
        n.style.padding = '30px';
        n.style.textAlign = 'center';
        n.style.color = '#737a6c';
        n.innerText = 'Nenhum produto encontrado para sua pesquisa.';
        productGrid.appendChild(n);
      }
    } else {
      const existent = document.getElementById('noResultsMsg');
      if (existent) existent.remove();
    }
  });

  // também permitir pesquisar com Enter
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      searchBtn.click();
    }
  });
}

// ----------------------
// Carrinho e Favoritos (localStorage simples)
// ----------------------
const STORAGE_CART_KEY = 'rw_cart_v1';
const STORAGE_FAV_KEY = 'rw_favs_v1';

function readCart(){ return JSON.parse(localStorage.getItem(STORAGE_CART_KEY) || '[]'); }
function writeCart(c){ localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(c)); updateCartCount(); }

function readFavs(){ return JSON.parse(localStorage.getItem(STORAGE_FAV_KEY) || '[]'); }
function writeFavs(f){ localStorage.setItem(STORAGE_FAV_KEY, JSON.stringify(f)); }

function updateCartCount(){
  const c = readCart();
  const el = document.getElementById('cartCount');
  if (el) el.textContent = c.length;
}

// conectar botões "Adicionar ao carrinho" e favs dinâmicos
document.addEventListener('click', (e) => {
  const target = e.target;

  // adicionar ao carrinho
  if (target.matches('.btn-add') || target.closest('.btn-add')) {
    const btn = target.closest('.btn-add') || target;
    const card = btn.closest('.product-card');
    if (!card) return;
    const title = card.dataset.title || card.querySelector('h3')?.innerText || 'Produto';
    const priceText = card.querySelector('.price')?.innerText?.replace(/[^\d\,\.]/g,'') || '';
    const price = parseFloat(priceText.replace(',','.')) || 0;
    const cart = readCart();
    cart.push({ title, price, id: Date.now() });
    writeCart(cart);
    updateCartCount();
    // feedback
    btn.textContent = 'Adicionado ✓';
    btn.disabled = true;
    setTimeout(()=>{ btn.textContent = 'Adicionar ao carrinho'; btn.disabled = false; }, 1200);
  }

  // favoritar
  if (target.matches('.btn-fav') || target.closest('.btn-fav')) {
    const btn = target.closest('.btn-fav') || target;
    const card = btn.closest('.product-card');
    if (!card) return;
    const title = card.dataset.title || card.querySelector('h3')?.innerText || 'Produto';
    const favs = readFavs();
    if (!favs.includes(title)) {
      favs.push(title);
      writeFavs(favs);
      btn.style.color = 'crimson';
      setTimeout(()=> btn.style.color = '', 900);
      // opcional: mostrar toast
      showToast(`${title} adicionado aos favoritos`);
    } else {
      showToast(`${title} já está nos favoritos`);
    }
  }
});

// update cart count ao carregar página
document.addEventListener('DOMContentLoaded', updateCartCount);

// ----------------------
// util: toast
// ----------------------
function showToast(msg){
  const t = document.createElement('div');
  t.className = 'rw-toast';
  t.textContent = msg;
  t.style.cssText = 'position:fixed;right:18px;bottom:18px;background:var(--verde-1);color:#072018;padding:10px 14px;border-radius:8px;z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,0.2)';
  document.body.appendChild(t);
  setTimeout(()=> t.style.opacity = '0', 2200);
  setTimeout(()=> t.remove(), 2600);
}
