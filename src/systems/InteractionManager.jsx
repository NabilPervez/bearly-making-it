import React, { useRef, useState } from 'react';
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
import { UPGRADE_AREA_POS } from "../components/UpgradeStation"

// Constants
const INTERACTION_RADIUS = 2.0;

export function InteractionManager({ onUpgradeShoppingChange }) {
    const { playerRef } = useGame();

    // We use a local state to debounce/throttle UI updates for Shopping
    // But since this is inside useFrame, we shouldn't setState heavily.
    // Instead we check if the value CHANGED before calling the callback.
    const wasShoppingRef = useRef(false);

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

        // 3. Upgrade Station Detection
        const upgVec = { x: UPGRADE_AREA_POS[0], y: UPGRADE_AREA_POS[1], z: UPGRADE_AREA_POS[2] };
        const isShopping = isWithinRange(playerPos, upgVec, INTERACTION_RADIUS);

        if (isShopping !== wasShoppingRef.current) {
            wasShoppingRef.current = isShopping;
            onUpgradeShoppingChange(isShopping);
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
