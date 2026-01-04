MuffinShop Tests

Cypress E2E Tests – MuffinShop

This repository contains automated end-to-end tests for the MuffinShop website using Cypress with TypeScript.

Requirements

Node.js (LTS recommended)

npm or yarn

Installation

Clone the repository:

git clone https://github.com/RobertaGro/Hostingertest
cd Hostingertest


Install dependencies:

npm install
# or
yarn install

Running Tests

GUI / Headed Mode:

npx cypress open


Headless / CI-CD Mode:

npx cypress run

Project Structure
cypress/
  fixtures/
    MuffinFixtures.ts       # Test data and selectors
  support/
    commands.ts             # Custom Cypress commands
    commands.d.ts           # Type declarations for custom commands
  e2e/
    MuffinShopE2E.cy.ts    # End-to-end shopping workflow test
tsconfig.json               # TypeScript configuration

Test Scenarios
MuffinShopE2E.cy.ts

Purpose: Verify full shopping workflow including adding products to cart, adjusting quantities, deleting items, and checkout.

Steps:

Visit MuffinShop homepage

Navigate to Shop page

Add products to cart with specified quantities:

Blueberry Burst Muffins → 2

Choco-Caramel Drizzle Cupcakes → 1

Glazed Paradise Donuts → 1

Cookies & Cream Cloud Cupcakes → 2

Open cart and update quantity for Blueberry Muffins → 1

Delete Choco-Caramel Cupcakes if present

Proceed to checkout

Assert that expected products are displayed in the checkout page

Custom commands used:

cy.addProductToCart(title, qty) – Add product with quantity to cart

cy.getPriceByTitle(title) – Get product price

cy.setCartQty(title, qty) – Update cart quantity

cy.expectProductTitlesInclude(titles) – Verify products are visible

cy.clickIfExists(selector) – Click element if present

Technologies Used

Cypress – End-to-end testing framework

TypeScript – Strongly typed language for maintainable tests

Lodash – Utility library (used internally in custom commands for loops)

Author

Roberta – Test Automation Specialist


