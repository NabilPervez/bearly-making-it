import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../store';
import { useGame } from '../context/GameContext';
import { updateEnemyBehavior, resolveCombat, AIState } from '../domain/combat';

const MAX_ENEMIES = 5;
const SPAWN_INTERVAL = 3.0; // Seconds

export function EnemySystem() {
    const { playerRef } = useGame();
    const spawnTimer = useRef(0);
    const idCounter = useRef(1);

    useFrame((state, delta) => {
        if (!playerRef.current) return;

        const playerPos = playerRef.current.position;
        const currentStore = useStore.getState();
        const { enemies, stats } = currentStore;

        // 1. Spawning Logic
        spawnTimer.current += delta;
        if (spawnTimer.current >= SPAWN_INTERVAL && enemies.length < MAX_ENEMIES) {
            spawnTimer.current = 0;

            // Spawn logic: Pick a random spot outside base
            // Base is center (0,0) radius ~5
            const angle = Math.random() * Math.PI * 2;
            const dist = 10 + Math.random() * 5; // 10-15 units away

            currentStore.spawnEnemy({
                id: idCounter.current++,
                x: Math.cos(angle) * dist,
                z: Math.sin(angle) * dist,
                hp: 100,
                maxHp: 100,
                state: AIState.IDLE,
                cd: 0
            });
        }

        // 2. AI Update Loop
        let activeEnemies = [];
        let needsUpdate = false;

        // We will process updates batch-style
        const updatedEnemies = enemies.map(enemy => {
            const updated = updateEnemyBehavior(enemy, playerPos, delta);

            // Handle Death Drop
            if (updated.state === AIState.DEAD && enemy.state !== AIState.DEAD) {
                // First frame of death
                // Drop loot
                // Purely we should return an "Op" but for now we call action
                currentStore.addRawMeat(1); // Auto-collect for arcade flow? 
                // GDD says: "Bear dies -> leaves behind a meat steak -> player can collect"
                // For now, let's Auto-Collect to keep flow fast, or we need to spawn a "Loot" object.
                // Let's spawn "Loot" implicitly by just giving it to player to save implementing LootSystem for now.
            }

            // Keep only if alive (or recently dead for animation - skipped for now)
            return updated;
        }).filter(e => e.state !== AIState.DEAD);

        // If count changed or positions changed significantly, update store.
        // For smooth movement in React, this causes re-renders.
        // Optimization: In a real heavy game, we'd use Refs for Position and Store for Logic.
        // For < 10 enemies, 60fps React render with simple boxes is surprisingly fine.
        if (updatedEnemies.length !== enemies.length || updatedEnemies.some((e, i) => e.x !== enemies[i].x || e.z !== enemies[i].z)) {
            currentStore.updateEnemies(updatedEnemies);
        }

        // 3. Combat Logic
        // Player damaging Enemies
        const combatResult = resolveCombat(playerPos, updatedEnemies, delta);
        if (combatResult.hits.length > 0) {
            currentStore.applyDamage(combatResult.hits);
        }
    });

    return null;
}
