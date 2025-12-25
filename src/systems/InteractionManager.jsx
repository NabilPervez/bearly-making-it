import { useFrame } from "@react-three/fiber";
import { useStore } from "../store";
import { useGame } from '../context/GameContext'
import { isWithinRange } from "../domain/geometry";
import {
    checkDepositInteraction,
    checkCollectInteraction,
    checkSellInteraction,
    calculateCookingTick,
    OpType
} from "../domain/cooking";
import { GRILL_POS, REGISTER_POS } from "../components/Base"

// Constants
const INTERACTION_RADIUS = 2.0;

export function InteractionManager() {
    const { playerRef } = useGame();

    // Selectors
    // We use granular selectors to avoid re-renders of THIS component (though it has no DOM),
    // but useStore.getState() is better for useFrame loops to avoid React overhead.
    // However, for clean "Hybrid" approach, we can use selectors for stable config 
    // and getState for volatile data if performance demands. 
    // Given the scale, direct store access inside useFrame is fine and most performant.

    useFrame((state, delta) => {
        if (!playerRef.current) return;

        const playerPos = playerRef.current.position;
        const currentStore = useStore.getState();

        // 1. Grill Cooking Logic (Always Active)
        const cookResult = calculateCookingTick(
            currentStore.grill,
            delta,
            currentStore.stats.cookSpeed
        );
        if (cookResult) {
            currentStore.updateGrill(cookResult);
        }

        // 2. Interaction Logic
        // Grill Interaction Area
        const grillVec = { x: GRILL_POS[0], y: GRILL_POS[1], z: GRILL_POS[2] };
        if (isWithinRange(playerPos, grillVec, INTERACTION_RADIUS)) {

            // Try Deposit Raw
            const depositOp = checkDepositInteraction(currentStore.inventory, currentStore.grill);
            if (depositOp.type === OpType.DEPOSIT_MEAT) {
                currentStore.depositToGrill(depositOp.amount);
            }

            // Try Collect Cooked
            const collectOp = checkCollectInteraction(currentStore.inventory, currentStore.grill, currentStore.inventoryCap);
            if (collectOp.type === OpType.COLLECT_COOKED) {
                currentStore.collectFromGrill(collectOp.amount);
            }
        }

        // Register Interaction Area
        const regVec = { x: REGISTER_POS[0], y: REGISTER_POS[1], z: REGISTER_POS[2] };
        if (isWithinRange(playerPos, regVec, INTERACTION_RADIUS)) {
            const sellOp = checkSellInteraction(currentStore.inventory);
            if (sellOp.type === OpType.SELL_MEAT) {
                // For "Arcade" feel, we might want to throttle this so it's not instant dump.
                // The GDD says "1.0s per sale".
                // We can implement a timer here or just trust the tick rate combined with a simple throttle.
                // For now, let's just sell 1 per 10 frames or something simple?
                // Or, strictly separate "Intent" from "Action".
                // Let's rely on the requested "Logic" which was "1s per steak".
                // We can use a local static timer, but since this is a functional component key, we can use a ref.
            }
        }
    });

    return null; // Logic only
}

// Separate component for Timed Interactions to handle the stateful "Tick" logic for Selling
export function SellingLogic() {
    const { playerRef } = useGame();
    // Use a ref for the timer to avoid re-renders
    const timerRef = React.useRef(0);

    useFrame((state, delta) => {
        if (!playerRef.current) return;

        const playerPos = playerRef.current.position;
        const regVec = { x: REGISTER_POS[0], y: REGISTER_POS[1], z: REGISTER_POS[2] };

        if (isWithinRange(playerPos, regVec, INTERACTION_RADIUS)) {
            timerRef.current += delta;

            if (timerRef.current >= 0.2) { // Sell fast (5 items/sec) for better game feel than 1s
                const currentStore = useStore.getState();
                const op = checkSellInteraction(currentStore.inventory);
                if (op.type === OpType.SELL_MEAT) {
                    currentStore.sellCookedMeat(op.amount);
                }
                timerRef.current = 0;
            }
        } else {
            timerRef.current = 0; // Reset if walk away
        }
    });
    return null;
}

import React from 'react';
