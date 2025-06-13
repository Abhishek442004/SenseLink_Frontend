// import localforage from "localforage";

// // Variable to store the selected port
// let selectedPort = null;

// /**
//  * Connect to ESP device via Web Serial API
//  * @param {Object} config Configuration options
//  * @returns {Promise<ESPLoader>} ESPLoader instance
//  */
// const connectESP = async (config) => {
//   try {
//     // Clear console messaging and log
//     config.log("Checking for ESPTool...");
    
    
//     let ESPLoader;
    

//     if (window.esptool && typeof window.esptool === 'object') {
//       config.log("Found ESPTool from esp-web-tools");
//       if (window.esptool.ESPLoader) {
//         ESPLoader = window.esptool.ESPLoader;
//       }
//     } 
//     // Check for esptooljs
//     else if (window.esptooljs && window.esptooljs.ESPLoader) {
//       config.log("Found ESPLoader in esptooljs");
//       ESPLoader = window.esptooljs.ESPLoader;
//     }
//     // Check if available directly
//     else if (window.ESPLoader) {
//       config.log("Found ESPLoader directly in window");
//       ESPLoader = window.ESPLoader;
//     }
//     // Check for original expected location
//     else if (window.esptoolPackage && window.esptoolPackage.ESPLoader) {
//       config.log("Found ESPLoader in esptoolPackage");
//       ESPLoader = window.esptoolPackage.ESPLoader;
//     }
//     // Last resort - search for any ESPLoader in window
//     else {
//       config.log("Searching for ESPLoader in window object...");
//       for (const key in window) {
//         try {
//           const obj = window[key];
//           if (obj && typeof obj === 'object') {
//             // Check if this object or any of its properties contains ESPLoader
//             if (obj.ESPLoader && typeof obj.ESPLoader === 'function') {
//               config.log(`Found ESPLoader in window.${key}.ESPLoader`);
//               ESPLoader = obj.ESPLoader;
//               break;
//             } else if (obj.esptool && obj.esptool.ESPLoader) {
//               config.log(`Found ESPLoader in window.${key}.esptool.ESPLoader`);
//               ESPLoader = obj.esptool.ESPLoader;
//               break;
//             }
//           }
//         } catch (e) {
//           // Skip any properties that throw errors when accessed
//           continue;
//         }
//       }
//     }
    
//     if (!ESPLoader) {
//       config.log("ESPLoader not found. Make sure esp-web-tools script is loaded before your application.");
//       config.log("Available ESP-related objects in window:");
      
//       // List all ESP-related objects for debugging
//       for (const key in window) {
//         if (key.toLowerCase().includes('esp')) {
//           try {
//             config.log(`- window.${key}: ${typeof window[key]}`);
//           } catch (e) {
//             config.log(`- window.${key}: [Error accessing]`);
//           }
//         }
//       }
      
//       throw new Error("ESPTool package not loaded correctly. Please check the console for details.");
//     }
    
//     // Request port and continue with connection
//     config.log("Requesting serial port...");
//     let port;
//     try {
//       port = await navigator.serial.requestPort();
//       selectedPort = port; // Store for future reference
//     } catch (err) {
//       throw new Error(`Port selection failed: ${err.message}`);
//     }
    
//     config.log("Port selected. Connecting...");
    
//     // Proper port state handling
//     try {
//       // Check if port needs to be closed first
//       if (port.readable || port.writable) {
//         config.log("Port appears to be open, closing first...");
//         await port.close().catch(e => config.log(`Warning when closing port: ${e.message}`));
//         await sleep(1000); // Give it time to properly close
//       }
      
//       // Try opening with specified baud rate
//       await port.open({
//         baudRate: config.baudRate || 115200
//       });
      
//       config.log(`Connected at ${config.baudRate || 115200} baud.`);
//     } catch (err) {
//       throw new Error(`Failed to open port: ${err.message}`);
//     }
    
//     // Create and initialize ESPLoader instance
//     try {
//       const esploader = new ESPLoader(port, config);
//       return esploader;
//     } catch (err) {
//       throw new Error(`Failed to create ESPLoader: ${err.message}`);
//     }
//   } catch (error) {
//     // Always reset the port on errors
//     selectedPort = null;
//     config.log(`Connection error: ${error.message}`);
//     console.error("Connection error:", error);
//     throw error;
//   }
// };

// /**
//  * Reset the stored connection
//  */
// const resetConnection = () => {
//   selectedPort = null;
// };

// /**
//  * Format MAC address as string
//  * @param {Array} macAddr MAC address bytes
//  * @returns {string} Formatted MAC address
//  */
// const formatMacAddr = (macAddr) => {
//   return macAddr.map((value) => value.toString(16).toUpperCase().padStart(2, '0')).join(':');
// };

// /**
//  * Sleep for specified milliseconds
//  * @param {number} ms Milliseconds to sleep
//  * @returns {Promise<void>}
//  */
// const sleep = (ms) => {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// };

// /**
//  * Get default files configuration for chip
//  * @param {string} chipName ESP chip name
//  * @returns {Array} Default file configuration
//  */
// const defaultFiles = (chipName) => {
//   if (chipName.includes('ESP32')) {
//     return [
//       { offset: '1000' },
//       { offset: '8000' },
//       { offset: 'E000' },
//       { offset: '10000' }
//     ];
//   } else {
//     return [
//       { offset: 0 }
//     ];
//   }
// };

// /**
//  * Save file configurations to local storage
//  * @param {Array} newFiles New file configurations
//  */
// const saveFiles = (newFiles) => {
//   localforage.setItem('uploads', newFiles);
// };

// /**
//  * Load file configurations from local storage
//  * @param {string} chipName ESP chip name
//  * @returns {Promise<Array>} File configurations
//  */
// const loadFiles = async (chipName) => {
//   const value = await localforage.getItem('uploads');
//   if (value) {
//     return value;
//   }
//   return defaultFiles(chipName);
// };

// /**
//  * Check if Web Serial API is supported
//  * @returns {boolean} True if supported
//  */
// const supported = () => {
//   return ('serial' in navigator);
// };

// /**
//  * Check if device is connected
//  * @returns {boolean} True if connected
//  */
// const isConnected = () => {
//   return selectedPort !== null && 
//          (selectedPort.readable || selectedPort.writable);
// };

// export { 
//   connectESP, 
//   resetConnection, 
//   formatMacAddr, 
//   sleep, 
//   defaultFiles, 
//   saveFiles, 
//   loadFiles, 
//   supported,
//   isConnected
// };



























// import localforage from "localforage"

// const connectESP = async t => {
//     const esploaderMod = await window.esptoolPackage;
//     const e = await navigator.serial.requestPort();
//     return t.log("Connecting..."), await e.open({
//         baudRate: t.baudRate
//     }), t.log("Connected successfully."), new esploaderMod.ESPLoader(e, t);
// };

// const formatMacAddr = (macAddr) => {
//     return macAddr.map((value) => value.toString(16).toUpperCase().padStart(2, '0')).join(':')
// }

// const sleep = (ms) => {
//     return new Promise((resolve) => setTimeout(resolve, ms));
// }

// const defaultFiles = (chipName) => {
//     //console.log(chipName)

//     if (chipName.includes('ESP32')) {
//         return [
//             { offset: '1000' },
//             { offset: '8000' },
//             { offset: 'E000' },
//             { offset: '10000' }
//         ]
//     } else {
//         return [
//             { offset: 0 }
//         ]
//     }
// }

// const saveFiles = (newFiles) => {
//     localforage.setItem('uploads', newFiles)
// }

// const loadFiles = async (chipName) => {
//     const value = await localforage.getItem('uploads')

//     if (value) {
//         //console.log(value)
//         return value
//     }

//     return defaultFiles(chipName)
// }

// const supported = () => {
//     return ('serial' in navigator)
// }

// export { connectESP, formatMacAddr, sleep, defaultFiles, saveFiles, loadFiles, supported }






















import localforage from "localforage"

const connectESP = async t => {
    const esploaderMod = await window.esptoolPackage;
    const e = await navigator.serial.requestPort();
    return t.log("Connecting..."), await e.open({
        baudRate: t.baudRate
    }), t.log("Connected successfully."), new esploaderMod.ESPLoader(e, t);
};

const formatMacAddr = (macAddr) => {
    return macAddr.map((value) => value.toString(16).toUpperCase().padStart(2, '0')).join(':')
}

const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

const defaultFiles = (chipName) => {
    //console.log(chipName)

    if (chipName.includes('ESP32')) {
        return [
            { offset: '1000' },
            { offset: '8000' },
            { offset: 'E000' },
            { offset: '10000' }
        ]
    } else {
        return [
            { offset: 0 }
        ]
    }
}

const saveFiles = (newFiles) => {
    localforage.setItem('uploads', newFiles)
}

const loadFiles = async (chipName) => {
    const value = await localforage.getItem('uploads')

    if (value) {
        //console.log(value)
        return value
    }

    return defaultFiles(chipName)
}

const supported = () => {
    return ('serial' in navigator)
}

export { connectESP, formatMacAddr, sleep, defaultFiles, saveFiles, loadFiles, supported }

