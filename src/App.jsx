import { useState, useEffect, useMemo } from 'react';
import KanbanBoard from './components/KanbanBoard';
import BoardSelector from './components/BoardSelector';
import AddBoardModal from './components/AddBoardModal';
import Login from './components/Login';
import { createDataService } from './services/dataService';
import { authService } from './services/authService';
import { themeService, THEMES } from './services/themeService';
import './App.css';

function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState(null);
  
  // User state
  const [currentUser, setCurrentUser] = useState(null);

  // Board state
  const [boards, setBoards] = useState([]);
  const [currentBoard, setCurrentBoard] = useState(null);
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState(null);
  
  // Theme state
  const [theme, setTheme] = useState(THEMES.DARK);
  
  const [isLoading, setIsLoading] = useState(true);

  // Create a data service instance for the current user
  const dataService = useMemo(() => {
    return currentUser ? createDataService(currentUser.id) : null;
  }, [currentUser]);

  // Initialize theme on mount
  useEffect(() => {
    const currentTheme = themeService.initialize();
    setTheme(currentTheme);
  }, []);

  // Check authentication on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  // Load boards when user changes
  useEffect(() => {
    if (currentUser && dataService) {
      loadBoards();
    }
  }, [currentUser, dataService]);

  const initializeAuth = () => {
    setIsLoading(true);
    
    // Initialize auth system with demo users
    authService.initialize();
    
    // Check if user is already logged in
    const session = authService.getCurrentSession();
    if (session) {
      setCurrentUser({
        id: session.userId,
        name: session.name,
        color: session.color,
      });
      setIsAuthenticated(true);
    }
    
    setIsLoading(false);
  };

  const handleLogin = async (username, password) => {
    const result = authService.login(username, password);
    
    if (result.success) {
      setCurrentUser({
        id: result.user.userId,
        name: result.user.name,
        color: result.user.color,
      });
      setIsAuthenticated(true);
      setLoginError(null);
    } else {
      setLoginError(result.error);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setBoards([]);
    setCurrentBoard(null);
    // Theme persists across logout - no need to reset
  };

  const handleToggleTheme = () => {
    const newTheme = themeService.toggleTheme();
    setTheme(newTheme);
  };

  const loadBoards = async () => {
    if (!dataService) return;
    
    setIsLoading(true);
    const allBoards = await dataService.getAllBoards();
    
    // Don't auto-create boards for new users
    setBoards(allBoards);
    
    if (allBoards.length > 0) {
      // Try to restore last active board from localStorage (per user)
      const lastBoardId = localStorage.getItem(`kanbanify_last_board_${currentUser.id}`);
      const lastBoard = allBoards.find(b => b.id === lastBoardId);
      setCurrentBoard(lastBoard || allBoards[0]);
    } else {
      setCurrentBoard(null);
    }
    
    setIsLoading(false);
  };


  const handleSelectBoard = (board) => {
    setCurrentBoard(board);
    if (currentUser) {
      localStorage.setItem(`kanbanify_last_board_${currentUser.id}`, board.id);
    }
  };

  const handleCreateBoard = () => {
    setEditingBoard(null);
    setIsBoardModalOpen(true);
  };

  const handleRenameBoard = (board) => {
    setEditingBoard(board);
    setIsBoardModalOpen(true);
  };

  const handleSaveBoard = async (name, preset = null) => {
    if (!dataService) return;
    
    if (editingBoard) {
      // Rename existing board
      const updated = await dataService.updateBoardName(editingBoard.id, name);
      if (updated) {
        setBoards(boards.map(b => b.id === updated.id ? updated : b));
        if (currentBoard?.id === updated.id) {
          setCurrentBoard(updated);
        }
      }
    } else {
      // Create new board with preset columns
      const newBoard = await dataService.createBoard(name);
      
      // Add preset columns if provided
      if (preset && preset.columns) {
        preset.columns.forEach(columnTitle => {
          const column = dataService.createColumn(columnTitle);
          newBoard.columns.push(column);
        });
        await dataService.saveBoard(newBoard);
      }
      
      setBoards([...boards, newBoard]);
      setCurrentBoard(newBoard);
      if (currentUser) {
        localStorage.setItem(`kanbanify_last_board_${currentUser.id}`, newBoard.id);
      }
    }
  };

  const handleDeleteBoard = async (boardId) => {
    if (!dataService) return;
    
    const success = await dataService.deleteBoard(boardId);
    if (success) {
      const updatedBoards = boards.filter(b => b.id !== boardId);
      setBoards(updatedBoards);
      
      // If deleted board was current, switch to another
      if (currentBoard?.id === boardId) {
        const newCurrent = updatedBoards[0] || null;
        setCurrentBoard(newCurrent);
        if (newCurrent && currentUser) {
          localStorage.setItem(`kanbanify_last_board_${currentUser.id}`, newCurrent.id);
        } else if (currentUser) {
          localStorage.removeItem(`kanbanify_last_board_${currentUser.id}`);
        }
      }
    }
  };

  const handleBoardUpdate = (updatedBoard) => {
    setBoards(boards.map(b => b.id === updatedBoard.id ? updatedBoard : b));
    if (currentBoard?.id === updatedBoard.id) {
      setCurrentBoard(updatedBoard);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} error={loginError} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Top Navigation */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Kanbanify
            </h1>
            {currentUser && (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: currentUser.color }}
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {currentUser.name}
                  </span>
                </div>
                <BoardSelector
                  boards={boards}
                  currentBoard={currentBoard}
                  onSelectBoard={handleSelectBoard}
                  onCreateBoard={handleCreateBoard}
                  onRenameBoard={handleRenameBoard}
                  onDeleteBoard={handleDeleteBoard}
                />
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleTheme}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              title={`Switch to ${theme === THEMES.LIGHT ? 'dark' : 'light'} mode`}
            >
              {theme === THEMES.LIGHT ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  Dark
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Light
                </>
              )}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {currentBoard && dataService ? (
        <KanbanBoard 
          key={currentBoard.id}
          boardId={currentBoard.id}
          dataService={dataService}
          onBoardUpdate={handleBoardUpdate}
        />
      ) : (
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center max-w-md px-6">
            <div className="mb-6">
              <div className="text-6xl mb-4">📋</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Welcome to Kanbanify!
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Create your first board to start organizing tasks and managing projects with ease.
              </p>
            </div>
            <button
              onClick={handleCreateBoard}
              className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Your First Board
            </button>
          </div>
        </div>
      )}

      {/* Board Modal */}
      <AddBoardModal
        isOpen={isBoardModalOpen}
        onClose={() => setIsBoardModalOpen(false)}
        board={editingBoard}
        onSave={handleSaveBoard}
      />
    </div>
  );
}

export default App;
