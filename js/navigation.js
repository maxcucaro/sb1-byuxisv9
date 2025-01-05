export function updateNavigation() {
  const nav = document.querySelector('.nav-container ul');
  if (!nav) return;

  const menuItems = `
    <li><a href="/index.html">Home</a></li>
    <li><a href="/schede-lavori.html">Schede Lavori</a></li>
    <li><a href="/giacenze.html">Giacenze Inventario</a></li>
    <li><a href="/pages/workspace/schede/liste-aperte.html">Workspace</a></li>
    <li><a href="/impostazioni.html">Impostazioni</a></li>
    <li><a href="/about.html">About</a></li>
  `;

  nav.innerHTML = menuItems;
}

document.addEventListener('DOMContentLoaded', updateNavigation);