/// <reference types="cypress" />

import './commands';

Cypress.on('uncaught:exception', (err: { message: string | string[]; }) => {
  console.log('Caught error:', err.message);

  if (
    err.message?.includes(
      "Cannot read properties of null (reading 'includes')"
    )
  ) {
    console.log('Ignoring includes error');
    return false;
  }

  return true;
});