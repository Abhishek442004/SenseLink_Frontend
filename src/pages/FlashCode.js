import React, { useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button' 
import Header from '../components/Header' // Ensure this component exists
import Home from '../components/Home'     // Ensure this component exists
import Output from '../components/Output'   // Ensure this component exists
import Buttons from '../components/Buttons'   // This is the new simplified buttons component
import Settings from '../components/Settings' // Ensure this component exists
import ConfirmWindow from '../components/ConfirmWindow' // Ensure this component exists
import Footer from '../components/Footer'   // Ensure this component exists

import { connectESP, sleep, loadFiles, supported } from '../lib/esp' // Ensure this lib file exists
import { loadSettings, defaultSettings } from '../lib/settings' // Ensure this lib file exists

const FlashCode = () => {
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [output, setOutput] = useState({ time: new Date(), value: 'Click Connect to start\n' })
  const [espStub, setEspStub] = useState(undefined)
  const [uploads, setUploads] = useState([]) // This state is not used in the simplified version, but harmless
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settings, setSettings] = useState({...defaultSettings})
  const [confirmErase, setConfirmErase] = useState(false)
  const [confirmProgram, setConfirmProgram] = useState(false)
  const [flashing, setFlashing] = useState(false)
  const [chipName, setChipName] = useState('')

  // New state for AI compilation
  const [isCompiling, setIsCompiling] = useState(false)
  const [firmwareInfo, setFirmwareInfo] = useState({
    filename: null,
    code: '',
    board: '',
    size: ''
  })

  useEffect(() => {
    setSettings(loadSettings())
    // Optionally load the last known filename
    const lastFile = localStorage.getItem('firmwareFilename');
    if (lastFile) {
      setFirmwareInfo(prev => ({ ...prev, filename: lastFile }));
    }
  }, [])

  const addOutput = (msg) => {
    setOutput((prev) => ({
      time: new Date(),
      value: `${prev.value}${msg}\n`, // Append to previous output
    }))
  }

  const clickConnect = async () => {
    if (espStub) {
      await espStub.disconnect();
      await espStub.port.close();
      setEspStub(undefined);
      return;
    }

    let esploader = null; 
    let toastId = toast.info("Connecting...", { position: "top-center", autoClose: false });

    try {
      const port = await navigator.serial.requestPort();
      esploader = await connectESP({
        port,
        log: addOutput,
        debug: console.debug,
        error: console.error,
        baudRate: parseInt(settings.baudRate),
      });

      if (!esploader) throw new Error("ESP connection failed!");

      setConnecting(true);
      await esploader.initialize();

      addOutput(`✅ Connected to ${esploader.chipName}`);
      toast.update(toastId, { render: "Connected 🚀", type: "success", autoClose: 3000 });

      const newEspStub = await esploader.runStub();
      setEspStub(newEspStub);
      setConnected(true);
      setChipName(esploader.chipName);
      if (loadFiles) { // Check if loadFiles function exists
        setUploads(await loadFiles(esploader.chipName));
      }

      newEspStub.port.addEventListener("disconnect", () => {
        setConnected(false);
        setEspStub(undefined);
        toast.warning("Disconnected 💔", { autoClose: 3000 });
        addOutput(`------------------------------------------------------------`);
      });

    } catch (err) {
      console.error("❌ Connection failed:", err);
      toast.update(toastId, { render: err.message, type: "error", autoClose: 3000 });
    } finally {
      setConnecting(false);
    }
  };

  const erase = async () => {
    if (!espStub) {
      toast.error("ESP not connected!", { position: "top-center", autoClose: 3000 });
      return;
    }

    setConfirmErase(false);
    setFlashing(true);
    toast.info("Erasing flash memory. Please wait...", { position: "top-center", autoClose: false });

    try {
      await espStub.eraseFlash();
      toast.success("Erased successfully!", { autoClose: 3000 });
    } catch (e) {
      toast.error(`Erase failed: ${e}`, { autoClose: 3000 });
      console.error(e);
    } finally {
      setFlashing(false);
    }
  };

  const toArrayBuffer = (inputFile) => {
    const reader = new FileReader()
    return new Promise((resolve, reject) => {
      reader.onerror = () => {
        reader.abort()
        reject(new DOMException('Problem parsing input file.'))
      }
      reader.onload = () => {
        resolve(reader.result)
      }
      reader.readAsArrayBuffer(inputFile)
    })
  }

  const handleGenerateCode = async () => {
    const storedNames = localStorage.getItem("sensorNames");
    const sensorConfig = storedNames ? JSON.parse(storedNames) : {};

    let prompt = "Generate ESP32 code for the following sensors: ";
    let sensorsFound = 0;
    for (const [key, sensorName] of Object.entries(sensorConfig)) {
        if (sensorName) {
            const [type, pin] = key.split('-');
            prompt += `${sensorName} (${type} on pin ${pin}), `;
            sensorsFound++;
        }
    }

    if (sensorsFound === 0) {
        toast.error("No sensors configured. Please go back to Sensor Setup.");
        return;
    }

    prompt = prompt.slice(0, -2);
    prompt += ". Please publish data to MQTT topics in the format uiot/[sensor_name]/data.";

    console.log("Generated AI Prompt:", prompt);
    setIsCompiling(true);
    const toastId = toast.info("🤖 AI is generating code... this may take a minute.", { position: "top-center", autoClose: false });
    addOutput(`Generating code for: ${prompt}`);

    try {
        const response = await fetch('http://localhost:5000/ai-compile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: prompt,
                board: 'esp32dev'
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.details || "Compilation failed");
        }

        setFirmwareInfo({
            filename: data.binFile,
            code: data.generatedCode,
            board: data.boardName,
            size: data.fileSize
        });
        
        localStorage.setItem('firmwareFilename', data.binFile);

        toast.update(toastId, { render: "✅ Code compiled! Ready to flash.", type: "success", autoClose: 3000 });
        addOutput(`Generated firmware: ${data.binFile} (${data.fileSize})`);
        addOutput(`Ready to flash.`);

    } catch (error) {
        console.error("AI Compilation Error:", error);
        toast.update(toastId, { render: `Error: ${error.message}`, type: "error", autoClose: 5000 });
        addOutput(`AI compilation failed: ${error.message}`);
    } finally {
        setIsCompiling(false);
    }
  };

  // MODIFIED program function
  const program = async () => {
    setConfirmProgram(false)

    if (!firmwareInfo.filename) {
      toast.error("Please generate the code first!", { autoClose: 3000 });
      addOutput("ERROR: No firmware file generated. Click 'Generate Code' first.");
      return;
    }

    setFlashing(true)

    try {
      addOutput(`Downloading ${firmwareInfo.filename}...`);
      const response = await fetch(`http://localhost:5000/download/${firmwareInfo.filename}`)
      
      if (!response.ok) {
        throw new Error(`Failed to download binary file: ${firmwareInfo.filename}`)
      }
      const binaryData = await response.blob()
      
      const binFile = new File([binaryData], firmwareInfo.filename, {
        type: 'application/octet-stream'
      })

      toast(`Uploading ${firmwareInfo.filename}...`, {
        position: 'top-center',
        progress: 0,
        toastId: 'upload'
      })

      const contents = await toArrayBuffer(binFile)
      
      await espStub.flashData(
        contents,
        (bytesWritten, totalBytes) => {
          const progress = (bytesWritten / totalBytes)
          const percentage = Math.floor(progress * 100)
          
          toast.update('upload', { progress: progress })
          addOutput(`Flashing... ${percentage}%`)
        },
        0x0000 // Standard flash offset
      )

      await sleep(100)
      
      addOutput(`Done!`)
      addOutput(`To run the new firmware please reset your device.`)
      
      toast.success('Done! Reset ESP to run new firmware.', {
        position: 'top-center',
        toastId: 'uploaded',
        autoClose: 3000
      })

    } catch (e) {
      addOutput(`ERROR!`)
      addOutput(`${e}`)
      console.error(e)
      
      toast.error(`Failed to flash firmware: ${e}`, {
        position: 'top-center',
        toastId: 'upload-error',
        autoClose: 3000
      })
    } finally {
      setFlashing(false)
    }
  }

  // All old 'programDHT', 'programMPU', 'programDM' functions are removed.

  return (
    <Box sx={{ minWidth: '25rem' }}>
      <Header sx={{ mb: '1rem' }} />

      <Grid container spacing={1} direction='column' justifyContent='space-around' alignItems='center' sx={{ minHeight: 'calc(100vh - 116px)' }}>
        {!connected && !connecting &&
          <Grid item>
            <Home
              connect={clickConnect}
              supported={supported}
              openSettings={() => setSettingsOpen(true)}
            />
          </Grid>
        }

        {!connected && connecting &&
          <Grid item>
            <Typography variant='h3' component='h2' sx={{ color: '#aaa' }}>
              Connecting...
            </Typography>
          </Grid>
        }

        {connected &&
          <Grid item sx={{ width: '90%', maxWidth: '600px' }}>
            
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleGenerateCode}
              disabled={isCompiling || flashing || !connected}
              sx={{ mb: 2, backgroundColor: '#0066cc', '&:hover': { backgroundColor: '#0055aa' } }}
            >
              {isCompiling ? "Compiling..." : "1. Generate Code from Sensor Setup"}
            </Button>

            {firmwareInfo.code && (
              <Box sx={{ 
                textAlign: 'left',
                maxHeight: '200px', 
                overflowY: 'auto', 
                border: '1px solid #555', 
                borderRadius: '4px', 
                p: 1, 
                backgroundColor: '#1e1e1e',
                fontFamily: 'monospace', 
                whiteSpace: 'pre-wrap',
                mb: 2,
                color: '#d4d4d4'
              }}>
                <Typography variant="body2" sx={{color: '#888', mb: 1}}>Generated Code for {firmwareInfo.filename}:</Typography>
                {firmwareInfo.code}
              </Box>
            )}
            
            <Buttons
              erase={() => setConfirmErase(true)}
              program={() => setConfirmProgram(true)}
              disabled={flashing || isCompiling || !firmwareInfo.filename} 
            />
            
            {!firmwareInfo.filename && (
                <Typography variant="caption" sx={{color: '#999', mt: 1, display: 'block', textAlign: 'center'}}>
                  'Program ESP' will be enabled after you 'Generate Code'.
                </Typography>
            )}
          </Grid>
        }

        {supported() &&
          <Grid item sx={{width: '90%', maxWidth: '600px'}}>
            <Output received={output} />
          </Grid>
        }
      </Grid>

      <Settings
        open={settingsOpen}
        close={() => setSettingsOpen(false)}
        setSettings={setSettings}
        settings={settings}
        connected={connected}
      />

      <ConfirmWindow
        open={confirmErase}
        text={'This will erase the memory of your ESP.'}
        onOk={erase}
        onCancel={() => setConfirmErase(false)}
      />

      <ConfirmWindow
        open={confirmProgram}
        text={`This will flash ${firmwareInfo.filename || 'new firmware'} and override the current firmware.`}
        onOk={program}
        onCancel={() => setConfirmProgram(false)}
      />

      <ToastContainer />

      <Footer sx={{ mt: 'auto' }} />
    </Box>
  )
}

export default FlashCode;