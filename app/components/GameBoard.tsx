"use client";
import { Stage, Layer } from "react-konva";
import {
  BoxProps,
  getAllPoints,
  getAllLines,
  getAllBoxes,
  LineProps,
  PointProps,
  isBoxMake,
  getAdjecentLine,
} from "../utils/utils";
import { useEffect } from "react";
import Dots from "./Dots";
import ClickableLines from "./ClickableLines";
import Boxes from "./Boxes";
import { computerMoveLevel1, computerMoveLevel2 } from "../game/GameLogic";
import { Player, Winner } from "./game";
import useStorage from "../hooks/useStorage";
import { GameConfig } from "../page";

const size = 6;
const gap = 65;
const rad = 15;

export default function GameBoard({
  turn,
  setTurn,
  setPlayer1Score,
  setPlayer2Score,
  setWinner,
  gameConfig,
}: {
  turn: Player;
  setTurn: (turn: Player) => void;
  setPlayer1Score: (player1Score: number) => void;
  setPlayer2Score: (player2Score: number) => void;
  setWinner: (winner: Winner) => void;
  gameConfig: GameConfig;
}) {
  const [lineMap, setLineMap] = useStorage<Map<string, LineProps>>(
    "lineMap",
    () => getAllLines(size)
  );

  const [boxMap, setBoxMap] = useStorage<Map<string, BoxProps>>("boxMap", () =>
    getAllBoxes(size)
  );

  const pointMap = getAllPoints(size);

  useEffect(() => {
    const newPlayer1Score = Array.from(boxMap.values()).filter(
      (box) => box.winner === "Player 1"
    ).length;
    const newPlayer2Score = Array.from(boxMap.values()).filter(
      (box) => box.winner === "Player 2"
    ).length;
    setPlayer1Score(newPlayer1Score);
    setPlayer2Score(newPlayer2Score);

    const allBoxesCompleted = Array.from(boxMap.values()).every(
      (box) => box.isCompleted
    );
    if (allBoxesCompleted) {
      if (newPlayer1Score > newPlayer2Score) {
        setWinner("Player 1");
      } else if (newPlayer2Score > newPlayer1Score) {
        setWinner("Player 2");
      } else {
        setWinner("tie");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boxMap]);

  useEffect(() => {
    const newBoxMap = new Map(boxMap);

    boxMap.forEach((box) => {
      if (box.isCompleted) {
        return;
      }
      const lines = [box.lineTop, box.lineBottom, box.lineLeft, box.lineRight]
        .map((l) => lineMap?.get(l.key))
        .filter((l): l is LineProps => l !== undefined);

      if (lines.every((l) => l?.isClicked)) {
        box.isCompleted = true;
        lines.sort(
          (a, b) =>
            (b.clickedAt ? b.clickedAt.getTime() : 0) -
            (a.clickedAt ? a.clickedAt.getTime() : 0)
        );
        box.winner = lines[0].clickedBy!;
        newBoxMap.set(box.key, box);
      }
    });

    setBoxMap(newBoxMap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineMap]);

  useEffect(() => {
    if (turn === "Player 2" && gameConfig.gameMode === "Player vs Computer") {
      setTimeout(() => {
        if (gameConfig.level === "Level 1") {
          computerMoveLevel1(boxMap, lineMap, handleLineClick);
        } else if (gameConfig.level === "Level 2") {
          computerMoveLevel2(boxMap, lineMap, handleLineClick);
        }
      }, 3000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineMap]);

  const handleLineClick = (line: LineProps) => {
    const newLine = {
      ...line,
      isClicked: true,
      clickedBy: turn,
      clickedAt: new Date(),
    };
    if (!line.isClicked) {
      setLineMap((prev: Map<string, LineProps>) => {
        prev.set(line.key, newLine);
        return new Map(prev);
      });
      if (!isBoxMake(line, boxMap, lineMap)) {
        setTurn(turn === "Player 1" ? "Player 2" : "Player 1");
      }
    }
  };

  const handlePointClick = (point: PointProps) => {
    const lines = getAdjecentLine(point, lineMap);

    if (lines.length === 1 && lines[0] !== undefined) {
      handleLineClick(lines[0]);
    }
  };

  const handleBoxClick = (box: BoxProps) => {
    const lines = [box.lineTop, box.lineBottom, box.lineLeft, box.lineRight]
      .map((l) => lineMap.get(l.key))
      .filter((l) => l?.isClicked === false);

    if (lines.length === 1 && lines[0] !== undefined) {
      handleLineClick(lines[0]);
    }
  };

  return (
    <div className="game-board">
      <Stage width={400} height={400}>
        <Layer>
          <Boxes
            boxMap={boxMap}
            gap={gap}
            rad={rad}
            handleBoxClick={handleBoxClick}
          />
          <ClickableLines
            gap={gap}
            rad={rad}
            lineMap={lineMap}
            turn={turn}
            gameConfig={gameConfig}
            handleLineClick={handleLineClick}
          />
          <Dots
            pointMap={pointMap}
            gap={gap}
            rad={rad}
            handlePointClick={handlePointClick}
          />
        </Layer>
      </Stage>
    </div>
  );
}
