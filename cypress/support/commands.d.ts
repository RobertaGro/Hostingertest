/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
      getPriceByTitle(title: string, priceSelector?: string): Chainable<number>;
      addProductToCart(productTitle: string, qty: number): Chainable<void>;
      setCartQty(productTitle: string, qty: number): Chainable<void>;
      expectProductTitlesInclude(titles: string | string[], selector?: string): Chainable<void>;
      verifyProductPrice(productTitle: string, expectedPrice: number): Chainable<void>;
      getIfExists(selector: string): Chainable<JQuery<HTMLElement>>;
      clickIfExists(selector: string): Chainable<void>;
      clickButtonByText(buttonText: string, selectors?: string[]): Chainable<void>;
      fillContactForm(contactInfo: { email: string; fullName: string; phone: string; specialRequests: string }): Chainable<void>;
      applyDiscountCode(code: string): Chainable<void>;
      verifyDiscountApplied(expectedText: string): Chainable<void>;
      selectShippingOption(shippingOptionSelector: string, dropdownInputSelector: string): Chainable<void>;
      verifyErrorMessages(errorMessages: string[]): Chainable<void>;
      verifySuccessMessages(successMessages: string[]): Chainable<void>;
      deleteProductFromCart(productTitle: string): Chainable<void>;
      verifyTotalPrice(subtotalBeforeDiscount: number, shippingPrice: number, discountPercentage: number): Chainable<void>;
      getPriceFromElement(selector: string): Chainable<number>;
    }
  }
}

export {};