/**
 * Pure domain logic for geometric calculations.
 */

/**
 * Calculates the squared distance between two points (optimizes out square root).
 * @param {Object} p1 - {x, y, z}
 * @param {Object} p2 - {x, y, z}
 * @returns {number} distance squared
 */
export const distanceSquared = (p1, p2) => {
    const dx = p1.x - p2.x;
    const dz = p1.z - p2.z; // We mostly care about horizontal distance in this top-down game
    return dx * dx + dz * dz;
};

/**
 * Checks if two points are within a certain radius.
 * @param {Object} p1 
 * @param {Object} p2 
 * @param {number} radius 
 * @returns {boolean}
 */
export const isWithinRange = (p1, p2, radius) => {
    if (!p1 || !p2) return false;
    return distanceSquared(p1, p2) <= radius * radius;
};
