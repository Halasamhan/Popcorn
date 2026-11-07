/* ==========================================================
   browse.js — renders category rows on Home / Movies / Series.
   Container: <div id="sections" data-kinds="movie,series,kdrama,cdrama"
                   data-filter data-seeall="true"></div>
   ========================================================== */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('sections');
    if (!root) return;
    const { cardHTML, esc, CATALOG } = window.PP;

    const kinds = (root.dataset.kinds || '').split(',').filter(Boolean);
    const seeAll = root.hasAttribute('data-seeall');
    const items = CATALOG.filter((t) => kinds.includes(t.kind));

    // Preserve catalog order of categories
    const categories = [];
    items.forEach((t) => { if (!categories.includes(t.category)) categories.push(t.category); });

    // Which page lists a category in full
    const pageFor = (cat) => items.find((t) => t.category === cat).kind === 'movie' ? 'movies.html' : 'series.html';

    let active = 'All';

    function renderSections() {
      const cats = active === 'All' ? categories : [active];
      root.innerHTML = cats.map((cat) => {
        const list = items.filter((t) => t.category === cat);
        const more = seeAll ? `<a class="see-all" href="${pageFor(cat)}">See all →</a>` : '';
        return `<section class="section" aria-labelledby="h-${cats.indexOf(cat)}">
          <h2 class="section-title" id="h-${cats.indexOf(cat)}">${esc(cat)}${more}</h2>
          <div class="grid">${list.map(cardHTML).join('')}</div>
        </section>`;
      }).join('') || '<p class="empty-state">Nothing to show yet.</p>';
    }

    // Filter chips (Movies / Series pages)
    if (root.hasAttribute('data-filter')) {
      const bar = document.createElement('div');
      bar.className = 'chips';
      bar.setAttribute('role', 'group');
      bar.setAttribute('aria-label', 'Filter by category');
      const labels = ['All'].concat(categories);
      bar.innerHTML = labels.map((l) =>
        `<button type="button" class="chip" data-cat="${esc(l)}" aria-pressed="${l === 'All'}">${esc(l)}</button>`).join('');
      root.before(bar);
      bar.addEventListener('click', (e) => {
        const b = e.target.closest('.chip');
        if (!b) return;
        active = b.dataset.cat;
        bar.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c === b)));
        renderSections();
      });
    }

    renderSections();
  });
})();
