import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { createDataService } from "../../src/services/dataService";
import { themeService, THEMES } from "../../src/services/themeService";
import KanbanBoard from "../../src/components/KanbanBoard";
import CardModal from "../../src/components/CardModal";
import Login from "../../src/components/Login";
import AddBoardModal from "../../src/components/AddBoardModal";
import UserSelector from "../../src/components/UserSelector";

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key],
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key) => {
      delete store[key];
    },
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("UI Integration Tests", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(Date, "now").mockImplementation(() => 1234567890);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Card Management", () => {
    it("should create and edit a card with tags", async () => {
      const onSave = vi.fn();
      const onClose = vi.fn();

      render(
        <CardModal
          isOpen={true}
          onClose={onClose}
          onSave={onSave}
          card={null}
        />
      );

      // Fill in card details
      const titleInput = screen.getByPlaceholderText("Enter card title");
      const descriptionInput = screen.getByPlaceholderText(
        "Add a more detailed description..."
      );

      fireEvent.change(titleInput, {
        target: { value: "New Task" },
      });

      fireEvent.change(descriptionInput, {
        target: { value: "Task description" },
      });

      // Add a tag
      const tagInput = screen.getByPlaceholderText("Add a tag...");
      fireEvent.change(tagInput, { target: { value: "priority" } });
      fireEvent.click(screen.getByText("Add"));

      // Save the card
      fireEvent.click(screen.getByText("Create Card"));

      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "New Task",
          description: "Task description",
          tags: expect.arrayContaining([
            expect.objectContaining({
              label: "priority",
            }),
          ]),
        })
      );
    });
  });

  describe("Board Integration", () => {
    it("should render board with columns and cards", async () => {
      const dataService = createDataService("test-user");
      const board = await dataService.createBoard("Test Board");

      // Add columns and cards
      const todoColumn = dataService.createColumn("To Do");
      todoColumn.cards = [
        dataService.createCard("Task 1"),
        dataService.createCard("Task 2"),
      ];
      board.columns = [todoColumn];
      await dataService.saveBoard(board);

      render(
        <KanbanBoard
          boardId={board.id}
          dataService={dataService}
          onBoardUpdate={() => {}}
        />
      );

      // Wait for loading state to be resolved
      await screen.findByText("Test Board");

      expect(screen.getByText("Test Board")).toBeInTheDocument();
      expect(screen.getByText("To Do")).toBeInTheDocument();
      expect(screen.getByText("Task 1")).toBeInTheDocument();
      expect(screen.getByText("Task 2")).toBeInTheDocument();
    });
  });

  describe("Board Creation", () => {
    it("should create a new board with preset columns", async () => {
      const onSave = vi.fn();
      const onClose = vi.fn();

      render(
        <AddBoardModal
          isOpen={true}
          onClose={onClose}
          onSave={onSave}
          board={null}
        />
      );

      // Enter board name
      fireEvent.change(
        screen.getByPlaceholderText("e.g., My Project, Sprint Planning"),
        {
          target: { value: "New Project" },
        }
      );

      // Select a preset
      fireEvent.click(screen.getByText("Simple Kanban"));

      // Create board
      fireEvent.click(screen.getByText("Create Board"));

      expect(onSave).toHaveBeenCalledWith(
        "New Project",
        expect.objectContaining({
          columns: ["To Do", "In Progress", "Done"],
        })
      );
    });
  });

  describe("User Selection", () => {
    it("should handle user switching", async () => {
      const users = [
        { id: "user1", name: "User One", color: "#3B82F6" },
        { id: "user2", name: "User Two", color: "#10B981" },
      ];
      const currentUser = users[0];
      const onSelectUser = vi.fn();

      render(
        <UserSelector
          users={users}
          currentUser={currentUser}
          onSelectUser={onSelectUser}
          onCreateUser={() => {}}
          onDeleteUser={() => {}}
        />
      );

      // Open dropdown
      fireEvent.click(screen.getByText(currentUser.name));

      // Select second user
      fireEvent.click(screen.getByText("User Two"));

      expect(onSelectUser).toHaveBeenCalledWith(users[1]);
    });

    it("should handle user deletion", async () => {
      const users = [
        { id: "user1", name: "User One", color: "#3B82F6" },
        { id: "user2", name: "User Two", color: "#10B981" },
      ];
      const onDeleteUser = vi.fn();

      render(
        <UserSelector
          users={users}
          currentUser={users[0]}
          onSelectUser={() => {}}
          onCreateUser={() => {}}
          onDeleteUser={onDeleteUser}
        />
      );

      // Open dropdown
      fireEvent.click(screen.getByText("User One"));

      // Mock window.confirm before the action
      const confirmSpy = vi.spyOn(window, "confirm");
      confirmSpy.mockImplementation(() => true);

      // Find and click delete button for second user
      const deleteButtons = screen.getAllByTitle("Delete user");
      fireEvent.click(deleteButtons[1]);

      expect(onDeleteUser).toHaveBeenCalledWith("user2");
    });
  });

  describe("Theme Integration", () => {
    it("should apply theme classes to components", () => {
      themeService.setTheme(THEMES.DARK);

      render(<Login onLogin={() => {}} />);

      expect(document.documentElement).toHaveClass("dark");

      // Toggle theme
      const themeButton = screen.getByTitle(/Switch to/);
      fireEvent.click(themeButton);

      expect(document.documentElement).not.toHaveClass("dark");
    });
  });
});
