/**
 * Pure domain logic for Grill and Economy interactions.
 * Returns descriptions of state changes, not the changes themselves.
 */

/* ---------------- ALGEBRA ---------------- */

// Types of operations we can perform
export const OpType = {
    NONE: 'NONE',
    DEPOSIT_MEAT: 'DEPOSIT_MEAT',
    COLLECT_COOKED: 'COLLECT_COOKED',
    SELL_MEAT: 'SELL_MEAT'
};

/* ---------------- PURE FUNCTIONS ---------------- */

/**
 * Determines the interaction between Player and Grill for Reacting/Depositing.
 * @param {Object} playerInv - { rawMeat: number }
 * @param {Object} grillState - { rawMeat: number, capacity: number }
 * @returns {Object} Operation description
 */
export const checkDepositInteraction = (playerInv, grillState) => {
    if (playerInv.rawMeat <= 0) return { type: OpType.NONE };
    if (grillState.rawMeat >= grillState.capacity) return { type: OpType.NONE };

    // Calculate transfer amount
    const spaceLeft = grillState.capacity - grillState.rawMeat;
    const amountToTransfer = Math.min(playerInv.rawMeat, spaceLeft);

    return {
        type: OpType.DEPOSIT_MEAT,
        amount: amountToTransfer
    };
};

/**
 * Determines the interaction for collecting cooked meat.
 * @param {Object} playerInv - { cookedMeat: number }
 * @param {Object} grillState - { cookedMeat: number }
 * @param {number} playerCap - Max inventory size
 * @returns {Object} Operation description
 */
export const checkCollectInteraction = (playerInv, grillState, playerCap) => {
    if (grillState.cookedMeat <= 0) return { type: OpType.NONE };

    const currentTotal = playerInv.rawMeat + playerInv.cookedMeat;
    if (currentTotal >= playerCap) return { type: OpType.NONE };

    const spaceLeft = playerCap - currentTotal;
    const amountToTransfer = Math.min(grillState.cookedMeat, spaceLeft);

    return {
        type: OpType.COLLECT_COOKED,
        amount: amountToTransfer
    };
};

/**
 * Logic for a single tick of cooking.
 * @param {Object} grillState - { rawMeat, cookedMeat, cookingProgress }
 * @param {number} dt - Delta time in seconds
 * @param {number} cookSpeed - Seconds required to cook ONE steak
 * @returns {Object} New Grill State description (or null if no change)
 */
export const calculateCookingTick = (grillState, dt, cookSpeed) => {
    if (grillState.rawMeat <= 0) return null; // Nothing to cook

    const newProgress = grillState.cookingProgress + dt;

    // Check if cooking cycle complete
    if (newProgress >= cookSpeed) {
        // Cooked one item
        return {
            rawMeat: grillState.rawMeat - 1,
            cookedMeat: grillState.cookedMeat + 1,
            cookingProgress: 0 // Reset progress for next item
        };
    }

    return {
        ...grillState,
        cookingProgress: newProgress
    };
};

/**
 * Logic for converting cooked meat to cash.
 * @param {Object} playerInv 
 * @returns {Object} Operation
 */
export const checkSellInteraction = (playerInv) => {
    if (playerInv.cookedMeat <= 0) return { type: OpType.NONE };

    return {
        type: OpType.SELL_MEAT,
        amount: 1, // Sell 1 per tick usually, or all? GDD says "Each steak sold in 1 second"
        // To keep it simple, we'll emit a "Sell" op, and let the interpreter decide timing or batch.
        // GDD: "sold in 1 second" implies a process. 
        // For MVP "Arcade" feel, instant dump is often better, 
        // but let's stick to GDD: "when a cooked steak is sold 1 dollar is dropped".
        // We will treat this as a fast tick.
    };
};
