// // import React from 'react'
// // import PropTypes from 'prop-types'

// // import Grid from '@mui/material/Grid'
// // import Button from '@mui/material/Button'

// // const Buttons = (props) => {
// //     return (
// //         <Grid container spacing={1} direction='row' justifyContent='space-between' alignItems='flex-start'>
// //             <Grid item>
// //                 <Button
// //                     variant='outlined'
// //                     color='error'
// //                     onClick={props.erase}
// //                     disabled={props.disabled}
// //                 >
// //                     Erase
// //                 </Button>
// //             </Grid>

// //             <Grid item>
// //                 <Button
// //                     variant='contained'
// //                     color='success'
// //                     onClick={props.program}
// //                     disabled={props.disabled}
// //                 >
// //                     Program
// //                 </Button>
// //             </Grid>
// //         </Grid>
// //     )
// // }

// // Buttons.propTypes = {
// //     erase: PropTypes.func,
// //     program: PropTypes.func,
// //     disabled: PropTypes.bool,
// // }

// // export default Buttons



// import React from 'react'
// import PropTypes from 'prop-types'
// import Grid from '@mui/material/Grid'
// import Button from '@mui/material/Button'

// const Buttons = (props) => {
//     return (
//         <Grid container spacing={1} direction='row' justifyContent='space-between' alignItems='flex-start'>
//             <Grid item>
//                 <Button
//                     variant='outlined'
//                     color='error'
//                     onClick={props.erase}
//                     disabled={props.disabled}
//                 >
//                     Erase
//                 </Button>
//             </Grid>
//             <Grid item>
//                 <Button
//                     variant='contained'
//                     color='success'
//                     onClick={props.program}
//                     disabled={props.disabled}
//                 >
//                     Configure ESP32
//                 </Button>
//             </Grid>
//             <Grid item>
//                 <Button
//                     variant='contained'
//                     color='primary'
//                     onClick={props.programDHT}
//                     disabled={props.disabled}
//                 >
//                     I2C  Firmware
//                 </Button>
//             </Grid>
//             <Grid item>
//                 <Button
//                     variant='contained'
//                     color='primary'
//                     onClick={props.programMPU}
//                     disabled={props.disabled}
//                 >
//                     SingleWire Firmware
//                 </Button>
//             </Grid>
//             <Grid item>
//                 <Button
//                     variant='contained'
//                     color='primary'
//                     onClick={props.programDM}
//                     disabled={props.disabled}
//                 >
//                     D+M  Firmware
//                 </Button>
//             </Grid>
//         </Grid>
//     )
// }

// Buttons.propTypes = {
//     erase: PropTypes.func,
//     program: PropTypes.func,
//     programDHT: PropTypes.func,
//     programMPU: PropTypes.func,
//     programDM: PropTypes.func,
//     disabled: PropTypes.bool,
// }

// export default Buttons













import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

const Buttons = (props) => {
  // Get the sensor names from localStorage
  const getSensorNames = () => {
    try {
      const savedNames = localStorage.getItem("sensorNames");
      return savedNames ? JSON.parse(savedNames) : {};
    } catch (error) {
      console.error("Error parsing sensorNames from localStorage:", error);
      return {};
    }
  };

  // Check if specific sensors are configured
  const hasSensorOfType = (sensorType) => {
    const sensorNames = getSensorNames();
    return Object.values(sensorNames).some(name => name === sensorType);
  };
    
  // Specifically check for DHT22 and MPU6050 sensors
  const hasDHT22 = hasSensorOfType("DHT22");
  const hasMPU6050 = hasSensorOfType("MPU6050");
  
  // Show D+M button only if both DHT22 and MPU6050 are configured
  const showDMFirmware = hasDHT22 && hasMPU6050;

  return (
    <Grid container spacing={1} direction='row' justifyContent='center' alignItems='flex-start'>
      <Grid item>
        <Button
          variant='outlined'
          color='error'
          onClick={props.erase}
          disabled={props.disabled}
        >
          Erase
        </Button>
      </Grid>
      
      <Grid item>
        <Button
          variant='contained'
          color='success'
          onClick={props.program}
          disabled={props.disabled}
        >
          Configure ESP32
        </Button>
      </Grid>
      
      {hasMPU6050 && (
        <Grid item>
          <Button
            variant='contained'
            color='primary'
            onClick={props.programDHT}
            disabled={props.disabled}
          >
            I2C Firmware
          </Button>
        </Grid>
      )}
      
      {hasDHT22 && (
        <Grid item>
          <Button
            variant='contained'
            color='primary'
            onClick={props.programMPU}
            disabled={props.disabled}
          >
            SingleWire Firmware
          </Button>
        </Grid>
      )}
      
      {/* Show D+M firmware button only if both DHT22 and MPU6050 sensors are present */}
      {showDMFirmware && (
        <Grid item>
          <Button
            variant='contained'
            color='primary'
            onClick={props.programDM}
            disabled={props.disabled}
          >
            DM Firmware
          </Button>
        </Grid>
      )}
    </Grid>
  );
};

Buttons.propTypes = {
  erase: PropTypes.func,
  program: PropTypes.func,
  programDHT: PropTypes.func,
  programMPU: PropTypes.func,
  programDM: PropTypes.func,
  disabled: PropTypes.bool,
};

export default Buttons;