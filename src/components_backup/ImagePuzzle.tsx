import React, { useState, useEffect } from 'react';
import './ImagePuzzle.css';

const ImagePuzzle: React.FC = () => {
  const [board, setBoard] = useState<number[][]>([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [emptyPos, setEmptyPos] = useState({ row: 3, col: 3 });
  const [imageSrc, setImageSrc] = useState<string>('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop');

  // Initialiser le jeu
  useEffect(() => {
    initGame();
  }, [imageSrc]);

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
    // Créer un tableau d'indices 0-15
    let indices = Array.from({ length: 16 }, (_, i) => i);
    
    // Mélanger
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    // Convertir en grille 4x4
    const newBoard: number[][] = [];
    let emptyRow = 3, emptyCol = 3;
    
    for (let i = 0; i < 4; i++) {
      const row: number[] = [];
      for (let j = 0; j < 4; j++) {
        const value = indices[i * 4 + j];
        row.push(value);
        if (value === 15) {
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
      const newBoard = board.map(r => [...r]);
      newBoard[emptyPos.row][emptyPos.col] = board[row][col];
      newBoard[row][col] = 15;
      
      setBoard(newBoard);
      setEmptyPos({ row, col });
      setMoves(prev => prev + 1);
      
      if (checkWin(newBoard)) {
        setIsRunning(false);
        setTimeout(() => {
          alert(`🎉 Image reconstituée en ${moves + 1} coups et ${time} secondes!`);
        }, 100);
      }
    }
  };

  const checkWin = (currentBoard: number[][]): boolean => {
    // Vérifier si les indices sont dans l'ordre 0-15
    let expected = 0;
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (i === 3 && j === 3) {
          if (currentBoard[i][j] !== 15) return false;
        } else if (currentBoard[i][j] !== expected++) {
          return false;
        }
      }
    }
    return true;
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageSrc(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (board.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Chargement du puzzle...</p>
      </div>
    );
  }

  return (
    <div className="image-puzzle">
      <h1>🖼️ PUZZLE D'IMAGE</h1>
      <p className="subtitle">Reconstitue l'image complète!</p>
      
      <div className="controls">
        <div className="upload-btn">
          <label htmlFor="image-upload">
            📁 Choisir une image
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
        </div>
        
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
            🔄 Mélanger
          </button>
        </div>
      </div>

      {/* Image complète pour référence */}
      <div className="reference-image">
        <p>Image à reconstituer:</p>
        <img 
          src={imageSrc} 
          alt="Référence" 
          style={{ width: '200px', height: '200px', objectFit: 'cover' }}
        />
      </div>

      {/* Grille du puzzle */}
      <div className="puzzle-board">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="board-row">
            {row.map((tileIndex, colIndex) => {
              const isEmpty = tileIndex === 15;
              const rowInImage = Math.floor(tileIndex / 4);
              const colInImage = tileIndex % 4;
              
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`image-tile ${isEmpty ? 'empty' : ''}`}
                  onClick={() => !isEmpty && handleClick(rowIndex, colIndex)}
                  style={!isEmpty ? {
                    backgroundImage: `url(${imageSrc})`,
                    backgroundPosition: `-${colInImage * 100}px -${rowInImage * 100}px`,
                    backgroundSize: '400px 400px'
                  } : {}}
                >
                  {!isEmpty && (
                    <div className="tile-number">{tileIndex + 1}</div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="instructions">
        <h3>📋 COMMENT JOUER ?</h3>
        <p>1. Choisis une image avec le bouton "Choisir une image"</p>
        <p>2. Clique sur un morceau adjacent à la case vide pour le déplacer</p>
        <p>3. Reconstitue l'image complète!</p>
      </div>

      <div className="features">
        <div className="feature">
          <span className="emoji">🎯</span>
          <span>Mode Image</span>
        </div>
        <div className="feature">
          <span className="emoji">📤</span>
          <span>Upload personnalisé</span>
        </div>
        <div className="feature">
          <span className="emoji">⏱️</span>
          <span>Timer</span>
        </div>
      </div>
    </div>
  );
};

export default ImagePuzzle;