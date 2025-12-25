import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useState } from 'react'
import './index.css'

function Box(props) {
  const [hovered, setHover] = useState(false)
  const [active, setActive] = useState(false)
  return (
    <mesh
      {...props}
      scale={active ? 1.5 : 1}
      onClick={() => setActive(!active)}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  )
}

function App() {
  return (
    <div className="relative w-full h-screen bg-sky-100 overflow-hidden">
      {/* HUD Layer */}
      <div className="absolute top-0 left-0 z-10 p-4 w-full flex justify-between pointer-events-none">
        <div className="flex flex-col gap-2">
          <div className="bg-white/80 backdrop-blur opacity-90 p-2 rounded-lg shadow-lg border-2 border-slate-800">
            <h1 className="text-xl font-bold text-slate-800">Bearly Making It</h1>
            <div className="text-xs text-slate-600 font-mono">Build 0.0.1</div>
          </div>
          <div className="bg-red-100/80 backdrop-blur p-2 rounded-lg shadow border-2 border-red-800 w-48">
            <div className="text-xs font-bold text-red-800 mb-1">Health</div>
            <div className="h-2 bg-red-200 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 w-[80%]"></div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 items-end">
          <div className="bg-yellow-100/90 backdrop-blur p-2 rounded-lg shadow border-2 border-yellow-700 font-bold text-yellow-900 flex items-center gap-2">
            <span>💰</span> <span>$1,250</span>
          </div>
          <div className="bg-blue-100/90 backdrop-blur p-2 rounded-lg shadow border-2 border-blue-700 font-bold text-blue-900 flex items-center gap-2">
            <span>💎</span> <span>50</span>
          </div>
        </div>
      </div>

      {/* 3D Scene */}
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }} shadows>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <Box position={[-1.2, 0, 0]} />
        <Box position={[1.2, 0, 0]} />
        <gridHelper args={[20, 20, 0xffffff, 0xaaaaaa]} position={[0, -0.5, 0]} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#cceff9" />
        </mesh>
        <OrbitControls makeDefault />
      </Canvas>
    </div>
  )
}

export default App
