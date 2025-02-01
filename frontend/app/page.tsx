import GameProvider from "@/context/GameContext";
import GamePlay from "./gamelist";
import { Toaster } from 'react-hot-toast';

export default function HomePage() {

    return (<>
        <GameProvider>
            <Toaster/>
            <GamePlay/>
        </GameProvider>
    </>)
}
