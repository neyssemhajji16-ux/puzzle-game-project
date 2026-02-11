import React, { useState, useEffect } from 'react';
import './PuzzleGame.css';

const PuzzleGame = () => {
  const [board, setBoard] = useState<number[][]>([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [emptyPos, setEmptyPos] = useState({ row: 3, col: 2 });

  // Initialiser le jeu
  useEffect(() => {
    initGame();
  }, []);

  // Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning) {
      timer = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  const initGame = () => {
    // Créer un tableau résolu puis mélanger
    const numbers = Array.from({ length: 15 }, (_, i) => i + 1);
    numbers.push(0); // Case vide
    
    // Mélanger Fisher-Yates
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }

    // Convertir en grille 4x4 et trouver la case vide
    const newBoard: number[][] = [];
    let emptyRow = 3, emptyCol = 2;
    
    for (let i = 0; i < 4; i++) {
      const row: number[] = [];
      for (let j = 0; j < 4; j++) {
        const value = numbers[i * 4 + j];
        row.push(value);
        if (value === 0) {
          emptyRow = i;
          emptyCol = j;
        }
      }
      newBoard.push(row);
    }

    setBoard(newBoard);
    setEmptyPos({ row: emptyRow, col: emptyCol });
    setMoves(0);
    setTime(0);
    setIsRunning(false);
  };

  const handleClick = (row: number, col: number) => {
    if (!isRunning) setIsRunning(true);
    
    // Vérifier si adjacente à la case vide
    const rowDiff = Math.abs(row - emptyPos.row);
    const colDiff = Math.abs(col - emptyPos.col);
    
    if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
      // Créer une nouvelle copie du tableau
      const newBoard = board.map(r => [...r]);
      
      // Échanger avec la case vide
      newBoard[emptyPos.row][emptyPos.col] = board[row][col];
      newBoard[row][col] = 0;
      
      setBoard(newBoard);
      setEmptyPos({ row, col });
      setMoves(prev => prev + 1);
      
      // Vérifier si gagné
      if (checkWin(newBoard)) {
        setIsRunning(false);
        setTimeout(() => {
          alert(`🎉 Félicitations! Puzzle résolu en ${moves + 1} coups et ${time} secondes!`);
        }, 100);
      }
    }
  };

  const checkWin = (currentBoard: number[][]) => {
    const winBoard = [
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [9, 10, 11, 12],
      [13, 14, 15, 0]
    ];
    
    return JSON.stringify(currentBoard) === JSON.stringify(winBoard);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (board.length === 0) {
    return <div className="loading">Chargement du puzzle...</div>;
  }

  return (
    <div className="puzzle-game">
      <h1>🎮 PUZZLE 15</h1>
      <p className="subtitle">Projet 2ème Année Ingénieur Informatique</p>
      
      <div className="game-stats">
        <div className="stat">
          <div className="label">COUPS</div>
          <div className="value">{moves}</div>
        </div>
        
        <div className="stat">
          <div className="label">TEMPS</div>
          <div className="value">{formatTime(time)}</div>
        </div>
        
        <button className="reset-btn" onClick={initGame}>
          🔄 NOUVELLE PARTIE
        </button>
      </div>

      <div className="puzzle-board">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="board-row">
            {row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`tile ${cell === 0 ? 'empty' : ''}`}
                onClick={() => cell !== 0 && handleClick(rowIndex, colIndex)}
              >
                {cell !== 0 && cell}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="instructions">
        <h3>📋 COMMENT JOUER ?</h3>
        <p>Clique sur une tuile adjacente à la case vide pour la déplacer.</p>
        <p>Objectif : Remettre les nombres dans l'ordre croissant (1 à 15).</p>
      </div>

      <div className="footer">
        <p>Développé avec React + TypeScript</p>
      </div>
    </div>
  );
};

export default PuzzleGame;