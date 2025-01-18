import React from 'react';
import ReactDOM from 'react-dom';
import Login from '../components/profile/login';
import axios from 'axios';
import { jest } from '@jest/globals';

window.axios = {
  post: jest.fn()
};

// Mock za axios, da preprečimo dejanske API klice
window.axios = {
  post: jest.fn()
};

document.body.innerHTML = '<div id="root"></div>'; 

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('Root element not found');
}

function render() {
  ReactDOM.render(<Login />, rootElement);
}

function removeComponent() {
  ReactDOM.unmountComponentAtNode(rootElement);
}

// Test, ali so obrazec in gumbi renderirani
function testRender() {
  render();

  if (!rootElement) {
    throw new Error('Root element not found');
  }
  const emailInput = rootElement.querySelector('input[type="email"]');
  const passwordInput = rootElement.querySelector('input[type="password"]');
  const submitButton = rootElement.querySelector('button[type="submit"]');

  if (!emailInput || !passwordInput || !submitButton) {
    throw new Error('Login form not rendered correctly');
  }
}

// Test za obdelavo oddaje obrazca
function testHandleSubmit() {
  render();

  if (!rootElement) {
    throw new Error('Root element not found');
  }
  const emailInput = rootElement.querySelector('input[type="email"]');
  const passwordInput = rootElement.querySelector('input[type="password"]');
  const submitButton = rootElement.querySelector('button[type="submit"]');

  // Vnesemo podatke v obrazec
  emailInput.value = 'test@example.com';
  passwordInput.value = 'password123';

  // Simuliramo klik na gumb za prijavo
  if (submitButton) {
    submitButton.click();
  } else {
    throw new Error('Submit button not found');
  }

  // Preverimo, če je axios klican
  if (!axios.post.mock.calls.length) {
    throw new Error('API not called on form submission');
  }

  const [url, data] = axios.post.mock.calls[0];
  if (typeof url !== 'string') {
    throw new Error('API called with wrong URL type');
  }
  if (!url.includes('/auth/login')) {
    throw new Error('API called with wrong URL');
  }
  const requestData = data;
  if (requestData.Email !== 'test@example.com' || requestData.Password !== 'password123') {
    throw new Error('API called with wrong data');
  }
}
function testHandleLoginFailure() {
  render();

  if (!rootElement) {
    throw new Error('Root element not found');
  }
  const emailInput = rootElement.querySelector('input[type="email"]');
  const passwordInput = rootElement.querySelector('input[type="password"]');
  const submitButton = rootElement.querySelector('button[type="submit"]');

  emailInput.value = 'wrong@example.com';
  passwordInput.value = 'wrongpassword';

  // Simuliramo neuspešno prijavo (napaka v API klicu)
  window.alert = jest.fn(); // Mockiranje metode alert

  if (submitButton) {
    submitButton.click();
  } else {
    throw new Error('Submit button not found');
  }

  // Preverimo, če je bila prikazana napaka
  if (!window.alert.mock.calls.length) {
    throw new Error('No alert shown for invalid login');
  }

  const alertMessage = window.alert.mock.calls[0][0];
  if (alertMessage !== 'Invalid email or password') {
    throw new Error('Wrong error message displayed');
  }
}

// Zaženemo teste
try {
  testRender();
  testHandleSubmit();
  testHandleLoginFailure();

  console.log('All tests passed');
} catch (error) {
  console.error('Test failed:', error.message);
}
