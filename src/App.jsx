import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import './index.css'
import { Player } from './components/Player'
import { Base } from './components/Base'
import { Enemies } from './components/Enemies'
import { InteractionManager, SellingLogic } from './systems/InteractionManager'
import { EnemySystem } from './systems/EnemySystem'
import { GameProvider } from './context/GameContext'
import { useStore } from './store'

// Wrapper to bridge non-Canvas state with Canvas children
function GameCanvas() {
  return (
    <Canvas camera={{ position: [5, 5, 5], fov: 50 }} shadows>
      <GameProvider>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />

        <Player />
        <Base />
        <Enemies />

        {/* Logic Systems */}
        <InteractionManager />
        <SellingLogic />
        <EnemySystem />

        <gridHelper args={[50, 50, 0xffffff, 0xaaaaaa]} position={[0, -0.01, 0]} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#cceff9" />
        </mesh>
      </GameProvider>
    </Canvas>
  )
}

function App() {
  const cash = useStore((state) => state.cash)
  const gems = useStore((state) => state.gems)
  const inventory = useStore((state) => state.inventory)
  const cap = useStore((state) => state.inventoryCap)

  return (
    <div className="relative w-full h-screen bg-sky-100 overflow-hidden">
      {/* HUD Layer */}
      <div className="absolute top-0 left-0 z-10 p-4 w-full flex justify-between pointer-events-none">
        <div className="flex flex-col gap-2">
          <div className="bg-white/80 backdrop-blur opacity-90 p-2 rounded-lg shadow-lg border-2 border-slate-800">
            <h1 className="text-xl font-bold text-slate-800">Bearly Making It</h1>
            <div className="text-xs text-slate-600 font-mono">Build 0.0.4</div>
          </div>
          <div className="bg-red-100/80 backdrop-blur p-2 rounded-lg shadow border-2 border-red-800 w-48">
            <div className="text-xs font-bold text-red-800 mb-1">Health</div>
            <div className="h-2 bg-red-200 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 w-[100%]"></div>
            </div>
          </div>
          {/* Inventory HUD */}
          <div className="bg-orange-100/80 backdrop-blur p-2 rounded-lg shadow border-2 border-orange-800 w-48">
            <div className="text-xs font-bold text-orange-900 mb-1">Inventory ({inventory.rawMeat + inventory.cookedMeat}/{cap})</div>
            <div className="flex gap-2 text-xs">
              <div>🥩 Raw: {inventory.rawMeat}</div>
              <div>🍗 Cooked: {inventory.cookedMeat}</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 items-end">
          <div className="bg-yellow-100/90 backdrop-blur p-2 rounded-lg shadow border-2 border-yellow-700 font-bold text-yellow-900 flex items-center gap-2">
            <span>💰</span> <span>${cash}</span>
          </div>
          <div className="bg-blue-100/90 backdrop-blur p-2 rounded-lg shadow border-2 border-blue-700 font-bold text-blue-900 flex items-center gap-2">
            <span>💎</span> <span>{gems}</span>
          </div>
        </div>
      </div>

      <GameCanvas />
    </div>
  )
}

export default App
