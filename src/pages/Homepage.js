import React from "react";
import { UserCircle2 } from "lucide-react";
import "../styles/Homepage.css"; 
// import ThreeDModel from "../components/ThreeDModel"; 
import { useNavigate } from "react-router-dom";
import VoltacesLogo from "../assets/VoltAcesLogo.png";  

export default function HomePage() {
  const navigate = useNavigate();


  return (
    <div className="homepage">
      

      <div className="header">
      <div className="logo-container">
        <h1 className="logo-title" style={{ fontFamily: "Harlow Solid Italic" }}>
         <span>Sense</span>
         <span>Link</span>
         <img className="logo" src={VoltacesLogo} alt="logo" />
        </h1>
        <p className="team-credit" style={{ fontFamily: "Akira Expanded" }}>
         A product by team <span style={{ color: "red" }}>voltaces</span>
        </p>
      </div>


        <div className="button-group">
          <button className="action-button" style={{fontFamily: "Akira Expanded"}} onClick={() => navigate("/existing-device")}>
            USE EXISTING <br /> DEVICE
          </button>
          <button className="action-button" style={{fontFamily: "Akira Expanded"}} onClick={() => navigate("/new-device-config")}>
            CONFIGURE <br /> NEW DEVICE
          </button>
          <button className="action-button" style={{fontFamily: "Akira Expanded"}} onClick={() => navigate("/about")}>
            ABOUT <br /> US
          </button>
          <UserCircle2 size={40} className="user-icon" />
        </div>
      </div>

     
      <div className="content-placeholder"></div>

      {/* <div className="content-placeholder">
        <ThreeDModel />
      </div> */}



      <div className="data-hero-section">
        <h1 className="data-hero-title" style={{ fontFamily: "Akira Expanded" }}>
          The New Standard<br />in IoT
        </h1>
        <p className="data-hero-subtitle" style={{ fontFamily: "Akira Expanded" }}>
          "Create, Connect, and Control IoT Devices Instantly with <span style={{color:"red"}}>SenseLink</span>"
        </p>
        <button className="data-hero-button">Learn More</button>
      </div>





<div className="info-section">       
  <div className="info-left">
    <h2 className="info-title">"Bridge the Gap Between Devices and Intelligence — SenseLink Leads the Way."</h2>
    <p className="info-description">
      Connect and manage any device in seconds with a platform built for speed, scale, and simplicity. From real-time data to seamless control, bring your IoT ideas to life — effortlessly.
    </p>
  </div>

  <div className="info-right">
    <div className="info-card">
      <span className="icon">☁️</span>
      <h3>Plug & Play Device Connectivity</h3>
      <p>Instantly connect a wide range of sensors and devices with minimal effort.
         No complex setup — just plug in and start monitoring.</p>
    </div>
    <div className="info-card">
      <span className="icon">🧪</span>
      <h3>Real-Time Monitoring & Data Visualization</h3>
      <p>Track your device data live with intuitive and responsive dashboards.
        Make smarter decisions with instant access to actionable insights.</p>
    </div>
    <div className="info-card">
      <span className="icon">🧩</span>
      <h3>Universal Compatibility & Scalability</h3>
      <p>Supports multiple protocols and devices — from a single sensor to large-scale networks.
        Designed to grow effortlessly with your needs.</p>
    </div>
    <div className="info-card">
      <span className="icon">💬</span>
      <h3>Zero-Code Configuration</h3>
      <p>Set up and deploy your IoT devices without writing a single line of code.
         Our intuitive interface lets anyone get started — no technical expertise required.</p>
    </div>
  </div>
</div>

      <div className="hero-section">
        <h1 className="hero-title">Your Device. Your goals. <br/> Our Vision</h1>
        <button className="hero-button" onClick={() => navigate("/get-started")}>
         Get Started
        </button>
      </div>


      {/* Footer */}
      <footer className="footer" style={{fontFamily: "Akira Expanded"}}>
        Designed and developed by team <span className="highlight">Voltaces</span>
      </footer>
    </div>
  );
}