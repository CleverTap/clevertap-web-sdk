import './App.css';
import clevertap from 'clevertap-web-sdk';

function App() {
  clevertap.init('YOUR_ACCOUNT_ID'); // Replace YOUR_ACCOUNT_ID, can be initialized just once
  return (
    <div className="App">
      <h3>CleverTap Web SDK using React</h3>
      <div>
        <button onClick={handleEventPushClick}>Push Event</button>
      </div>
    </div>
  );
}

function handleEventPushClick () {
  clevertap.event.push('Product Viewed', {
    "Product name": "Casio Chronograph Watch",
    "Category": "Mens Accessories",
    "Price": 59.99,
    "Date": new Date()
  }); // Replace Payload as per your event schema and design
}

export default App;
