/* subscribe.js — plan selection (demo: no payment backend) */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const { toast, store } = window.PP;
    const plans = document.querySelectorAll('.plan');
    const KEY = 'pp-plan';

    function select(name) {
      plans.forEach((p) => {
        const on = p.querySelector('.pname').textContent.trim() === name;
        p.classList.toggle('selected', on);
        p.querySelector('button').setAttribute('aria-pressed', String(on));
      });
    }
    select(store.get(KEY, ''));

    plans.forEach((p) => {
      p.querySelector('button').addEventListener('click', () => {
        const name = p.querySelector('.pname').textContent.trim();
        store.set(KEY, name);
        select(name);
        toast(`“${name}” selected. Sign in to complete your subscription.`);
      });
    });
  });
})();
