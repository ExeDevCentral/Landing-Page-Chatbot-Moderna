"use strict";

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('register-form');
  const errorMessage = document.getElementById('error-message');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = form.name.value;
    const email = form.email.value;
    const password = form.password.value;

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || 'Something went wrong');
      }

      localStorage.setItem('token', data.token);
      window.location.href = '/';
    } catch (err) {
      errorMessage.textContent = err.message;
    }
  });
});
