import { create } from 'zustand'

export const useStore = create((set) => ({
    // Economy
    cash: 0,
    gems: 0,

    // Inventory
    inventory: {
        rawMeat: 0,
        cookedMeat: 0,
    },
    inventoryCap: 5,

    // World Objects State
    grill: {
        rawMeat: 0,
        cookedMeat: 0,
        cookingProgress: 0,
        capacity: 3,
    },

    // Enemies State
    // Format: { id: number, x: number, z: number, hp: number, maxHp: number, state: 'IDLE'|'CHASE'|'ATTACK'|'DEAD' }
    enemies: [],

    // Upgrades / Stats
    stats: {
        speed: 5,
        damage: 10,
        cookSpeed: 1.0,
    },

    // --- Actions (Effectuators) ---

    // Economy
    addCash: (amount) => set((state) => ({ cash: state.cash + amount })),

    // Inventory
    addRawMeat: (amount) => set((state) => {
        const currentTotal = state.inventory.rawMeat + state.inventory.cookedMeat
        if (currentTotal >= state.inventoryCap) return {}
        return { inventory: { ...state.inventory, rawMeat: state.inventory.rawMeat + amount } }
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

    // --- Enemy Actions ---
    spawnEnemy: (enemy) => set((state) => ({
        enemies: [...state.enemies, enemy]
    })),

    updateEnemies: (newEnemies) => set({ enemies: newEnemies }),

    removeEnemy: (id) => set((state) => ({
        enemies: state.enemies.filter(e => e.id !== id)
    })),

    // Bulk damage application
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
    })
}))
