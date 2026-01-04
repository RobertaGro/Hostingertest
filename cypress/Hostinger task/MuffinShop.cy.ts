export const MuffinShop = {
    urls: {
      base: 'https://lightgrey-antelope-m7vwozwl8xf7l3y2.builder-preview.com/'
    },
    selectors: {
      navShopLink: 'a[data-qa="navigationblock-page-shop"]',
      productTitleLink: 'a[data-qa="product-list-section-item-title"]',
      productPageQtyInput: 'a[data-qa="productpage-text-qty"], input[data-qa="productpage-text-qty"], input[type="number"]',
      addToBagBtn: 'button[data-qa="productsection-btn-addtobag"], [data-qa="productsection-btn-addtobag"]',
      productPrice: 'p.block-product_price, .block-product_price, .product_price, .block-product__price, [class*="product_price"], [class*="price"]',
      cartCloseBtn: 'button.close-button',
      cartQtyInput: 'input.quantity-picker_amount, input[data-qa="shoppingcart-text-qty"], input[type="number"]',
      cartIncreaseBtn: 'button[aria-label*="Increase"], button[data-qa*="increase"], button[name="plus"], button[data-qa="shoppingcart-btn-increase"]',
      cartDecreaseBtn: 'button[aria-label*="Decrease"], button[data-qa*="decrease"], button[name="minus"], button[data-qa="shoppingcart-btn-decrease"]',
      cartDeleteBtn: 'button[data-qa="shoppingcart-btn-delete"]',
      cartCheckoutBtn: 'button[data-qa="shoppingcart-btn-checkout"]',
      shoppingCartOpenBtn: '[data-qa="header-btn-shoppingbag"], button[data-qa="header-btn-shoppingbag"]',
      cartContent: '.cart__content',
      // Checkout selectors
      checkoutSubtotalPrice: '[data-qa="checkout-cartsummary-subtotalprice-value"]',
      checkoutShippingPrice: '[data-qa="checkout-cartsummary-shippingprice-value"]',
      checkoutTotalPrice: '[data-qa="checkout-cartsummary-totalprice-value"]',
      discountCodeInput: '#discountCode',
      discountApplyBtn: 'button[data-qa="checkout-cartsummary-button-discountapply"]',
      discountPill: '[data-qa="checkout-cartsummary-discount-pill"]',
      // Shipping selectors
      shippingDpdOption: '[data-qa="checkout-shippingdetails-option-dpdpickup"]',
      shippingDropdownInput: '#input-23',
      shippingContinueBtn: '[data-qa="checkout-shippingdetails-continue"]',
      // Form selectors
      emailInput: 'input[type="email"], input[name*="email"], input[id*="email"], input[placeholder*="email" i]',
      nameInput: 'input[name*="name"], input[id*="name"], input[placeholder*="name" i], input[type="text"]',
      phoneInput: 'input[type="tel"], input[name*="phone"], input[id*="phone"], input[placeholder*="phone" i]',
      specialRequestsInput: '#customFieldValue',
      // Dropdown selectors
      dropdownOptions: '[role="listbox"] [role="option"], [role="listbox"] li, .v-list-item, .v-select-list li, ul[role="listbox"] li, .menuable__content__active li, .v-menu__content li'
    },
    products: {
      blueberry: 'Blueberry Burst Muffins',
      chococar: 'Choco-Caramel Drizzle Cupcakes',
      glazed: 'Glazed Paradise Donuts',
      cookiesCream: 'Cookies & Cream Cloud Cupcakes',
      lemon: 'Lemon Zest Muffins'
    },
    testData: {
      contactInfo: {
        email: 'test.testerman@gmail.com',
        fullName: 'Test Testerman',
        phone: '64780225',
        specialRequests: 'No special requests'
      },
      discount: {
        code: 'MUFFIN',
        percentage: 10,
        expectedText: 'MUFFIN (10% OFF)'
      }
    },
    messages: {
      pageTitle: 'Freshly Baked Muffins',
      errors: {
        email: 'Enter a valid email',
        fullName: 'Enter a full name',
        phone: 'Enter a phone number',
        specialRequests: 'Do you have any special requests or dietary restrictions we should be aware of? (e.g., gluten-free, nut allergies) is required'
      },
      success: {
        orderThankYou: 'Thank you for your order',
        orderReceived: 'Your order has been received.'
      },
      cart: {
        empty: 'Shopping bag is empty'
      },
      buttons: {
        continue: 'Continue',
        placeOrder: 'Place an order',
        gotIt: 'Got it',
        home: 'Home',
        shop: 'Shop'
      }
    },
    timeouts: {
      default: 10000,
      short: 5000,
      veryShort: 500,
      medium: 1000,
      long: 2000
    }
  };