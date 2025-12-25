import React, { createContext, useContext, useRef } from 'react';

const GameContext = createContext(null);

export function GameProvider({ children }) {
    const playerRef = useRef(null);

    // We can add other singleton refs here (like Camera, or specialized systems)

    return (
        <GameContext.Provider value={{ playerRef }}>
            {children}
        </GameContext.Provider>
    );
}

export function useGame() {
    return useContext(GameContext);
}
