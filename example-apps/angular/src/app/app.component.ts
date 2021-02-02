import { Component } from '@angular/core';
import clevertap from 'clevertap-web-sdk';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  title = 'clevertap-sdk-angular';

  handleEventPushClick () {
    clevertap.event.push('Product Viewed', {
      "Product name": "Casio Chronograph Watch",
      "Category": "Mens Accessories",
      "Price": 59.99,
      "Date": new Date()
    }); // Replace Payload as per your event schema and design
  }
}
