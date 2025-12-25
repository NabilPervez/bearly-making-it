import { Html } from "@react-three/drei";
import { useStore } from "../store";
import { UpgradeType, getUpgradeCost, getUpgradeConfig } from "../domain/upgrades";

const UPGRADE_POS = [0, 0.5, -6]; // North side of base

function UpgradeCard({ type, level, cash, onBuy }) {
    const config = getUpgradeConfig(type);
    const cost = getUpgradeCost(type, level);
    const canAfford = cash >= cost;

    // Separate visuals if MAX level later on
    return (
        <div
            className={`
                flex flex-col items-center bg-white p-2 rounded-lg border-2 shadow-md w-32 cursor-pointer 
                transition-transform hover:scale-105 active:scale-95
                ${canAfford ? 'border-green-600' : 'border-gray-400 opacity-70'}
            `}
            onClick={() => canAfford && onBuy(type)}
        >
            <div className="font-bold text-xs text-center mb-1">{config.name}</div>
            <div className="text-[10px] text-gray-500 mb-1">Lvl {level}</div>
            <button
                className={`
                    text-xs px-2 py-1 rounded text-white font-bold w-full
                    ${canAfford ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}
                `}
                disabled={!canAfford}
            >
                ${cost}
            </button>
        </div>
    );
}

export const UPGRADE_AREA_POS = UPGRADE_POS;

export function UpgradeStation({ isOpen }) {
    // We only access store inside the Component for the UI
    const cash = useStore((state) => state.cash);
    const levels = useStore((state) => state.upgradeLevels);
    const buy = useStore((state) => state.buyUpgrade);

    return (
        <group position={UPGRADE_POS}>
            {/* Visual Physical Desk */}
            <mesh castShadow receiveShadow>
                <boxGeometry args={[3, 1, 1]} />
                <meshStandardMaterial color="#4ade80" /> {/* Green Desk */}
            </mesh>
            <Html position={[0, 1.5, 0]} center>
                <div className="bg-black/50 text-white text-xs px-2 py-1 rounded-full font-bold whitespace-nowrap">
                    Management Desk
                </div>
            </Html>

            {/* Popup UI - Only visible when "isOpen" prop passed from InteractionManager 
                OR we manage "isOpen" locally if we used a raycast click.
                For GDD "Stand on pad", we need parent to tell us.
                Actually, simpler: InteractionManager sets a global "isShopping" state?
                Or we just render this always but hidden?
                Let's use a local Interaction check or pass it down.
                For this iteration, I'll make the UI appearing logic inside InteractionManager, 
                and this component just holds the 3D mesh.
                Wait, I'll put the HTML UI here but control visibility via prop for cleanliness.
            */}
            {isOpen && (
                <Html position={[0, 4, 0]} center zIndexRange={[500, 0]}>
                    <div className="bg-white/90 p-4 rounded-xl shadow-xl border-4 border-slate-800 grid grid-cols-3 gap-2 w-[450px]">
                        {Object.values(UpgradeType).map(type => (
                            <UpgradeCard
                                key={type}
                                type={type}
                                level={levels[type]}
                                cash={cash}
                                onBuy={buy}
                            />
                        ))}
                    </div>
                </Html>
            )}
        </group>
    );
}
