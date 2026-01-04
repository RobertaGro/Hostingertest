/// <reference types="cypress" />

import './commands.d.ts';
import './commands.ts';

declare namespace Cypress {
  interface Chainable<Subject = any> {
    getPriceByTitle(title: string, priceSelector?: string): Chainable<number>;
    setCartQty(title: string, qty: number): Chainable<void>;
    expectProductTitlesInclude(titles: string | string[], selector?: string): Chainable<void>;
    getIfExists(selector: string): Chainable<JQuery<HTMLElement>>;
    clickIfExists(selector: string): Chainable<void>;
  }
}