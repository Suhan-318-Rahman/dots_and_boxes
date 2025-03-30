import { Player, Winner } from "../components/game";
import { BoxProps, LineProps } from "./utils";

const player1Color = "red";
const player2Color = "green";

const boxColorForPlayer1 = "#ff0000";
const boxColorForPlayer2 = "#32CD32";

const lineColorForPlayer1 = "#960000";
const lineColorForPlayer2 = "green";

const dotColor = "#A1AEB1";

const defaultBoxColor = "white";
const defaultLineColor = "#f7d9bc";

export function getBoxColor(box: BoxProps) {
    if (box.isCompleted) {
        return box.winner === "Player 1" ? boxColorForPlayer1 : boxColorForPlayer2;
    }
    return defaultBoxColor;
}

export function getLineColor(line: LineProps) {
    if (line.isClicked) {
        return line.clickedBy === "Player 1" ? lineColorForPlayer1 : lineColorForPlayer2;
    }
    return defaultLineColor;
}

export function getDotColor() {
    return dotColor;
}

export function getPlayerColor(player: Player) {
    return player === "Player 1" ? player1Color : player2Color;
}

export function getTurnIndicatorColor(winner: Winner, turn: Player) {
    return winner ? (winner === "tie" ? "black" : getPlayerColor(winner)) : getPlayerColor(turn);
}