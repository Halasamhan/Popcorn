/* mylist.js — shows the signed-in user's saved titles; redirects to sign in otherwise */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const { auth, cardHTML, esc, toast, CATALOG } = window.PP;
    if (!auth.user()) { auth.requireLogin('mylist.html'); return; }

    const root = document.getElementById('list-root');

    function render() {
      const keys = auth.list();
      const items = keys.map((k) => CATALOG.find((t) => t.key === k)).filter(Boolean);
      if (!items.length) {
        root.innerHTML = `<div class="empty-list">
          <h2>Your list is empty</h2>
          <p>Open any movie or series and press “+ My List” to save it here.</p>
          <div class="hero-actions">
            <a class="btn-primary" href="movies.html">Browse Movies</a>
            <a class="btn-ghost" href="series.html">Browse Series</a>
          </div></div>`;
        return;
      }
      root.innerHTML = `<h2 class="section-title">${items.length} saved ${items.length === 1 ? 'title' : 'titles'}</h2>
        <div class="grid">${items.map((t) => `<div class="card-wrap">${cardHTML(t)}
          <button class="remove" type="button" data-key="${esc(t.key)}">Remove</button></div>`).join('')}</div>`;
    }

    root.addEventListener('click', (e) => {
      const b = e.target.closest('.remove');
      if (!b) return;
      auth.setList(auth.list().filter((k) => k !== b.dataset.key));
      toast('Removed from My List');
      render();
    });

    render();
  });
})();
