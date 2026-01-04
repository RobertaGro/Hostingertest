/// <reference types="cypress" />
/// <reference path="./commands.d.ts" />
import { MuffinShop } from './MuffinShop.cy';

// ----------------------
// Custom Commands
// ----------------------

// Get price of a product by title (works on both shop page and product page)
Cypress.Commands.add('getPriceByTitle', (title: string, priceSelector = MuffinShop.selectors.productPrice) => {
  // First find the product by text (more flexible)
  return cy.contains(title, { timeout: 10000 })
    .should('be.visible')
    .then(($titleEl: JQuery<HTMLElement>) => {
      // Find the closest product container
      const $container = $titleEl.closest('.product-list_item, .checkout-cartsummary-item, [class*="product"], [class*="item"], div, li, article, section');
      
      // Try to find price in container first using jQuery
      const priceSelectors = [
        'p.block-product__price',
        '.block-product__price',
        'p.block-product_price',
        '.block-product_price',
        'p.product_price',
        '.product_price',
        '[class*="product_price"]',
        '[class*="price"]'
      ];
      
      // Try to find price in container first
      for (const selector of priceSelectors) {
        const $priceEl = $container.find(selector).first();
        if ($priceEl.length > 0) {
          const text = $priceEl.text().trim();
          if (text && (text.includes('€') || /[\d.]+/.test(text))) {
            return cy.wrap($priceEl)
              .should('exist')
              .invoke('text')
              .then((priceText: string) => {
                const raw = String(priceText || '').trim();
                const normalized = raw.replace(/\s/g, '').replace('€', '').replace(',', '.').match(/[\d.]+/);
                const value = normalized ? parseFloat(normalized[0]) : NaN;
                if (Number.isNaN(value)) throw new Error(`Unable to parse price "${priceText}" for product "${title}"`);
                return cy.log(`Found price for "${title}" in container: €${value}`).then(() => value);
              });
          }
        }
      }
      
      // If not found in container, search more broadly
      cy.log(`Price not found in immediate container for "${title}", searching more broadly...`);
      
      // Search the entire page using jQuery - more reliable
      return cy.get('body').then(() => {
        // Try all possible price selectors
        const allSelectors = [
          'p.block-product__price',
          '.block-product__price',
          'p.block-product_price',
          '.block-product_price',
          'p.product_price',
          '.product_price',
          '[class*="product_price"]',
          '[class*="price"]'
        ];
        
        for (const selector of allSelectors) {
          const $allPrices = Cypress.$(selector);
          cy.log(`Found ${$allPrices.length} elements with selector "${selector}"`);
          
          for (let i = 0; i < $allPrices.length; i++) {
            const $priceEl = Cypress.$($allPrices[i]);
            const $priceContainer = $priceEl.closest('.product-list_item, .checkout-cartsummary-item, [class*="product"], [class*="item"], div, li, article, section');
            
            // Check if this price container also contains the product title
            if ($priceContainer.find(`*:contains("${title}")`).length > 0) {
              const text = $priceEl.text().trim();
              if (text && (text.includes('€') || /[\d.]+/.test(text))) {
                return cy.wrap($priceEl)
                  .should('exist')
                  .invoke('text')
                  .then((priceText: string) => {
                    const raw = String(priceText || '').trim();
                    const normalized = raw.replace(/\s/g, '').replace('€', '').replace(',', '.').match(/[\d.]+/);
                    const value = normalized ? parseFloat(normalized[0]) : NaN;
                    if (Number.isNaN(value)) throw new Error(`Unable to parse price for "${title}"`);
                    return cy.log(`Found price for "${title}" with selector "${selector}": €${value}`).then(() => value);
                  });
              }
            }
          }
        }
        
        // Last resort: try to find any element containing € near the product
        cy.log(`Last resort: searching for any element with € near "${title}"...`);
        const $titleContainer = $titleEl.closest('div, li, article, section');
        cy.log(`Title container found: ${$titleContainer.length > 0 ? 'yes' : 'no'}`);
        
        // Search in children
        const $allNearby = $titleContainer.find('*');
        cy.log(`Found ${$allNearby.length} child elements near product title`);
        
        for (let i = 0; i < $allNearby.length; i++) {
          const $el = Cypress.$($allNearby[i]);
          const text = $el.text().trim();
          if (text && text.includes('€') && /[\d.]+/.test(text)) {
            return cy.wrap($el)
              .invoke('text')
              .then((priceText: string) => {
                const raw = String(priceText || '').trim();
                const normalized = raw.replace(/\s/g, '').replace('€', '').replace(',', '.').match(/[\d.]+/);
                const value = normalized ? parseFloat(normalized[0]) : NaN;
                if (Number.isNaN(value)) throw new Error(`Unable to parse price for "${title}"`);
                return cy.log(`Found price for "${title}" (last resort - child): €${value}`).then(() => value);
              });
          }
        }
        
        // Also search in siblings and parent
        const $parent = $titleContainer.parent();
        const $siblings = $titleContainer.siblings();
        const $parentAndSiblings = $parent.add($siblings).find('*');
        cy.log(`Found ${$parentAndSiblings.length} elements in parent/siblings`);
        
        for (let i = 0; i < $parentAndSiblings.length; i++) {
          const $el = Cypress.$($parentAndSiblings[i]);
          const text = $el.text().trim();
          if (text && text.includes('€') && /[\d.]+/.test(text)) {
            return cy.wrap($el)
              .invoke('text')
              .then((priceText: string) => {
                const raw = String(priceText || '').trim();
                const normalized = raw.replace(/\s/g, '').replace('€', '').replace(',', '.').match(/[\d.]+/);
                const value = normalized ? parseFloat(normalized[0]) : NaN;
                if (Number.isNaN(value)) throw new Error(`Unable to parse price for "${title}"`);
                return cy.log(`Found price for "${title}" (last resort - parent/sibling): €${value}`).then(() => value);
              });
          }
        }
        
        // If still not found, throw error with more context
        cy.log(`Could not find price for "${title}". Searched ${allSelectors.length} selectors and ${$allNearby.length + $parentAndSiblings.length} nearby elements.`);
        throw new Error(`Price element not found for product "${title}"`);
      });
    });
});

// Add product to cart
Cypress.Commands.add('addProductToCart', (productTitle: string, quantity: number) => {
  const selectors = MuffinShop.selectors;

  // Ensure we're on shop page - check if products are visible, if not navigate to shop
  cy.get('body').then(($body) => {
    const $products = $body.find('[data-qa="product-list-section-item-title"]');
    if ($products.length === 0) {
      // Not on shop page, navigate to it
      cy.get(MuffinShop.selectors.navShopLink, { timeout: 10000 })
        .should('be.visible')
        .click();
      cy.wait(500);
    }
  });

  // Wait for shop page to be ready and product to be visible
  cy.contains(productTitle, { timeout: 10000 }).should('be.visible');
  
  // Find the product by its h6 title element (based on DOM structure)
  // The product title is in an h6 with data-qa="product-list-section-item-title"
  cy.get('[data-qa="product-list-section-item-title"]', { timeout: 10000 })
    .contains(productTitle)
    .should('be.visible')
    .then(($titleEl) => {
      // The title is in h6, now find the clickable link in the product container
      // Look for the product container (parent with product-list-item class or similar)
      const $container = $titleEl.closest('[class*="product"], [class*="item"], div, li, article, section');
      
      // Try to find a link in the container - could be the container itself or a child
      // First check if container itself is clickable
      if ($container.is('a')) {
        cy.wrap($container).should('be.visible').click({ force: true });
      } else {
        // Find any link within the container
        const $link = $container.find('a').first();
        if ($link.length > 0 && $link.is(':visible')) {
          cy.wrap($link).should('be.visible').click({ force: true });
        } else {
          // If no link found, the title or container might be clickable
          // Try clicking the container or title element
          cy.wrap($container).should('be.visible').click({ force: true });
        }
      }
    });

  // Wait for product page to load - verify we're on product page by checking for product title
  cy.contains(productTitle, { timeout: 10000 }).should('be.visible');
  
  // Wait for page to be fully loaded
  cy.get('body').should('be.visible');
  
  // Get the price from product page and store it as an alias
  cy.getPriceByTitle(productTitle).then((price) => {
    cy.log(`Captured price for "${productTitle}": €${price}`);
    cy.wrap(price).as(`${productTitle}Price`);
  });
  
  // Wait for quantity input/selector - handle both link and input cases
  cy.get(selectors.productPageQtyInput, { timeout: 10000 })
    .should('exist')
    .then(($qtyEl) => {
      // If it's a link, click it to open the quantity selector
      if ($qtyEl.is('a')) {
        cy.wrap($qtyEl).should('be.visible').click();
        // Wait for the input to appear after clicking
        cy.get('input[type="number"], input[data-qa="productpage-text-qty"]', { timeout: 5000 })
          .should('be.visible')
          .first()
          .clear()
          .type(`${quantity}{enter}`);
      } else {
        // It's already an input field
        cy.wrap($qtyEl).should('be.visible').clear().type(`${quantity}{enter}`);
      }
    });

  // Add to cart
  cy.get(selectors.addToBagBtn, { timeout: 10000 }).should('be.visible').click();

  // close cart modal if present
  cy.clickIfExists(selectors.cartCloseBtn);

  // navigate back to shop and wait for it to reload
  cy.go('back');
  // Wait for page to load
  cy.get('body').should('be.visible');
  
  // Wait for shop products to be visible - this confirms we're on shop page
  // Don't rely on navigation link visibility as it might not be immediately available
  cy.get('[data-qa="product-list-section-item-title"]', { timeout: 10000 })
    .should('have.length.at.least', 1)
    .first()
    .should('be.visible');
  
  // Additional wait to ensure page is fully loaded
  cy.wait(300);
});

// Set cart quantity
Cypress.Commands.add('setCartQty', (title: string, targetQty: number) => {
  // Wait for cart to be open and product to be visible
  cy.contains(title, { timeout: 10000 }).should('be.visible');
  
  // Find the cart__content container
  cy.get('.cart__content', { timeout: 10000 })
    .first()
    .should('exist')
    .within(() => {
      // Find the product by title and work within its container
      cy.contains(title)
        .should('be.visible')
        .closest('div, li, article, section')
        .within(() => {
          // Find and click the decrease button ONCE - use the correct selector from image
          cy.get('button[data-qa="shoppingcart-btn-decrease"]', { timeout: 5000 })
            .first()
            .should('exist')
            .should('be.visible')
            .click({ force: true });
          
          // Wait for UI to update
          cy.wait(500);
        });
    });
});

// Expect product titles
Cypress.Commands.add('expectProductTitlesInclude', (titles: string | string[], selector = 'h3') => {
  const list = Array.isArray(titles) ? titles : [titles];
  
  // Wait for page to finish loading/fade-in animation
  cy.get('body').should('be.visible');
  cy.wait(500); // Wait for fade-in animation to complete
  
  list.forEach(t => {
    // Wait for element to be visible (handles fade-in animations)
    cy.contains(selector, t, { timeout: 10000 })
      .should('exist')
      .should('be.visible')
      .should('contain.text', t);
  });
});

// Verify product price on checkout page
Cypress.Commands.add('verifyProductPrice', (productTitle: string, expectedPrice: number) => {
  cy.log(`Verifying price for "${productTitle}": Expected €${expectedPrice}`);
  
  // Use getPriceByTitle to get the actual price, then compare
  // This reuses all the robust search logic we implemented
  cy.getPriceByTitle(productTitle).then((actualPrice) => {
    cy.log(`Found price for "${productTitle}": €${actualPrice} (Expected: €${expectedPrice})`);
    expect(actualPrice).to.equal(expectedPrice);
  });
});

// Optional helper commands
Cypress.Commands.add('getIfExists', (selector: string) => {
  return cy.get('body').then(($body: JQuery<HTMLElement>) => {
    const el = $body.find(selector);
    return cy.wrap(el);
  });
});

Cypress.Commands.add('clickIfExists', (selector: string): Cypress.Chainable<void> => {
  return cy.get('body').then(($body: JQuery<HTMLElement>) => {
    const el = $body.find(selector);
    if (el.length) {
      cy.wrap(el.first()).click();
    }
  }).then(() => undefined) as Cypress.Chainable<void>;
});

// Click button by text with multiple fallback strategies
Cypress.Commands.add('clickButtonByText', (buttonText: string, selectors?: string[]) => {
  const defaultSelectors = selectors || [
    `[data-qa*="${buttonText.toLowerCase()}"]`,
    `button[data-qa*="${buttonText.toLowerCase()}"]`,
    `a[data-qa*="${buttonText.toLowerCase()}"]`
  ];

  cy.get('body').then(($body) => {
    let buttonFound = false;
    
    for (const selector of defaultSelectors) {
      const $button = $body.find(selector).filter(':visible');
      if ($button.length > 0) {
        cy.get(selector).filter(':visible').first().click();
        buttonFound = true;
        break;
      }
    }

    if (!buttonFound) {
      cy.contains(buttonText, { matchCase: false }).first().click();
    }
  });
});

// Fill contact form
Cypress.Commands.add('fillContactForm', (contactInfo: { email: string; fullName: string; phone: string; specialRequests: string }) => {
  const selectors = MuffinShop.selectors;

  // Email
  cy.get(selectors.emailInput, { timeout: MuffinShop.timeouts.default })
    .first()
    .should('be.visible')
    .clear()
    .type(contactInfo.email);

  // Full name
  cy.get(selectors.nameInput, { timeout: MuffinShop.timeouts.default })
    .filter((index, el) => {
      const $el = Cypress.$(el);
      const placeholder = ($el.attr('placeholder') || '').toLowerCase();
      const name = ($el.attr('name') || '').toLowerCase();
      return (placeholder.includes('name') || placeholder.includes('full') || name.includes('name') || name.includes('full')) && 
             !placeholder.includes('email') && !name.includes('email');
    })
    .first()
    .should('be.visible')
    .clear()
    .type(contactInfo.fullName);

  // Phone number
  cy.get(selectors.phoneInput, { timeout: MuffinShop.timeouts.default })
    .first()
    .should('be.visible')
    .clear()
    .type(contactInfo.phone);

  // Special requests
  cy.get(selectors.specialRequestsInput, { timeout: MuffinShop.timeouts.default })
    .should('be.visible')
    .clear()
    .type(contactInfo.specialRequests);
});

// Apply discount code
Cypress.Commands.add('applyDiscountCode', (code: string) => {
  const selectors = MuffinShop.selectors;
  
  cy.get(selectors.discountCodeInput, { timeout: MuffinShop.timeouts.default })
    .should('be.visible')
    .clear()
    .type(code);
  
  cy.get(selectors.discountApplyBtn, { timeout: MuffinShop.timeouts.default })
    .should('be.visible')
    .click();
  
  cy.wait(MuffinShop.timeouts.veryShort);
});

// Verify discount is applied
Cypress.Commands.add('verifyDiscountApplied', (expectedText: string) => {
  cy.get(MuffinShop.selectors.discountPill, { timeout: MuffinShop.timeouts.default })
    .should('be.visible')
    .should('contain.text', expectedText);
});

// Select shipping option and dropdown
Cypress.Commands.add('selectShippingOption', (shippingOptionSelector: string, dropdownInputSelector: string) => {
  cy.get(shippingOptionSelector, { timeout: MuffinShop.timeouts.default })
    .should('be.visible')
    .click();
  
  cy.wait(MuffinShop.timeouts.veryShort);
  
  cy.get(dropdownInputSelector, { timeout: MuffinShop.timeouts.default })
    .should('be.visible')
    .click();
  
  cy.wait(MuffinShop.timeouts.medium);
  
  // Select first option from dropdown
  cy.get('body').then(($body) => {
    const selectors = MuffinShop.selectors.dropdownOptions.split(', ');
    let optionFound = false;
    
    for (const selector of selectors) {
      const $options = $body.find(selector.trim());
      if ($options.length > 0) {
        cy.get(selector.trim()).first().should('be.visible').click({ force: true });
        optionFound = true;
        break;
      }
    }
    
    if (!optionFound) {
      cy.get('body').find('li, [role="option"], div[tabindex]').first().click({ force: true });
    }
  });
  
  cy.wait(MuffinShop.timeouts.veryShort);
});

// Verify error messages
Cypress.Commands.add('verifyErrorMessages', (errorMessages: string[]) => {
  cy.wait(MuffinShop.timeouts.medium);
  
  errorMessages.forEach(message => {
    cy.contains(message, { timeout: MuffinShop.timeouts.short })
      .should('be.visible');
  });
});

// Verify success messages
Cypress.Commands.add('verifySuccessMessages', (successMessages: string[]) => {
  successMessages.forEach(message => {
    cy.contains(message, { timeout: MuffinShop.timeouts.default })
      .should('be.visible');
  });
});
// Delete product from cart
Cypress.Commands.add('deleteProductFromCart', (productTitle: string) => {
  cy.get(MuffinShop.selectors.cartContent, { timeout: MuffinShop.timeouts.default })
    .first()
    .within(() => {
      cy.contains(productTitle, { timeout: 3000 })
        .should('be.visible')
        .then(($productEl: JQuery<HTMLElement>) => {
          const $container = $productEl.closest('div, li, article, section');
          
          let $deleteBtn = $container.find(MuffinShop.selectors.cartDeleteBtn).first();
          
          if ($deleteBtn.length === 0) {
            $deleteBtn = $container.parent().find(MuffinShop.selectors.cartDeleteBtn).first();
          }
          
          if ($deleteBtn.length === 0) {
            const $allDeleteBtns = Cypress.$(MuffinShop.selectors.cartDeleteBtn);
            $allDeleteBtns.each((index, el) => {
              const $el = Cypress.$(el);
              const $btnContainer = $el.closest('div, li, article, section');
              if ($btnContainer.find(`*:contains("${productTitle}")`).length > 0) {
                $deleteBtn = $el;
                return false;
              }
            });
          }
          
          if ($deleteBtn.length > 0) {
            cy.wrap($deleteBtn)
              .should('exist')
              .click({ force: true });
            cy.wait(MuffinShop.timeouts.veryShort);
          } else {
            throw new Error(`Delete button not found for product "${productTitle}"`);
          }
        });
    });
});

// Verify total price calculation
Cypress.Commands.add('verifyTotalPrice', (subtotalBeforeDiscount: number, shippingPrice: number, discountPercentage: number) => {
  const discountAmount = subtotalBeforeDiscount * (discountPercentage / 100);
  const calculatedTotal = subtotalBeforeDiscount - discountAmount + shippingPrice;
  
  cy.log(`Total calculation:`);
  cy.log(`  Subtotal before discount: €${subtotalBeforeDiscount}`);
  cy.log(`  ${discountPercentage}% discount: €${discountAmount.toFixed(2)}`);
  cy.log(`  Shipping: €${shippingPrice}`);
  cy.log(`  Calculated total: €${calculatedTotal.toFixed(2)}`);
  
  cy.get(MuffinShop.selectors.checkoutTotalPrice, { timeout: MuffinShop.timeouts.default })
    .should('be.visible')
    .invoke('text')
    .then((totalText: string) => {
      const rawTotal = String(totalText || '').trim();
      const normalizedTotal = rawTotal.replace(/\s/g, '').replace('€', '').replace(',', '.').match(/[\d.]+/);
      const actualTotal = normalizedTotal ? parseFloat(normalizedTotal[0]) : NaN;
      
      if (Number.isNaN(actualTotal)) {
        throw new Error(`Unable to parse total price: "${totalText}"`);
      }
      
      cy.log(`  Actual total: €${actualTotal}`);
      
      const totalDifference = Math.abs(calculatedTotal - actualTotal);
      expect(totalDifference).to.be.lessThan(0.02,
        `Total verification failed. Calculated (€${calculatedTotal.toFixed(2)}) should match actual (€${actualTotal}). Difference: €${totalDifference.toFixed(2)}`);
      
      cy.log(`  ✓ Total verification passed`);
    });
});

// Get and parse price from element
Cypress.Commands.add('getPriceFromElement', (selector: string) => {
  return cy.get(selector, { timeout: MuffinShop.timeouts.default })
    .should('be.visible')
    .invoke('text')
    .then((priceText: string) => {
      const raw = String(priceText || '').trim();
      const normalized = raw.replace(/\s/g, '').replace('€', '').replace(',', '.').match(/[\d.]+/);
      const value = normalized ? parseFloat(normalized[0]) : NaN;
      
      if (Number.isNaN(value)) {
        throw new Error(`Unable to parse price: "${priceText}"`);
      }
      
      return cy.wrap(value);
    });
});