import { useRef, useLayoutEffect, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { useStore } from '../store'

// Helper to visualize progress
function ProgressBar({ progress, label }) {
    return (
        <Html position={[0, 1.5, 0]} center style={{ pointerEvents: 'none', width: '80px' }}>
            <div className="bg-black/50 p-1 rounded backdrop-blur-sm">
                {label && <div className="text-[10px] text-white text-center font-bold mb-1">{label}</div>}
                <div className="h-1 bg-gray-600 rounded overflow-hidden">
                    <div className="h-full bg-green-400" style={{ width: `${progress * 100}%` }}></div>
                </div>
            </div>
        </Html>
    )
}

function ItemCounter({ icon, count, color = "text-white" }) {
    if (count <= 0) return null;
    return (
        <Html position={[0, 2, 0]} center zIndexRange={[100, 0]}>
            <div className={`text-sm font-bold ${color} flex gap-1 shadow-black drop-shadow-md`}>
                <span>{icon}</span>
                <span>{count}</span>
            </div>
        </Html>
    )
}

export const GRILL_POS = [-3, 0.5, -3];
export const REGISTER_POS = [3, 0.5, 3];

export function Base() {
    const grillState = useStore((state) => state.grill);
    const cookSpeed = useStore((state) => state.stats.cookSpeed);

    return (
        <group>
            {/* Base Floor (Safe Zone) */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
                <planeGeometry args={[10, 10]} />
                <meshStandardMaterial color="#333333" />
            </mesh>

            {/* Grill Area - Top Left */}
            <group position={GRILL_POS}>
                <mesh castShadow>
                    <boxGeometry args={[2, 1, 1]} />
                    <meshStandardMaterial color="#1a1a1a" />
                </mesh>
                <mesh position={[0, 0.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[1.8, 0.8]} />
                    <meshStandardMaterial color="#333" />
                </mesh>

                {/* Dynamic Feedback */}
                {grillState.rawMeat > 0 && (
                    <ProgressBar progress={grillState.cookingProgress / cookSpeed} label="Cooking" />
                )}

                <ItemCounter icon="🥩" count={grillState.rawMeat} />
                {grillState.cookedMeat > 0 && (
                    <group position={[0.5, 0, 0.5]}>
                        <ItemCounter icon="🍗" count={grillState.cookedMeat} color="text-orange-400" />
                    </group>
                )}
            </group>

            {/* Register Area - Bottom Right */}
            <group position={REGISTER_POS}>
                <mesh castShadow>
                    <boxGeometry args={[1, 1.2, 1]} />
                    <meshStandardMaterial color="gold" />
                </mesh>
                <Html position={[0, 1.5, 0]} center>
                    <div className="bg-black/40 text-white text-xs px-2 py-1 rounded-full font-bold">Sell Here</div>
                </Html>
            </group>
        </group>
    )
}
