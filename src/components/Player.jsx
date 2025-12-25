import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import { useKeyboardControls } from '../hooks/useKeyboardControls'
import { useStore } from '../store'
import { useGame } from '../context/GameContext'

export function Player() {
    const meshRef = useRef()
    const controls = useKeyboardControls()
    const { camera } = useThree()
    const speed = useStore((state) => state.stats.speed)
    const { playerRef } = useGame() // Get the shared ref container

    // Sync local ref to context ref
    useEffect(() => {
        if (playerRef) playerRef.current = meshRef.current;
    }, [playerRef])

    useFrame((state, delta) => {
        if (!meshRef.current) return

        const { forward, backward, left, right } = controls

        // Movement Logic
        const direction = new Vector3()
        if (forward) direction.z -= 1
        if (backward) direction.z += 1
        if (left) direction.x -= 1
        if (right) direction.x += 1

        if (direction.length() > 0) {
            direction.normalize().multiplyScalar(speed * delta)
            meshRef.current.position.add(direction)

            // Rotation (Face direction)
            const targetRotation = Math.atan2(direction.x, direction.z)
            meshRef.current.rotation.y = targetRotation
        }

        // Camera Follow Logic (Smooth)
        const targetPos = meshRef.current.position.clone()
        targetPos.y += 10 // Isometric height
        targetPos.z += 10 // Isometric offset

        // Smooth damp camera position
        camera.position.lerp(targetPos, 0.1)
        camera.lookAt(meshRef.current.position)
    })

    return (
        <mesh ref={meshRef} position={[0, 0.5, 0]} castShadow receiveShadow>
            {/* Boxy Lumberjack Body */}
            <boxGeometry args={[0.8, 1.5, 0.8]} />
            <meshStandardMaterial color="#8B4513" /> {/* Brown Jacket */}

            {/* Hat */}
            <mesh position={[0, 0.8, -0.2]}>
                <boxGeometry args={[0.6, 0.4, 0.6]} />
                <meshStandardMaterial color="red" />
            </mesh>
        </mesh>
    )
}
