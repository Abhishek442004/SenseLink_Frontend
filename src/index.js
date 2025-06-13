// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import './index.css'; // This should have Tailwind imports
// import App from './App';

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );


import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import GlobalStyles from '@mui/material/GlobalStyles';

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <GlobalStyles styles={{ body: { margin: 0 } }} />
    <App />
  </React.StrictMode>
);