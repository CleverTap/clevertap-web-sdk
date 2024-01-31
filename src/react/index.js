import React from 'react';
import ReactDOM from 'react-dom/client';

const App = () => {
  return <div>Hello World</div>
}

// Adding a div since react throws a warning if we directly append 
// our application to body
(() => {
  const div = document.createElement('div');
  div.id = "clevertap-overlay"
  document.body.appendChild(div);
})();

ReactDOM.createRoot(document.getElementById('clevertap-overlay')).render(
   <App/>
);
