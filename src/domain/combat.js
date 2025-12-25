import { distanceSquared } from './geometry';

export const AIState = {
    IDLE: 'IDLE',
    CHASE: 'CHASE',
    ATTACK: 'ATTACK',
    DEAD: 'DEAD'
};

const AGGRO_RADIUS = 8;
const ATTACK_RADIUS = 1.5;
const MOVE_SPEED = 2.5;

function randomDirection() {
    const theta = Math.random() * Math.PI * 2;
    return { x: Math.cos(theta), z: Math.sin(theta) };
}

/**
 * Pure function to determine next state and position of an enemy.
 * @param {Object} enemy - { id, x, z, state, hp, cd } (cd = cooldown)
 * @param {Object} playerPos - { x, z }
 * @param {number} dt 
 * @returns {Object} { ...enemy, x, z, state }
 */
export const updateEnemyBehavior = (enemy, playerPos, dt) => {
    if (enemy.hp <= 0) return { ...enemy, state: AIState.DEAD };

    // Calculate distance to player
    const distSq = distanceSquared({ x: enemy.x, z: enemy.z }, playerPos);

    // State Transitions
    let nextState = enemy.state;

    if (distSq < ATTACK_RADIUS * ATTACK_RADIUS) {
        nextState = AIState.ATTACK;
    } else if (distSq < AGGRO_RADIUS * AGGRO_RADIUS) {
        nextState = AIState.CHASE;
    } else {
        nextState = AIState.IDLE;
    }

    // Behavior Execution
    let { x, z } = enemy;

    if (nextState === AIState.CHASE) {
        // Move towards player
        const dx = playerPos.x - x;
        const dz = playerPos.z - z;
        const len = Math.sqrt(dx * dx + dz * dz);
        if (len > 0) {
            x += (dx / len) * MOVE_SPEED * dt;
            z += (dz / len) * MOVE_SPEED * dt;
        }
    }
    else if (nextState === AIState.IDLE) {
        // Simple random wander logic could go here, for now stay still or maintain logic
        // To keep it pure and stateless regarding "target wander point", we'll just have them static idle 
        // or we'd need to store "wanderTarget" in the enemy state.
    }

    return {
        ...enemy,
        x,
        z,
        state: nextState
    };
};

/**
 * Combat Resolution
 * @param {Object} player 
 * @param {Array} enemies 
 * @returns {Object} { hits: [{ enemyId, damage }], playerDamage: number }
 */
export const resolveCombat = (player, enemies, dt) => {
    // Player Auto-Attack
    // Find closest enemy
    let closest = null;
    let closestDist = Infinity;
    const RANGE = 4;

    enemies.forEach(e => {
        if (e.hp <= 0) return;
        const d = distanceSquared(player, { x: e.x, z: e.z });
        if (d < RANGE * RANGE && d < closestDist) {
            closestDist = d;
            closest = e;
        }
    });

    const hits = [];
    // Simple: Player hits closest enemy every tick (or we'd use a cooldown)
    // For arcade feel, continuous beam or rapid fire. Let's do huge DPS for satisfaction.
    if (closest) {
        hits.push({ enemyId: closest.id, damage: 10 * dt }); // 10 DPS
    }

    return { hits };
};
