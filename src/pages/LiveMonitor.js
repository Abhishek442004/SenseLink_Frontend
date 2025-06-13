import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "../styles/LiveMonitor.css";

const socket = io("http://localhost:5000");

const LiveMonitor = () => {
  const [sensorData, setSensorData] = useState({});

  useEffect(() => {
    socket.on("mqtt_data", ({ topic, data }) => {
      if (topic.startsWith("uiot/") && topic.endsWith("/data")) {
        const sensorType = topic.split("/")[1]; // e.g., 'mpu6050'
        try {
          const parsedData = JSON.parse(data);
          setSensorData((prevData) => ({
            ...prevData,
            [sensorType]: parsedData,
          }));
        } catch (err) {
          console.error("Error parsing MQTT data:", err);
        }
      }
    });

    return () => {
      socket.off("mqtt_data");
    };
  }, []);

  return (
    <div className="LiveMonitorContainer">
      <h1 className="LiveMonitorHeading">🚀 Live Sensor Monitor</h1>

      {Object.keys(sensorData).length === 0 ? (
        <div className="NoDataCard">
          <p>📡 No data received yet.<br />Please flash the code and ensure ESP32 is running.</p>
        </div>
      ) : (
        <div className="SensorCardGrid">
          {Object.entries(sensorData).map(([sensor, value]) => (
            <div key={sensor} className="SensorCard">
              <h2 className="SensorTitle">{sensor.toUpperCase()}</h2>
              <div className="SensorContent">
                {typeof value === "object" ? (
                  Object.entries(value).map(([key, val]) =>
                    typeof val === "object" ? (
                      <div key={key} className="SensorSubBlock">
                        <h4>{key}</h4>
                        {Object.entries(val).map(([subKey, subVal]) => (
                          <p key={subKey}>
                            <strong>{subKey}:</strong> {subVal}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p key={key}>
                        <strong>{key}:</strong> {val}
                      </p>
                    )
                  )
                ) : (
                  <p>{value}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveMonitor;
