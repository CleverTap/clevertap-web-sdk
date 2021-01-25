import React from 'react';
import ReactDOM from 'react-dom';
import clevertap from 'clevertap-web-sdk';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

clevertap.init('YOUR_ACCOUNT_ID'); // Replace YOUR_ACCOUNT_ID, can be initialized just once

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
