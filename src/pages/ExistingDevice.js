import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import "../styles/SensorSetup.css";

const socket = io("http://localhost:5000");

const SENSOR_OPTIONS = ["MPU6050", "DHT22", "BME280", "MQ", "HW480"];

const SensorSetup = () => {
  const navigate = useNavigate();
  const [pins, setPins] = useState({ SingleWire: [], Analog: [], I2C: [] });
  const [sensorNames, setSensorNames] = useState({});

  useEffect(() => {
    socket.on("mqtt_data", ({ topic, data }) => {
      if (topic === "uiot/first/status") {
        const parsedPins = parseSensorData(data);
        setPins(parsedPins);

        // Initialize sensor names if not already set
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

  return (
    <div style={{ textAlign: "center", padding: "20px" }} className="SensorSetup">
      <h1 className="name">Sensor Setup</h1>

      <div className="flex">
        {/* SingleWire Column */}
        <div style={columnStyle}>
          <h2 className="sensorType">SingleWire Pins</h2>
          {pins.SingleWire.length > 0 ? (
            pins.SingleWire.map((pin) => (
              <div key={pin} className="Pinstyle">
                <label>Pin {pin}:</label>
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
              <div key={pin} className="Pinstyle">
                <label>Pin {pin}:</label>
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
              <div key={pin} className="Pinstyle">
                <label>Pin {pin}:</label>
                <select
                  value={sensorNames[`I2C-${pin}`] || ""}
                  onChange={(e) => handleSensorSelection("I2C", pin, e.target.value)}
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
      </div>

      {/* Buttons Section */}
      <div style={{ marginTop: "30px" }}>
        <button className="saveNext" onClick={() => navigate("/FlashCode")}>
          Flash Code 
        </button>
          

        <button className="liveMonitorBtn" onClick={() => navigate("/LiveMonitor")}>
         Live Monitor
        </button>
      </div>
    </div>
  );
};

// Inline Styles
const columnStyle = {
  padding: "15px",
  width: "20%",
  textAlign: "center",
  backgroundColor: "rgb(15 2 18)",
  borderRadius: "10px",
  boxShadow: "0px 0px 15px 0px rgba(136, 136, 136, 0.85)",
};

const dropdownStyle = {
  marginLeft: "10px",
  padding: "5px",
};

export default SensorSetup;
