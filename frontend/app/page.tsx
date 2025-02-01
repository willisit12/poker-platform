import GameProvider from "@/context/GameContext";
import GamePlay from "./gamelist";

export default function HomePage() {

    return (<>
        <GameProvider>
            <h1>GAME</h1>
            <GamePlay/>
        </GameProvider>
    </>)
}
