import { useState, useEffect } from 'react';
import './App.css';

// Configuration des niveaux
const LEVELS = {
  facile: { size: 3, name: 'Facile (3×3)', moves: 50 },
  moyen: { size: 4, name: 'Moyen (4×4)', moves: 100 },
  difficile: { size: 5, name: 'Difficile (5×5)', moves: 150 },
  expert: { size: 6, name: 'Expert (6×6)', moves: 200 }
};

function App() {
  const [level, setLevel] = useState<keyof typeof LEVELS>('moyen');
  const [board, setBoard] = useState<number[][]>([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [bestScores, setBestScores] = useState<Record<string, { moves: number, time: number }>>({});

  const currentLevel = LEVELS[level];
  const size = currentLevel.size;
  const totalTiles = size * size - 1;

  // Initialiser le jeu
  useEffect(() => {
    shuffleBoard();
    loadBestScores();
  }, [level]);

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

  // Charger les meilleurs scores
  const loadBestScores = () => {
    const saved = localStorage.getItem('puzzle_best_scores');
    if (saved) {
      setBestScores(JSON.parse(saved));
    }
  };

  // Sauvegarder un score
  const saveBestScore = () => {
    const currentBest = bestScores[level];
    if (!currentBest || moves < currentBest.moves || (moves === currentBest.moves && time < currentBest.time)) {
      const newBestScores = {
        ...bestScores,
        [level]: { moves, time }
      };
      setBestScores(newBestScores);
      localStorage.setItem('puzzle_best_scores', JSON.stringify(newBestScores));
      return true;
    }
    return false;
  };

  // Créer un tableau résolu
  const createSolvedBoard = () => {
    const board: number[][] = [];
    let counter = 1;
    
    for (let i = 0; i < size; i++) {
      const row: number[] = [];
      for (let j = 0; j < size; j++) {
        if (i === size - 1 && j === size - 1) {
          row.push(0);
        } else {
          row.push(counter++);
        }
      }
      board.push(row);
    }
    return board;
  };

  // Mélanger le plateau
  const shuffleBoard = () => {
    const solvedBoard = createSolvedBoard();
    let newBoard = solvedBoard.map(row => [...row]);
    let emptyPos = { row: size - 1, col: size - 1 };
    
    // Nombre de mélanges selon le niveau
    const shuffleCount = currentLevel.moves;
    
    for (let i = 0; i < shuffleCount; i++) {
      const directions = [
        { dr: -1, dc: 0 }, // haut
        { dr: 1, dc: 0 },  // bas
        { dr: 0, dc: -1 }, // gauche
        { dr: 0, dc: 1 }   // droite
      ];
      
      const possibleMoves = directions.filter(dir => {
        const newRow = emptyPos.row + dir.dr;
        const newCol = emptyPos.col + dir.dc;
        return newRow >= 0 && newRow < size && newCol >= 0 && newCol < size;
      });
      
      const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      const tileRow = emptyPos.row + randomMove.dr;
      const tileCol = emptyPos.col + randomMove.dc;
      
      // Échanger
      newBoard[emptyPos.row][emptyPos.col] = newBoard[tileRow][tileCol];
      newBoard[tileRow][tileCol] = 0;
      emptyPos = { row: tileRow, col: tileCol };
    }
    
    setBoard(newBoard);
    setMoves(0);
    setTime(0);
    setIsRunning(false);
    setGameStarted(false);
  };

  // Gestion du clic sur une tuile
  const handleTileClick = (row: number, col: number) => {
    if (!gameStarted) {
      setIsRunning(true);
      setGameStarted(true);
    }
    
    // Trouver la case vide
    let emptyRow = -1, emptyCol = -1;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (board[r][c] === 0) {
          emptyRow = r;
          emptyCol = c;
        }
      }
    }
    
    // Vérifier si adjacente
    const isAdjacent = 
      (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
      (Math.abs(col - emptyCol) === 1 && row === emptyRow);
    
    if (!isAdjacent) return;
    
    // Créer une nouvelle copie
    const newBoard = board.map(r => [...r]);
    newBoard[emptyRow][emptyCol] = board[row][col];
    newBoard[row][col] = 0;
    
    setBoard(newBoard);
    setMoves(prev => prev + 1);
    
    // Vérifier victoire
    if (checkWin(newBoard)) {
      setIsRunning(false);
      const isNewBest = saveBestScore();
      
      setTimeout(() => {
        if (isNewBest) {
          alert(`🏆 NOUVEAU RECORD !\nPuzzle résolu en ${moves + 1} coups et ${time} secondes !`);
        } else {
          alert(`🎉 Bravo ! Puzzle résolu en ${moves + 1} coups et ${time} secondes !`);
        }
      }, 100);
    }
  };

  // Vérifier si le puzzle est résolu
  const checkWin = (currentBoard: number[][]) => {
    const solvedBoard = createSolvedBoard();
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (currentBoard[i][j] !== solvedBoard[i][j]) {
          return false;
        }
      }
    }
    return true;
  };

  // Formater le temps
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Calculer la taille des tuiles selon la taille du plateau
  const getTileSize = () => {
    if (size === 3) return 90;
    if (size === 4) return 80;
    if (size === 5) return 70;
    return 60;
  };

  const tileSize = getTileSize();

  if (board.length === 0) {
    return <div className="loading">Chargement...</div>;
  }

  const bestScore = bestScores[level];

  return (
    <div className="app">
      <header className="header">
        <h1>🎮 PUZZLE {totalTiles}</h1>
        <p className="subtitle">Niveau: {currentLevel.name}</p>
      </header>

      <main className="game-container">
        <div className="level-selector">
          {Object.keys(LEVELS).map(lvl => (
            <button
              key={lvl}
              className={`level-btn ${level === lvl ? 'active' : ''}`}
              onClick={() => setLevel(lvl as keyof typeof LEVELS)}
            >
              {LEVELS[lvl as keyof typeof LEVELS].name}
            </button>
          ))}
        </div>

        <div className="game-info">
          <div className="info-box">
            <div className="label">COUPS</div>
            <div className="value">{moves}</div>
          </div>
          
          <div className="info-box">
            <div className="label">TEMPS</div>
            <div className="value">{formatTime(time)}</div>
          </div>
          
          <div className="info-box">
            <div className="label">MEILLEUR</div>
            <div className="value">
              {bestScore ? `${bestScore.moves} coups` : '---'}
            </div>
          </div>
        </div>

        <div className="controls">
          <button className="control-btn" onClick={shuffleBoard}>
            🔄 NOUVEAU JEU
          </button>
          
          <button 
            className="control-btn hint-btn"
            onClick={() => {
              // Indice simple: montrer où devrait être une tuile mal placée
              alert('💡 Indice: Concentrez-vous d\'abord sur la première ligne et première colonne !');
            }}
          >
            💡 INDICE
          </button>
        </div>

        <div className="puzzle-board" style={{ 
          gridTemplateColumns: `repeat(${size}, ${tileSize}px)`,
          gridTemplateRows: `repeat(${size}, ${tileSize}px)`,
          width: `${size * tileSize + (size - 1) * 10 + 30}px`
        }}>
          {board.map((row, rowIndex) => (
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`puzzle-tile ${cell === 0 ? 'empty' : ''}`}
                style={{ 
                  width: `${tileSize}px`, 
                  height: `${tileSize}px`,
                  fontSize: `${tileSize * 0.3}px`
                }}
                onClick={() => cell !== 0 && handleTileClick(rowIndex, colIndex)}
              >
                {cell !== 0 && cell}
                {cell !== 0 && cell <= totalTiles && (
                  <div className="tile-position">
                    {Math.floor((cell - 1) / size) + 1},{((cell - 1) % size) + 1}
                  </div>
                )}
              </div>
            ))
          ))}
        </div>

        <div className="progress">
          <div className="progress-label">Progression</div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ 
                width: `${Math.min((moves / currentLevel.moves) * 100, 100)}%` 
              }}
            />
          </div>
          <div className="progress-text">
            Objectif: Terminer en moins de {currentLevel.moves} coups
          </div>
        </div>

        <div className="game-instructions">
          <h3>🎯 COMMENT JOUER</h3>
          <p>Cliquez sur une tuile adjacente à la case vide pour la déplacer.</p>
          <p>Objectif : Remettre les nombres dans l'ordre de 1 à {totalTiles}.</p>
          <p>Petits chiffres : position cible de la tuile (ligne,colonne).</p>
        </div>
      </main>
    </div>
  );
}

export default App;