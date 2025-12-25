import { create } from 'zustand'
import { UpgradeType, getUpgradeCost, deriveStats } from './domain/upgrades'

const INITIAL_BASE_STATS = {
    speed: 5,
    damage: 10,
    cookSpeed: 1.0,
};

export const useStore = create((set, get) => ({
    // Economy
    cash: 50, // Start with some cash to test
    gems: 0,

    // Inventory
    inventory: {
        rawMeat: 0,
        cookedMeat: 0,
    },
    // Derived property, but we store it for direct access in UI/Logic. 
    // We update this via 'recalcStats'.
    inventoryCap: 5,

    // World Objects State
    grill: {
        rawMeat: 0,
        cookedMeat: 0,
        cookingProgress: 0,
        capacity: 3,
    },

    // Enemies State
    enemies: [],

    // Upgrades State
    upgradeLevels: {
        [UpgradeType.SPEED]: 0,
        [UpgradeType.DAMAGE]: 0,
        [UpgradeType.CAPACITY]: 0,
        [UpgradeType.COOK_SPEED]: 0,
        [UpgradeType.HIRE_HUNTER]: 0,
        [UpgradeType.HIRE_COOK]: 0
    },

    // Current Active Stats (Derived)
    stats: { ...INITIAL_BASE_STATS },

    // NPC Counts
    workers: {
        hunters: 0,
        cooks: 0
    },

    // --- Actions ---

    // Economy
    addCash: (amount) => set((state) => ({ cash: state.cash + amount })),

    // Inventory
    addRawMeat: (amount) => set((state) => {
        const currentTotal = state.inventory.rawMeat + state.inventory.cookedMeat
        if (currentTotal >= state.inventoryCap) return {}
        return { inventory: { ...state.inventory, rawMeat: state.inventory.rawMeat + amount } }
    }),

    // Manual "Force Add" for Hunters (Bypass Cap or separate?)
    // GDD: "brings meat to grill". So Hunters target Grill directly.
    addRawMeatToGrill: (amount) => set((state) => {
        // Simple logic: if grill full, lost? Or overflow?
        // Let's allow overflow for satisfaction or cap it. Cap it for now.
        if (state.grill.rawMeat >= state.grill.capacity) return {};
        return {
            grill: { ...state.grill, rawMeat: state.grill.rawMeat + amount }
        }
    }),

    // Grill Interaction: DEPOSIT
    depositToGrill: (amount) => set((state) => {
        return {
            inventory: {
                ...state.inventory,
                rawMeat: state.inventory.rawMeat - amount
            },
            grill: {
                ...state.grill,
                rawMeat: state.grill.rawMeat + amount
            }
        }
    }),

    // Grill Interaction: COLLECT
    collectFromGrill: (amount) => set((state) => {
        return {
            inventory: {
                ...state.inventory,
                cookedMeat: state.inventory.cookedMeat + amount
            },
            grill: {
                ...state.grill,
                cookedMeat: state.grill.cookedMeat - amount
            }
        }
    }),

    // Grill Process: UPDATE (Tick)
    updateGrill: (newGrillState) => set({ grill: newGrillState }),

    // Register Interaction: SELL
    sellCookedMeat: (amount) => set((state) => ({
        inventory: {
            ...state.inventory,
            cookedMeat: state.inventory.cookedMeat - amount
        },
        cash: state.cash + (amount * 10)
    })),

    // Death
    die: () => set((state) => ({
        inventory: { rawMeat: 0, cookedMeat: 0 }
    })),

    // Enemy Actions
    spawnEnemy: (enemy) => set((state) => ({
        enemies: [...state.enemies, enemy]
    })),

    updateEnemies: (newEnemies) => set({ enemies: newEnemies }),

    applyDamage: (hits) => set((state) => {
        if (!hits.length) return {};
        const newEnemies = state.enemies.map(e => {
            const hit = hits.find(h => h.enemyId === e.id);
            if (hit) {
                return { ...e, hp: e.hp - hit.damage };
            }
            return e;
        });
        return { enemies: newEnemies };
    }),

    // --- Upgrade Actions ---
    buyUpgrade: (type) => set((state) => {
        const currentLevel = state.upgradeLevels[type];
        const cost = getUpgradeCost(type, currentLevel);

        if (state.cash < cost) return {};

        const newLevels = { ...state.upgradeLevels, [type]: currentLevel + 1 };

        // Recalculate derived stats
        const newStats = deriveStats(INITIAL_BASE_STATS, newLevels);

        return {
            cash: state.cash - cost,
            upgradeLevels: newLevels,
            stats: newStats,
            inventoryCap: newStats.inventoryCap,
            workers: {
                hunters: newStats.hunterCount,
                cooks: newStats.cookCount
            }
        };
    })
}))
