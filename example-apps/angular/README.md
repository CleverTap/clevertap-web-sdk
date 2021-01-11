# ClevertapSdkAngular

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.0.7.

## Integeration of CleverTap Web SDK

This project comes pre installed with the web sdk. In order to install it into your own project you can install it as follows

`npm install clevertap-web-sdk --save`

Next Import CleverTap (`import clevertap from 'clevertap-web-sdk';`) into your component and initialize it (`clevertap.init('YOUR_ACCOUNT_ID')`). You can now import your `clevertap` instance into any component and use it. 

Example: 
``` JavaScript
  handleEventPushClick () {
    clevertap.event.push('Product Viewed', {
      "Product name": "Casio Chronograph Watch",
      "Category": "Mens Accessories",
      "Price": 59.99,
      "Date": new Date()
    }); // Replace Payload as per your event schema and design
  }
```


## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
