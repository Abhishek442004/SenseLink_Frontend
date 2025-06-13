import React from "react";
import "../styles/NewDeviceConfig.css"; 

export default function NewDeviceConfig() {
  return (
    <div className="config-container">
      <div className="title">
        <h1 style={{fontFamily:"Harlow Solid Italic"} } >Sense<span>Link</span></h1>
        <p className="subtitle" style={{fontFamily:"Akira Expanded"}}>A PRODUCT BY TEAM <span style={{color:"red"}}>VOLTACES</span></p>
      </div>

      <div className="main-content">
        <h2 style={{fontFamily:"Akira Expanded"}}>
          CONFIGURE YOUR <span className="highlight">ESP32</span> DEVICE
        </h2>

        <ol className="instructions" style={{fontFamily:"Akira Expanded"}}>
          <li>POWER ON YOUR ESP32.</li>
          <li>ON YOUR PHONE OR LAPTOP, GO TO WI-FI SETTINGS.</li>
          <li>CONNECT TO THE WI-FI NETWORK <strong>ESP32-SETUP</strong>.</li>
          <li>RETURN TO THIS PAGE AND CLICK THE BUTTON BELOW.</li>
        </ol>
        <div className="button-container">
        <a
          href="http://192.168.4.1"
          target="_blank"
          rel="noopener noreferrer"
          className="config-button"
          style={{fontFamily:"Akira Expanded"}}
        >
          CONFIGURE ESP32
        </a>
        </div>
      </div>

      <footer className="footer" style={{fontFamily:"Akira Expanded"}}>
        DESIGNED AND DEVELOPED BY TEAM <span>VOLTACES</span>
      </footer>
    </div>
  );
}
