/// <reference types="cypress" />
import '../../../support/commands';
import './commands';
import { MuffinShop } from './MuffinShop.cy';

describe('Muffin shop E2E', () => {
  it('Full shopping workflow', () => {
    // Visit Muffin shop
    cy.visit(MuffinShop.urls.base);
    cy.title().should('include', MuffinShop.messages.pageTitle);

    // Navigate to Shop
    cy.contains(MuffinShop.selectors.navShopLink, MuffinShop.messages.buttons.shop).should('be.visible').click();

    // Wait for products to load on shop page
    cy.contains(MuffinShop.products.blueberry, { timeout: MuffinShop.timeouts.default }).should('be.visible');

    // Products to add
    const productsToAdd = [
      { title: MuffinShop.products.blueberry, qty: 2 },
      { title: MuffinShop.products.chococar, qty: 1 },
      { title: MuffinShop.products.glazed, qty: 1 },
      { title: MuffinShop.products.cookiesCream, qty: 2 }
    ];

    // Add each product to cart
    productsToAdd.forEach(product => {
      cy.addProductToCart(product.title, product.qty);
    });

    // Open cart and update quantity
    cy.get(MuffinShop.selectors.shoppingCartOpenBtn).first().click();
    cy.get('[data-qa="shoppingcart-text-qty"], .quantity-picker__amount', { timeout: MuffinShop.timeouts.default }).should('exist');
    cy.setCartQty(MuffinShop.products.blueberry, 1);

    // Delete Choco-Caramel if present
    cy.deleteProductFromCart(MuffinShop.products.chococar);

    // Proceed to checkout
    cy.get(MuffinShop.selectors.cartCheckoutBtn).click();

    // Verify product titles on checkout
    cy.expectProductTitlesInclude([
      MuffinShop.products.blueberry,
      MuffinShop.products.glazed,
      MuffinShop.products.cookiesCream,
    ]);

    // Verify prices on checkout - use stored prices from product pages
    cy.get(`@${MuffinShop.products.blueberry}Price`).then((blueberryPrice) => {
      cy.verifyProductPrice(MuffinShop.products.blueberry, Number(blueberryPrice));
    });
    
    cy.get(`@${MuffinShop.products.glazed}Price`).then((glazedPrice) => {
      cy.verifyProductPrice(MuffinShop.products.glazed, Number(glazedPrice));
    });
    
    cy.get(`@${MuffinShop.products.cookiesCream}Price`).then((cookiesCreamPrice) => {
      cy.verifyProductPrice(MuffinShop.products.cookiesCream, Number(cookiesCreamPrice) * 2);
    });

    // Get subtotal before discount
    cy.getPriceFromElement(MuffinShop.selectors.checkoutSubtotalPrice).then((subtotalBeforeDiscount) => {
      cy.log(`Subtotal before discount: €${subtotalBeforeDiscount}`);
      
      // Apply discount code
      cy.applyDiscountCode(MuffinShop.testData.discount.code);
      
      // Verify discount is applied
      cy.verifyDiscountApplied(MuffinShop.testData.discount.expectedText);
      
      cy.wait(MuffinShop.timeouts.veryShort);
      
      // Get shipping price AFTER discount is applied
      cy.getPriceFromElement(MuffinShop.selectors.checkoutShippingPrice).then((shippingPriceAfter) => {
        if (shippingPriceAfter === 0) {
          throw new Error('Shipping price cannot be 0');
        }
        
        cy.log(`Shipping price after discount: €${shippingPriceAfter}`);
        
        // Verify total price calculation
        cy.verifyTotalPrice(
          subtotalBeforeDiscount,
          shippingPriceAfter,
          MuffinShop.testData.discount.percentage
        );
      });
    });

    // Select DPD shipping option
    cy.selectShippingOption(
      MuffinShop.selectors.shippingDpdOption,
      MuffinShop.selectors.shippingDropdownInput
    );

    // Click continue button
    cy.get(MuffinShop.selectors.shippingContinueBtn, { timeout: MuffinShop.timeouts.default })
      .should('be.visible')
      .click();

    // Wait for the next step/page to load
    cy.wait(MuffinShop.timeouts.medium);

    // Click continue again to trigger validation errors
    cy.clickButtonByText(MuffinShop.messages.buttons.continue, [
      MuffinShop.selectors.shippingContinueBtn,
      '[data-qa*="continue"]',
      'button[data-qa*="continue"]'
    ]);

    // Verify all error messages are displayed
    cy.verifyErrorMessages([
      MuffinShop.messages.errors.email,
      MuffinShop.messages.errors.fullName,
      MuffinShop.messages.errors.phone,
      MuffinShop.messages.errors.specialRequests
    ]);

    // Fill in contact information
    cy.fillContactForm(MuffinShop.testData.contactInfo);

    // Wait a bit for form to update
    cy.wait(MuffinShop.timeouts.veryShort);

    // Click Continue
    cy.clickButtonByText(MuffinShop.messages.buttons.continue);

    // Wait for next step to load
    cy.wait(MuffinShop.timeouts.medium);

    // Click "Place an order" button
    cy.clickButtonByText(MuffinShop.messages.buttons.placeOrder);

    // Wait for order confirmation
    cy.wait(MuffinShop.timeouts.long);

    // Verify success messages
    cy.verifySuccessMessages([
      MuffinShop.messages.success.orderThankYou,
      MuffinShop.messages.success.orderReceived
    ]);

    // Click "Got it" button
    cy.clickButtonByText(MuffinShop.messages.buttons.gotIt);

    // Wait a bit
    cy.wait(MuffinShop.timeouts.veryShort);

    // Click "Home" button
    cy.clickButtonByText(MuffinShop.messages.buttons.home);

    // Wait for home page to load
    cy.wait(MuffinShop.timeouts.medium);

    // Click on shopping cart
    cy.get(MuffinShop.selectors.shoppingCartOpenBtn, { timeout: MuffinShop.timeouts.default })
      .first()
      .should('be.visible')
      .click();

    // Wait for cart to open
    cy.wait(MuffinShop.timeouts.veryShort);

    // Verify "Shopping bag is empty" message
    cy.contains(MuffinShop.messages.cart.empty, { timeout: MuffinShop.timeouts.short })
      .should('be.visible');
  });
});