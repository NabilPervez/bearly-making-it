import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../store';

function Worker({ position, color, role }) {
    return (
        <group position={position}>
            <mesh castShadow>
                <boxGeometry args={[0.6, 1.2, 0.6]} />
                <meshStandardMaterial color={color} />
            </mesh>
            <mesh position={[0, 0.7, 0.2]}>
                <boxGeometry args={[0.4, 0.3, 0.2]} />
                <meshStandardMaterial color={color} />
            </mesh>
            {/* Hat to distinguish */}
            <mesh position={[0, 0.7, 0]}>
                <boxGeometry args={[0.7, 0.2, 0.7]} />
                <meshStandardMaterial color="white" />
            </mesh>
        </group>
    );
}

export function Workers() {
    // Current counts
    const { hunters, cooks } = useStore((state) => state.workers);

    // Generate static positions or dynamic?
    // For MVP, Cooks stand around Grill. Hunters stand around Edge or wander.
    // Let's just place them statically for "Visuals" first.

    const cookPositions = Array.from({ length: cooks }).map((_, i) => [
        -4 - (i * 0.8), 0.6, -3
    ]);

    const hunterPositions = Array.from({ length: hunters }).map((_, i) => [
        -2 + (i * 1.5), 0.6, 2 // Just inside base for now, or near exit
    ]);

    return (
        <group>
            {cookPositions.map((pos, i) => (
                <Worker key={`cook-${i}`} position={pos} color="#fcd34d" role="Cook" />
            ))}
            {hunterPositions.map((pos, i) => (
                <Worker key={`hunter-${i}`} position={pos} color="#16a34a" role="Hunter" />
            ))}
        </group>
    );
}
