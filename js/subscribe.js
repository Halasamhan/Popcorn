/* subscribe.js — plan selection. Needs an account; the plan is saved per account.
   Demo only: no payment is taken. */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const { toast, store, auth } = window.PP;
    const plans = document.querySelectorAll('.plan');
    const nameOf = (p) => p.querySelector('.pname').textContent.trim();
    const planKey = () => 'pp-plan:' + auth.user();

    function paint(current) {
      plans.forEach((p) => {
        const on = !!current && nameOf(p) === current;
        const btn = p.querySelector('button');
        p.classList.toggle('selected', on);
        btn.setAttribute('aria-pressed', String(on));
        btn.textContent = on ? 'Current plan' : (current ? 'Switch to this plan' : 'Subscribe');
      });
    }

    function choose(name) {
      store.set(planKey(), name);
      paint(name);
      toast(`You're on “${name}”. (Demo — no payment is taken.)`);
    }

    paint(auth.user() ? store.get(planKey(), '') : '');

    // Returning from sign-in with a plan chosen earlier
    const wanted = new URLSearchParams(location.search).get('plan');
    if (wanted && auth.user()) {
      history.replaceState(null, '', 'subscribe.html');
      if ([...plans].some((p) => nameOf(p) === wanted)) choose(wanted);
    }

    plans.forEach((p) => {
      p.querySelector('button').addEventListener('click', () => {
        const name = nameOf(p);
        if (!auth.user()) {
          toast('Please sign in or create an account to subscribe.');
          setTimeout(() => auth.requireLogin('subscribe.html?plan=' + encodeURIComponent(name)), 1100);
          return;
        }
        choose(name);
      });
    });
  });
})();
