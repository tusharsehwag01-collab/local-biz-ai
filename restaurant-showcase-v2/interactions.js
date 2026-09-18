'use strict';
const dialog = document.querySelector('dialog');
if (dialog && typeof dialog.showModal === 'function') {
  let trigger;
  document.querySelectorAll('[data-request]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      trigger = link;
      dialog.querySelector('h2').textContent = `${link.dataset.request} — sample only`;
      dialog.showModal();
      dialog.querySelector('.close').focus();
    });
  });
  dialog.querySelector('.close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const box = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => trigger?.focus());
}
const filters = document.querySelector('.filters');
if (filters) {
  filters.hidden = false;
  filters.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
      filters.querySelectorAll('button').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
      let count = 0;
      document.querySelectorAll('[data-category]').forEach(item => {
        item.hidden = button.dataset.filter !== 'all' && item.dataset.category !== button.dataset.filter;
        if (!item.hidden) count++;
      });
      document.querySelector('.filter-status').textContent = `${count} sample ${count === 1 ? 'item' : 'items'} shown. No prices or dietary claims.`;
    });
  });
}
