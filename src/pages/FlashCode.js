import React, { useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Header from '../components/Header'
import Home from '../components/Home'
// import FileList from '../components/FileList'
import Output from '../components/Output'
import Buttons from '../components/Buttons'
import Settings from '../components/Settings'
import ConfirmWindow from '../components/ConfirmWindow'
import Footer from '../components/Footer'

import { connectESP, formatMacAddr, sleep, loadFiles, supported } from '../lib/esp'
import { loadSettings, defaultSettings } from '../lib/settings'

const FlashCode = () => {
  const [connected, setConnected] = React.useState(false)
  const [connecting, setConnecting] = React.useState(false)
  const [output, setOutput] = React.useState({ time: new Date(), value: 'Click Connect to start\n' })
  const [espStub, setEspStub] = React.useState(undefined)
  const [uploads, setUploads] = React.useState([])
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const [settings, setSettings] = React.useState({...defaultSettings})
  const [confirmErase, setConfirmErase] = React.useState(false)
  const [confirmProgram, setConfirmProgram] = React.useState(false)
  const [flashing, setFlashing] = React.useState(false)
  const [chipName, setChipName] = React.useState('')

  useEffect(() => {
    setSettings(loadSettings())
  }, [])

  const addOutput = (msg) => {
    setOutput({
      time: new Date(),
      value: `${msg}\n`,
    })
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
    // Request port explicitly before calling connectESP()
    const port = await navigator.serial.requestPort();
    esploader = await connectESP({
      port, // Ensure we pass the selected port
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
    setUploads(await loadFiles(esploader.chipName));

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

  const program = async () => {
    setConfirmProgram(false)
    setFlashing(true)

    try {
      const response = await fetch('/Source.bin')
      if (!response.ok) {
        throw new Error('Failed to load binary file')
      }
      const binaryData = await response.blob()
      
      const binFile = new File([binaryData], 'Source.bin', {
        type: 'application/octet-stream'
      })

      toast(`Uploading firmware...`, {
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
        0x10000
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

  const programDHT = async () => {
    setConfirmProgram(false)
    setFlashing(true)

    try {
      const response = await fetch('/MPU.ino.esp32da.bin')
      if (!response.ok) {
        throw new Error('Failed to load binary file')
      }
      const binaryData = await response.blob()
      
      const binFile = new File([binaryData], 'MPU.ino.esp32da.bin', {
        type: 'application/octet-stream'
      })

      toast(`Uploading MPU firmware...`, {
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
          addOutput(`Flashing MPU... ${percentage}%`)
        },
        0x10000
      )

      await sleep(100)
      
      addOutput(`Done!`)
      addOutput(`To run the new MPU firmware please reset your device.`)
      
      toast.success('Done! Reset ESP to run new MPU firmware.', {
        position: 'top-center',
        toastId: 'uploaded',
        autoClose: 3000
      })

    } catch (e) {
      addOutput(`ERROR!`)
      addOutput(`${e}`)
      console.error(e)
      
      toast.error(`Failed to flash MPU firmware: ${e}`, {
        position: 'top-center',
        toastId: 'upload-error',
        autoClose: 3000
      })
    } finally {
      setFlashing(false)
    }
  }

  const programMPU = async () => {
    setConfirmProgram(false)
    setFlashing(true)

    try {
      const response = await fetch('/dht22.ino.esp32da.bin')
      if (!response.ok) {
        throw new Error('Failed to load binary file')
      }
      const binaryData = await response.blob()
      
      const binFile = new File([binaryData], 'dht22.ino.esp32da.bin', {
        type: 'application/octet-stream'
      })

      toast(`Uploading SingleWire firmware...`, {
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
          addOutput(`Flashing SingleWire... ${percentage}%`)
        },
        0x10000
      )

      await sleep(100)
      
      addOutput(`Done!`)
      addOutput(`To run the new SingleWire firmware please reset your device.`)
      
      toast.success('Done! Reset ESP to run new SingleWire firmware.', {
        position: 'top-center',
        toastId: 'uploaded',
        autoClose: 3000
      })

    } catch (e) {
      addOutput(`ERROR!`)
      addOutput(`${e}`)
      console.error(e)
      
      toast.error(`Failed to flash SingleWire firmware: ${e}`, {
        position: 'top-center',
        toastId: 'upload-error',
        autoClose: 3000
      })
    } finally {
      setFlashing(false)
    }
  }

  const programDM = async () => {
    setConfirmProgram(false)
    setFlashing(true)

    try {
      const response = await fetch('/DM.ino.esp32da.bin')
      if (!response.ok) {
        throw new Error('Failed to load binary file')
      }
      const binaryData = await response.blob()
      
      const binFile = new File([binaryData], 'DM.ino.esp32da.bin', {
        type: 'application/octet-stream'
      })

      toast(`Uploading DM firmware...`, {
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
          addOutput(`Flashing DM firmware... ${percentage}%`)
        },
        0x10000
      )

      await sleep(100)
      
      addOutput(`Done!`)
      addOutput(`To run the new DM firmware please reset your device.`)
      
      toast.success('Done! Reset ESP to run new DM firmware.', {
        position: 'top-center',
        toastId: 'uploaded',
        autoClose: 3000
      })

    } catch (e) {
      addOutput(`ERROR!`)
      addOutput(`${e}`)
      console.error(e)
      
      toast.error(`Failed to flash DM firmware: ${e}`, {
        position: 'top-center',
        toastId: 'upload-error',
        autoClose: 3000
      })
    } finally {
      setFlashing(false)
    }
  }

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

        {/* {connected &&
          <Grid item>
            <FileList
              uploads={uploads}
              setUploads={setUploads}
              chipName={chipName}
            />
          </Grid>
        } */}

        {connected &&
          <Grid item>
            <Buttons
              erase={() => setConfirmErase(true)}
              program={() => setConfirmProgram(true)}
              programDHT={programDHT}
              programMPU={programMPU}
              programDM={programDM}
              disabled={flashing}
            />
          </Grid>
        }

        {supported() &&
          <Grid item>
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
        text={'Flashing new firmware will override the current firmware.'}
        onOk={program}
        onCancel={() => setConfirmProgram(false)}
      />

      <ToastContainer />

      <Footer sx={{ mt: 'auto' }} />
    </Box>
  )
}

export default FlashCode;