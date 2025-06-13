// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// import HomePage from './pages/Homepage';
// import ExistingDevice from './pages/ExistingDevice';
// import NewDeviceConfig from './pages/NewDeviceConfig';
// import FlashCode from '../src/pages/FlashCode';
// import LiveMonitor from './pages/LiveMonitor'; 

// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<HomePage />} />
//         <Route path="/existing-device" element={<ExistingDevice />} />
//         <Route path="/new-device-config" element={<NewDeviceConfig />} />
//         {/* <Route path="/sensor-setup" element={<SensorSetup/>}/> */}
//         <Route path="/flashCode" element={<FlashCode />} />
//         <Route path="/LiveMonitor" element={<LiveMonitor />} /> 
//       </Routes>
//     </Router>
//   );
// }

// export default App;



import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import HomePage from './pages/Homepage';
import ExistingDevice from './pages/ExistingDevice';
import NewDeviceConfig from './pages/NewDeviceConfig';
import FlashCode from './pages/FlashCode';
import LiveMonitor from './pages/LiveMonitor';
import Preloader from './pages/Preloader'; // Make sure this file exists
import AboutUs from './pages/AboutUs';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Show preloader for exactly 3 seconds
    const timer = setTimeout(() => setLoading(false), 5000);
    return () => clearTimeout(timer); // cleanup
  }, []);

  return (
    <>
      {loading ? (
        <Preloader />
      ) : (
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/existing-device" element={<ExistingDevice />} />
            <Route path="/new-device-config" element={<NewDeviceConfig />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/flashCode" element={<FlashCode />} />
            <Route path="/LiveMonitor" element={<LiveMonitor />} />
          </Routes>
        </Router>
      )}
    </>
  );
}

export default App;
