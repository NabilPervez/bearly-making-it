import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../store';

const HUNTER_GATHER_RATE = 5.0; // Seconds per meat per hunter

export function WorkerSystem() {
    const timerRef = useRef(0);

    useFrame((state, delta) => {
        const { hunters } = useStore.getState().workers;
        if (hunters <= 0) return;

        timerRef.current += delta;

        // Logic: active idle
        // Every X seconds, add 1 meat * hunterCount
        if (timerRef.current >= HUNTER_GATHER_RATE) {
            timerRef.current = 0;
            const amount = hunters;
            // Hunters drop directly to Grill as per GDD interpretation for smoothness
            // Or "brings back meat" -> Inventory?
            // "hiring hunters go out and fight bears and bring back meat"
            // Let's dump to Grill for automation loop, or Inventory for player to act?
            // GDD: "brings meat to grill". 
            useStore.getState().addRawMeatToGrill(amount);
        }
    });

    return null;
}
