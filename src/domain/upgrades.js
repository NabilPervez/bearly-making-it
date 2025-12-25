export const UpgradeType = {
    SPEED: 'SPEED',
    DAMAGE: 'DAMAGE',
    CAPACITY: 'CAPACITY',
    COOK_SPEED: 'COOK_SPEED',
    HIRE_HUNTER: 'HIRE_HUNTER',
    HIRE_COOK: 'HIRE_COOK'
};

const UPGRADE_CONFIG = {
    [UpgradeType.SPEED]: { baseCost: 50, growth: 1.5, name: "Movement Speed" },
    [UpgradeType.DAMAGE]: { baseCost: 100, growth: 1.6, name: "Attack Damage" },
    [UpgradeType.CAPACITY]: { baseCost: 75, growth: 1.4, name: "Backpack Size" },
    [UpgradeType.COOK_SPEED]: { baseCost: 150, growth: 1.8, name: "Grill Speed" },
    [UpgradeType.HIRE_HUNTER]: { baseCost: 500, growth: 2.0, name: "Hire Hunter" },
    [UpgradeType.HIRE_COOK]: { baseCost: 300, growth: 2.0, name: "Hire Cook" }
};

export const getUpgradeCost = (type, currentLevel) => {
    const config = UPGRADE_CONFIG[type];
    if (!config) return Infinity;
    return Math.floor(config.baseCost * Math.pow(config.growth, currentLevel));
};

export const getUpgradeConfig = (type) => UPGRADE_CONFIG[type];

/**
 * Calculates new stats based on upgrade levels.
 * Pure function to derive stats from state.
 */
export const deriveStats = (baseStats, currentLevels) => {
    return {
        speed: baseStats.speed + (currentLevels[UpgradeType.SPEED] * 0.5),
        damage: baseStats.damage + (currentLevels[UpgradeType.DAMAGE] * 5),
        inventoryCap: 5 + (currentLevels[UpgradeType.CAPACITY] * 2), // Base 5
        cookSpeed: Math.max(0.1, baseStats.cookSpeed * Math.pow(0.9, currentLevels[UpgradeType.COOK_SPEED])), // 10% faster per level
        hunterCount: currentLevels[UpgradeType.HIRE_HUNTER],
        cookCount: currentLevels[UpgradeType.HIRE_COOK]
    };
};
