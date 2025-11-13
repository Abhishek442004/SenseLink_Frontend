import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { toast, ToastContainer } from 'react-toastify'; // --> 1. Import toast
import 'react-toastify/dist/ReactToastify.css';
import TextField from '@mui/material/TextField'; // --> 2. Import TextField
import Button from '@mui/material/Button'; // --> 3. Import Button
// import "../styles/SensorSetup.css"; 

const socket = io("http://localhost:5000");

const SENSOR_OPTIONS = ["MPU6050", "DHT22", "BME280", "MQ", "HW480"];

const SensorSetup = () => {
  const navigate = useNavigate();
  const [pins, setPins] = useState({ SingleWire: [], Analog: [], I2C: [] });
  const [sensorNames, setSensorNames] = useState({});

  // --> 4. Add state for prompt box and compilation
  const [manualPrompt, setManualPrompt] = useState("");
  const [isCompiling, setIsCompiling] = useState(false);

  useEffect(() => {
    const savedNames = localStorage.getItem("sensorNames");
    if (savedNames) {
      setSensorNames(JSON.parse(savedNames));
    }
  }, []); 

  useEffect(() => {
    socket.on("mqtt_data", ({ topic, data }) => {
      if (topic === "uiot/first/status") {
        const parsedPins = parseSensorData(data);
        setPins(parsedPins);
        setSensorNames((prev) => {
          const updatedNames = { ...prev }; 
          Object.keys(parsedPins).forEach((type) => {
            parsedPins[type].forEach((pin) => {
              if (!updatedNames[`${type}-${pin}`]) {
                updatedNames[`${type}-${pin}`] = "";
              }
            });
          });
          return updatedNames;
        });
      }
    });

    return () => {
      socket.off("mqtt_data");
    };
  }, []); 

  const parseSensorData = (data) => {
    const result = { SingleWire: [], Analog: [], I2C: [] };
    data.split("|").forEach((section) => {
      const [type, pins] = section.split(":");
      if (result[type] !== undefined && pins) {
        const pinNumbers = pins.split(",").filter((p) => p.trim() !== "");
        result[type] = pinNumbers;
      }
    });
    return result;
  };

  const handleSensorSelection = (type, pin, value) => {
    setSensorNames((prev) => {
      const updatedNames = { ...prev, [`${type}-${pin}`]: value };
      localStorage.setItem("sensorNames", JSON.stringify(updatedNames));
      return updatedNames;
    });
  };

  // --> 5. New function to handle the manual prompt submission
  const handleGenerateFromPrompt = async () => {
    if (!manualPrompt.trim()) {
      toast.error("Please enter a prompt.");
      return;
    }
    
    // Clear sensor names to avoid confusion on the next page
    localStorage.removeItem("sensorNames");

    setIsCompiling(true);
    const toastId = toast.info("🤖 AI is generating code...", { position: "top-center", autoClose: false });

    try {
        const response = await fetch('http://localhost:5000/ai-compile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: manualPrompt,
                board: 'esp32dev'
            })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.details || "Compilation failed");
        }

        // Save results to localStorage for FlashCode page to pick up
        localStorage.setItem('firmwareFilename', data.binFile);
        localStorage.setItem('firmwareCode', data.generatedCode); // Save the code

        toast.update(toastId, { render: "✅ Code compiled! Navigating to flasher...", type: "success", autoClose: 3000 });
        
        // Navigate to the flasher page
        setTimeout(() => navigate("/FlashCode"), 1000);

    } catch (error) {
        console.error("AI Compilation Error:", error);
        toast.update(toastId, { render: `Error: ${error.message}`, type: "error", autoClose: 5000 });
        setIsCompiling(false); // Only stop compiling on error
    }
    // Don't set isCompiling(false) on success, as we are navigating away
  };

  // --> 6. New function to handle the original "zero-code" flow
  const handleZeroCodeNext = () => {
    // Clear any old manual-prompt-generated files
    localStorage.removeItem('firmwareFilename');
    localStorage.removeItem('firmwareCode');
    // Just navigate. The logic is on the FlashCode page.
    navigate("/FlashCode");
  };


  // --> 7. Updated JSX with prompt box and new buttons
  return (
    <div style={{ textAlign: "center", padding: "20px", color: "white", backgroundColor: "#111", minHeight: "100vh" }} className="SensorSetup">
      <ToastContainer theme="dark" />
      <h1 className="name" style={{ color: "#00aaff" }}>Sensor Setup</h1>
      <p style={{color: "#999", marginBottom: "30px"}}>Select the sensors connected to your ESP32's available pins.</p>

      <div className="flex" style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
        {/* Sensor selection columns (unchanged) ... */}
        {/* SingleWire Column */}
        <div style={columnStyle}>
          <h2 className="sensorType">SingleWire Pins</h2>
          {pins.SingleWire.length > 0 ? (
            pins.SingleWire.map((pin) => (
              <div key={pin} className="Pinstyle" style={{ margin: "10px 0" }}>
                <label style={{ marginRight: "10px" }}>Pin {pin}:</label>
                <select
                  value={sensorNames[`SingleWire-${pin}`] || ""}
                  onChange={(e) => handleSensorSelection("SingleWire", pin, e.target.value)}
                  style={dropdownStyle}
                >
                  <option value="">Select Sensor</option>
                  {SENSOR_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            ))
          ) : (
            <p className="NoPin">No Pins Detected</p>
          )}
        </div>

        {/* Analog Column */}
        <div style={columnStyle}>
          <h2 className="sensorType">Analog Pins</h2>
          {pins.Analog.length > 0 ? (
            pins.Analog.map((pin) => (
              <div key={pin} className="Pinstyle" style={{ margin: "10px 0" }}>
                <label style={{ marginRight: "10px" }}>Pin {pin}:</label>
                <select
                  value={sensorNames[`Analog-${pin}`] || ""}
                  onChange={(e) => handleSensorSelection("Analog", pin, e.target.value)}
                  style={dropdownStyle}
                >
                  <option value="">Select Sensor</option>
                  {SENSOR_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            ))
          ) : (
            <p className="NoPin">No Pins Detected</p>
          )}
        </div>

        {/* I2C Column */}
        <div style={columnStyle}>
          <h2 className="sensorType">I2C Pins</h2>
          {pins.I2C.length > 0 ? (
            pins.I2C.map((pin) => (
              <div key={pin} className="Pinstyle" style={{ margin: "10px 0" }}>
                <label>Pin {pin} (SDA/SCL):</label>
                <select
                  value={sensorNames[`I2C-${pin}`] || ""}
                  onChange={(e) => handleSensorSelection("I2C", pin, e.target.value)}
                  style={dropdownStyle}
                >
                  <option value="">Select Sensor</option>
                  {SENSOR_OPTIONS.filter(opt => opt === "MPU6050" || opt === "BME280").map((option) => ( 
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            ))
          ) : (
            <p className="NoPin">No Pins Detected</p>
          )}
        </div>
      </div>

      {/* --- Updated Buttons Section --- */}
      <div style={{ marginTop: "30px" }}>
        <button className="saveNext" onClick={handleZeroCodeNext} style={buttonStyle} disabled={isCompiling}>
          Next: Flash Code (from Selections)
        </button>
      </div>

      <p style={{color: "#999", margin: "30px auto", fontSize: "1.2rem", fontFamily: "Akira Expanded"}}>
        - OR -
      </p>

      {/* --- New Manual Prompt Section --- */}
      <div style={{maxWidth: "600px", margin: "0 auto"}}>
        <h2 style={{ color: "#00aaff" }}>Manual Prompt</h2>
        <p style={{color: "#999", marginBottom: "20px"}}>
          If you prefer, type your requirements here and the AI will generate the code.
        </p>
        <TextField
          label="Enter your prompt here (e.g., 'A DHT22 on pin 4 and an MPU6050')"
          multiline
          rows={4}
          variant="outlined"
          fullWidth
          value={manualPrompt}
          onChange={(e) => setManualPrompt(e.target.value)}
          disabled={isCompiling}
          sx={{
            mb: 2,
            textarea: { color: 'white' },
            label: { color: '#999' },
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: '#555' },
              '&:hover fieldset': { borderColor: '#777' },
              '&.Mui-focused fieldset': { borderColor: '#0066cc' },
            },
          }}
        />
        <Button 
          variant="contained" 
          color="secondary" 
          fullWidth 
          onClick={handleGenerateFromPrompt} 
          disabled={isCompiling || !manualPrompt.trim()}
          style={{...buttonStyle, backgroundColor: isCompiling ? "#555" : "#00aaff"}}
        >
          {isCompiling ? "Generating..." : "Generate from Prompt & Next"}
        </Button>
      </div>

       {/* Live Monitor Button (unchanged) */}
      <div style={{ marginTop: "50px" }}>
        <button className="liveMonitorBtn" onClick={() => navigate("/LiveMonitor")} style={{...buttonStyle, backgroundColor: "#555", fontFamily: "Arial"}}>
          Go to Live Monitor
        </button>
      </div>

    </div>
  );
};

// Inline Styles (unchanged)
const columnStyle = {
  padding: "15px",
  width: "20%",
  minWidth: "250px", 
  textAlign: "center",
  backgroundColor: "rgb(15 2 18)", 
  borderRadius: "10px",
  boxShadow: "0px 0px 15px 0px rgba(136, 136, 136, 0.85)",
  color: "white",
  border: "1px solid #333"
};

const dropdownStyle = {
  marginLeft: "10px",
  padding: "5px",
  borderRadius: "4px",
  backgroundColor: "#333",
  color: "white",
  border: "1px solid #555"
};

const buttonStyle = {
  padding: "12px 25px",
  margin: "0 10px",
  backgroundColor: "#0066cc",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontFamily: "Akira Expanded",
  fontSize: "0.9rem"
};

export default SensorSetup;