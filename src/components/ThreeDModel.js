// import React, { Suspense, useRef, useEffect } from "react";
// import { Canvas, useFrame } from "@react-three/fiber";
// import { OrbitControls, useGLTF } from "@react-three/drei";

// function SaturnModel() {
//   const { scene } = useGLTF("/models/arduino_uno_low_poly.glb"); 
//   const modelRef = useRef();

//   // Optional animation (slow rotation)
//   useFrame(() => {
//     if (modelRef.current) {
//       modelRef.current.rotation.y += 0.002;
//     }
//   });

//   return <primitive ref={modelRef} object={scene} scale={2.5} />;
// }

// export default function ThreeDModel() {
//   const canvasRef = useRef();

//   useEffect(() => {
//     const canvas = canvasRef.current?.gl?.domElement;

//     if (!canvas) return;

//     const handleContextLost = (e) => {
//       e.preventDefault();
//       console.warn("🛑 WebGL context lost");
//     };

//     const handleContextRestored = () => {
//       console.info("✅ WebGL context restored");
//     };

//     canvas.addEventListener("webglcontextlost", handleContextLost, false);
//     canvas.addEventListener("webglcontextrestored", handleContextRestored, false);

//     return () => {
//       canvas.removeEventListener("webglcontextlost", handleContextLost);
//       canvas.removeEventListener("webglcontextrestored", handleContextRestored);
//     };
//   }, []);

//   return (
//     <div style={{ height: "500px", width: "100%", position: "relative", background: "#000" }}>
//       <Suspense
//         fallback={
//           <div
//             style={{
//               position: "absolute",
//               top: "50%",
//               left: "50%",
//               transform: "translate(-50%, -50%)",
//               color: "#fff",
//               fontSize: "1.2rem",
//               zIndex: 10,
//             }}
//           >
//             Loading arduino...
//           </div>
//         }
//       >
//         <Canvas
//           ref={canvasRef}
//           camera={{ position: [0, 0, 10], fov: 50 }}
//           gl={{
//             preserveDrawingBuffer: true,
//             antialias: true,
//             powerPreference: "high-performance",
//             alpha: false,
//           }}
//         >
//           <ambientLight intensity={0.8} />
//           <directionalLight position={[10, 10, 5]} intensity={0.5} />
//           <SaturnModel />
//           <OrbitControls enableZoom={true} autoRotate />
//         </Canvas>
//       </Suspense>
//     </div>
//   );
// }


























import React, { Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

function SaturnModel() {
  const { scene } = useGLTF("/models/arduino_uno_low_poly.glb"); 
  const modelRef = React.useRef();

  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.002;
    }
  });

  return <primitive ref={modelRef} object={scene} scale={1} />;
}

export default function ThreeDModel() {
  const handleContextLost = (e) => {
    e.preventDefault();
    console.warn("🛑 WebGL context lost");
  };

  const handleContextRestored = () => {
    console.info("✅ WebGL context restored");
  };

  return (
    <div
      style={{
        height: "100vh", // Full page height
        width: "100vw",  // Full page width
        position: "relative",
        background: "#000",
        overflow: "hidden",
      }}
    >
      <Suspense
        fallback={
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: "#fff",
              fontSize: "1.2rem",
              zIndex: 10,
            }}
          >
            Loading Arduino...
          </div>
        }
      >
        <Canvas
          camera={{ position: [0, 0, 10], fov: 50 }}
          gl={{
            preserveDrawingBuffer: true,
            antialias: true,
            powerPreference: "high-performance",
            alpha: false,
          }}
          onCreated={({ gl }) => {
            const canvas = gl.domElement;
            canvas.addEventListener("webglcontextlost", handleContextLost, false);
            canvas.addEventListener("webglcontextrestored", handleContextRestored, false);
          }}
        >
          <ambientLight intensity={0.8} />
          <directionalLight position={[10, 10, 5]} intensity={0.5} />
          <SaturnModel />
          <OrbitControls enableZoom={true} autoRotate />
        </Canvas>
      </Suspense>
    </div>
  );
}
