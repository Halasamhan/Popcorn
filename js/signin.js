/* signin.js — sign in / create account (demo, stored in this browser only) */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const { auth, toast } = window.PP;
    const params = new URLSearchParams(location.search);
    const next = auth.safeNext(params.get('next'));

    if (auth.user()) { location.replace(next); return; }

    const form = document.getElementById('signin-form');
    const user = document.getElementById('u');
    const pass = document.getElementById('p');
    const confirmField = document.getElementById('confirm-field');
    const confirm = document.getElementById('p2');
    const status = document.getElementById('form-status');
    const toggle = document.getElementById('pw-toggle');
    const tabs = document.querySelectorAll('.tab');
    const note = document.getElementById('next-note');
    let mode = params.get('mode') === 'signup' ? 'signup' : 'signin';

    if (params.get('next')) note.hidden = false;

    function setMode(m) {
      mode = m;
      tabs.forEach((t) => {
        const on = t.dataset.mode === m;
        t.setAttribute('aria-selected', String(on));
        t.classList.toggle('on', on);
      });
      const up = m === 'signup';
      document.getElementById('title').textContent = up ? 'Create account' : 'Sign In';
      document.getElementById('lead').textContent = up
        ? 'Join PopCorn Palace to build your own My List.'
        : 'Welcome back. Continue to your PopCorn Palace account.';
      document.getElementById('submit').textContent = up ? 'Create account' : 'Sign In';
      confirmField.hidden = !up;
      pass.autocomplete = up ? 'new-password' : 'current-password';
      status.textContent = '';
      document.querySelectorAll('.field.invalid').forEach((f) => f.classList.remove('invalid'));
    }
    tabs.forEach((t) => t.addEventListener('click', () => setMode(t.dataset.mode)));
    setMode(mode);

    toggle.addEventListener('click', () => {
      const show = pass.type === 'password';
      pass.type = show ? 'text' : 'password';
      toggle.textContent = show ? 'Hide' : 'Show';
      toggle.setAttribute('aria-pressed', String(show));
    });

    const validUser = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || /^\+?[\d\s-]{8,15}$/.test(v);
    function mark(input, ok) {
      input.closest('.field').classList.toggle('invalid', !ok);
      input.setAttribute('aria-invalid', String(!ok));
      return ok;
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const okU = mark(user, validUser(user.value.trim()));
      const okP = mark(pass, pass.value.length >= 6);
      const okC = mode === 'signup' ? mark(confirm, confirm.value === pass.value) : true;
      if (!(okU && okP && okC)) {
        status.textContent = 'Please fix the highlighted fields.';
        (!okU ? user : !okP ? pass : confirm).focus();
        return;
      }
      const btn = document.getElementById('submit');
      btn.disabled = true;
      const res = mode === 'signup'
        ? await auth.signUp(user.value, pass.value)
        : await auth.signIn(user.value, pass.value);
      btn.disabled = false;
      if (!res.ok) { status.textContent = res.error; return; }
      toast(mode === 'signup' ? 'Account created — welcome!' : 'Signed in');
      setTimeout(() => location.replace(next), 400);
    });
  });
})();
