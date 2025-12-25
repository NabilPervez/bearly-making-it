import React, { useMemo } from 'react';
import { useStore } from '../store';
import { Html } from '@react-three/drei';

function HealthBar({ current, max }) {
    const pct = Math.max(0, current / max);
    return (
        <Html position={[0, 1.2, 0]} center style={{ pointerEvents: 'none', width: '60px' }}>
            <div className="h-1 bg-red-900/50 rounded overflow-hidden">
                <div className="h-full bg-red-500 transition-all duration-200" style={{ width: `${pct * 100}%` }}></div>
            </div>
        </Html>
    );
}

function Bear({ x, z, hp, maxHp, state }) {
    const isDead = state === 'DEAD';
    // Visual Pulse for "Hit" could go here if we tracked lastHitTime

    return (
        <group position={[x, 0.5, z]} visible={!isDead}>
            <mesh castShadow>
                {/* Bear Body */}
                <boxGeometry args={[1, 1, 1.5]} />
                <meshStandardMaterial color="#ffffff" />
            </mesh>
            {/* Bear Head */}
            <mesh position={[0, 0.4, 0.8]} castShadow>
                <boxGeometry args={[0.7, 0.6, 0.6]} />
                <meshStandardMaterial color="#ffffff" />
            </mesh>
            {/* Bear Legs */}
            <mesh position={[-0.4, -0.6, 0.5]}>
                <boxGeometry args={[0.3, 0.6, 0.3]} />
                <meshStandardMaterial color="#ffffff" />
            </mesh>
            <mesh position={[0.4, -0.6, 0.5]}>
                <boxGeometry args={[0.3, 0.6, 0.3]} />
                <meshStandardMaterial color="#ffffff" />
            </mesh>
            <mesh position={[-0.4, -0.6, -0.5]}>
                <boxGeometry args={[0.3, 0.6, 0.3]} />
                <meshStandardMaterial color="#ffffff" />
            </mesh>
            <mesh position={[0.4, -0.6, -0.5]}>
                <boxGeometry args={[0.3, 0.6, 0.3]} />
                <meshStandardMaterial color="#ffffff" />
            </mesh>

            <HealthBar current={hp} max={maxHp} />
        </group>
    );
}

// Optimization: We could use InstancedMesh for 100+ bears.
// For < 50 bears, mapping components is fine and easier to maintain state.
export function Enemies() {
    const enemies = useStore((state) => state.enemies);

    // We filter out dead for rendering, but usually we want death animation.
    // Simplifying: If dead, don't render. 
    // Ideally we'd keep them for a second to show a particle "Pop".

    return (
        <group>
            {enemies.map((enemy) => (
                <Bear
                    key={enemy.id}
                    {...enemy}
                />
            ))}
        </group>
    );
}
