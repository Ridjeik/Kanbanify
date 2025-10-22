# Kanbanify

A modern, feature-rich Kanban board application built with React, Vite, and Tailwind CSS. Organize tasks, manage projects, and collaborate efficiently with an intuitive drag-and-drop interface.

## Features

- **Multiple Boards**: Create and manage multiple Kanban boards
- **Drag & Drop**: Smooth drag-and-drop functionality powered by @dnd-kit
- **User Authentication**: Multi-user support with secure login system
- **Customizable Columns**: Add, rename, and delete columns as needed
- **Task Cards**: Rich task cards with descriptions, tags, and user assignments
- **Dark Mode**: Toggle between light and dark themes
- **Local Storage**: All data persists locally in the browser
- **Board Presets**: Quick-start templates for common workflows
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS 4
- **Drag & Drop**: @dnd-kit
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Code Quality**: ESLint

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Kanbanify
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint

## Usage

### Demo Users

The application comes with pre-configured demo users. Use any of these credentials to log in:

- **Username**: admin | **Password**: admin
- **Username**: demo | **Password**: demo

### Creating Boards

1. Click the "Create Board" button in the board selector
2. Enter a board name
3. Optionally select a preset (Default, Software Dev, Marketing)
4. Click "Create" to add your new board

### Managing Tasks

- **Add Column**: Click the "Add Column" button
- **Add Card**: Click "Add Card" within any column
- **Edit Card**: Click on any card to view/edit details
- **Drag & Drop**: Drag cards between columns or reorder within a column
- **Delete**: Use the trash icon on cards or columns

## Project Structure

```
Kanbanify/
├── src/
│   ├── components/        # React components
│   │   ├── KanbanBoard.jsx
│   │   ├── Card.jsx
│   │   ├── Column.jsx
│   │   ├── Login.jsx
│   │   └── ...
│   ├── services/          # Business logic and data management
│   │   ├── authService.js
│   │   ├── dataService.js
│   │   ├── storageService.js
│   │   └── ...
│   ├── App.jsx           # Main application component
│   └── main.jsx          # Application entry point
├── public/               # Static assets
├── index.html           # HTML template
└── vite.config.js       # Vite configuration
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Built with [React](https://react.dev/)
- Drag and drop powered by [@dnd-kit](https://dndkit.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons by [Lucide](https://lucide.dev/)
