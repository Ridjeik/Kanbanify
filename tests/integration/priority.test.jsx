import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import CardModal from '../../src/components/CardModal';
import Card from '../../src/components/Card';
import { createDataService } from '../../src/services/dataService';

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
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Priority Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('CardModal with Priority', () => {
    it('should create a card with default medium priority', () => {
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
      const titleInput = screen.getByPlaceholderText('Enter card title');
      fireEvent.change(titleInput, { target: { value: 'New Task' } });

      // Save the card
      fireEvent.click(screen.getByText('Create Card'));

      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Task',
          priority: 'medium',
        })
      );
    });

    it('should create a card with high priority', () => {
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
      const titleInput = screen.getByPlaceholderText('Enter card title');
      fireEvent.change(titleInput, { target: { value: 'Urgent Task' } });

      // Find and click the High priority button
      const priorityButtons = screen.getAllByRole('button', { name: /priority/i });
      // The priority buttons should contain the Priority component
      const highPriorityButton = screen.getByText('High').closest('button');
      fireEvent.click(highPriorityButton);

      // Save the card
      fireEvent.click(screen.getByText('Create Card'));

      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Urgent Task',
          priority: 'high',
        })
      );
    });

    it('should create a card with critical priority', () => {
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

      const titleInput = screen.getByPlaceholderText('Enter card title');
      fireEvent.change(titleInput, { target: { value: 'Critical Bug' } });

      // Click Critical priority
      const criticalPriorityButton = screen.getByText('Critical').closest('button');
      fireEvent.click(criticalPriorityButton);

      fireEvent.click(screen.getByText('Create Card'));

      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Critical Bug',
          priority: 'critical',
        })
      );
    });

    it('should create a card with low priority', () => {
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

      const titleInput = screen.getByPlaceholderText('Enter card title');
      fireEvent.change(titleInput, { target: { value: 'Minor Task' } });

      // Click Low priority
      const lowPriorityButton = screen.getByText('Low').closest('button');
      fireEvent.click(lowPriorityButton);

      fireEvent.click(screen.getByText('Create Card'));

      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Minor Task',
          priority: 'low',
        })
      );
    });

    it('should allow changing priority multiple times', () => {
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

      const titleInput = screen.getByPlaceholderText('Enter card title');
      fireEvent.change(titleInput, { target: { value: 'Task' } });

      // Change priority multiple times
      fireEvent.click(screen.getByText('High').closest('button'));
      fireEvent.click(screen.getByText('Critical').closest('button'));
      fireEvent.click(screen.getByText('Low').closest('button'));

      fireEvent.click(screen.getByText('Create Card'));

      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          priority: 'low', // Should be the last selected
        })
      );
    });

    it('should edit a card and preserve existing priority', () => {
      const onSave = vi.fn();
      const onClose = vi.fn();
      const existingCard = {
        id: 'card1',
        title: 'Existing Task',
        description: 'Description',
        priority: 'high',
        tags: [],
        dueDate: '',
      };

      render(
        <CardModal
          isOpen={true}
          onClose={onClose}
          onSave={onSave}
          card={existingCard}
        />
      );

      // The high priority button should be selected (have active styles)
      const highPriorityButton = screen.getByText('High').closest('button');
      expect(highPriorityButton).toHaveClass('border-blue-500');

      fireEvent.click(screen.getByText('Save Changes'));

      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          priority: 'high',
        })
      );
    });

    it('should edit a card and change its priority', () => {
      const onSave = vi.fn();
      const onClose = vi.fn();
      const existingCard = {
        id: 'card1',
        title: 'Existing Task',
        description: 'Description',
        priority: 'low',
        tags: [],
        dueDate: '',
      };

      render(
        <CardModal
          isOpen={true}
          onClose={onClose}
          onSave={onSave}
          card={existingCard}
        />
      );

      // Change priority from low to critical
      const criticalPriorityButton = screen.getByText('Critical').closest('button');
      fireEvent.click(criticalPriorityButton);

      fireEvent.click(screen.getByText('Save Changes'));

      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          priority: 'critical',
        })
      );
    });

    it('should display all four priority options', () => {
      render(
        <CardModal
          isOpen={true}
          onClose={() => {}}
          onSave={() => {}}
          card={null}
        />
      );

      expect(screen.getByText('Low')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('High')).toBeInTheDocument();
      expect(screen.getByText('Critical')).toBeInTheDocument();
    });

    it('should create a card with priority and tags together', () => {
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

      // Fill in details
      fireEvent.change(screen.getByPlaceholderText('Enter card title'), {
        target: { value: 'Complex Task' },
      });

      // Add a tag
      const tagInput = screen.getByPlaceholderText('Add a tag...');
      fireEvent.change(tagInput, { target: { value: 'backend' } });
      fireEvent.click(screen.getByText('Add'));

      // Set priority
      fireEvent.click(screen.getByText('High').closest('button'));

      // Save
      fireEvent.click(screen.getByText('Create Card'));

      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Complex Task',
          priority: 'high',
          tags: expect.arrayContaining([
            expect.objectContaining({
              label: 'backend',
            }),
          ]),
        })
      );
    });
  });

  describe('Card Display with Priority', () => {
    it('should display priority badge on card', () => {
      const card = {
        id: 'card1',
        title: 'High Priority Task',
        priority: 'high',
        tags: [],
      };

      const { container } = render(<Card card={card} onClick={() => {}} />);
      
      // Check that the card renders
      expect(screen.getByText('High Priority Task')).toBeInTheDocument();
      
      // Check that priority flag icon is present
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should display priority for low priority card', () => {
      const card = {
        id: 'card1',
        title: 'Low Priority Task',
        priority: 'low',
        tags: [],
      };

      const { container } = render(<Card card={card} onClick={() => {}} />);
      expect(screen.getByText('Low Priority Task')).toBeInTheDocument();
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should display priority for critical priority card', () => {
      const card = {
        id: 'card1',
        title: 'Critical Task',
        priority: 'critical',
        tags: [],
      };

      const { container } = render(<Card card={card} onClick={() => {}} />);
      expect(screen.getByText('Critical Task')).toBeInTheDocument();
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should display card with both priority and tags', () => {
      const card = {
        id: 'card1',
        title: 'Full Featured Task',
        priority: 'high',
        tags: [
          { label: 'bug', color: 'red' },
          { label: 'urgent', color: 'orange' },
        ],
      };

      render(<Card card={card} onClick={() => {}} />);
      
      expect(screen.getByText('Full Featured Task')).toBeInTheDocument();
      expect(screen.getByText('bug')).toBeInTheDocument();
      expect(screen.getByText('urgent')).toBeInTheDocument();
    });

    it('should display card with priority, tags, and due date', () => {
      const card = {
        id: 'card1',
        title: 'Complete Task',
        priority: 'critical',
        tags: [{ label: 'feature', color: 'blue' }],
        dueDate: '2025-12-31',
      };

      render(<Card card={card} onClick={() => {}} />);
      
      expect(screen.getByText('Complete Task')).toBeInTheDocument();
      expect(screen.getByText('feature')).toBeInTheDocument();
      expect(screen.getByText('Dec 31, 2025')).toBeInTheDocument();
    });

    it('should handle card without priority gracefully', () => {
      const card = {
        id: 'card1',
        title: 'Task Without Priority',
        tags: [],
      };

      const { container } = render(<Card card={card} onClick={() => {}} />);
      expect(screen.getByText('Task Without Priority')).toBeInTheDocument();
      // Priority badge should not be rendered
      expect(container.querySelector('.inline-flex.items-center.gap-1.rounded-full')).not.toBeInTheDocument();
    });
  });

  describe('DataService Priority Integration', () => {
    it('should create and store cards with priority', async () => {
      const dataService = createDataService('test-user');
      const board = await dataService.createBoard('Test Board');

      // Create cards with different priorities
      const lowPriorityCard = dataService.createCard('Low Task', { priority: 'low' });
      const highPriorityCard = dataService.createCard('High Task', { priority: 'high' });
      const criticalPriorityCard = dataService.createCard('Critical Task', { priority: 'critical' });

      // Verify priorities are set correctly
      expect(lowPriorityCard.priority).toBe('low');
      expect(highPriorityCard.priority).toBe('high');
      expect(criticalPriorityCard.priority).toBe('critical');

      // Add cards to a column
      const column = dataService.createColumn('To Do');
      column.cards = [lowPriorityCard, highPriorityCard, criticalPriorityCard];
      board.columns = [column];

      await dataService.saveBoard(board);

      // Retrieve board and verify priorities persisted
      const retrievedBoard = await dataService.getBoard(board.id);
      expect(retrievedBoard.columns[0].cards[0].priority).toBe('low');
      expect(retrievedBoard.columns[0].cards[1].priority).toBe('high');
      expect(retrievedBoard.columns[0].cards[2].priority).toBe('critical');
    });

    it('should handle cards with default priority', async () => {
      const dataService = createDataService('test-user');
      const card = dataService.createCard('Default Priority Card');
      
      expect(card.priority).toBe('medium');
    });

    it('should maintain priority when finding cards', async () => {
      const dataService = createDataService('test-user');
      const board = await dataService.createBoard('Test Board');

      const card = dataService.createCard('High Priority Task', { priority: 'high' });
      const column = dataService.createColumn('In Progress');
      column.cards = [card];
      board.columns = [column];

      const foundCard = dataService.findCard(board, card.id);
      expect(foundCard.card.priority).toBe('high');
    });
  });

  describe('Priority UI Interactions', () => {
    it('should visually indicate selected priority', () => {
      render(
        <CardModal
          isOpen={true}
          onClose={() => {}}
          onSave={() => {}}
          card={null}
        />
      );

      // Initially, Medium should be selected (default)
      const mediumButton = screen.getByText('Medium').closest('button');
      expect(mediumButton).toHaveClass('border-blue-500');

      // Click High priority
      const highButton = screen.getByText('High').closest('button');
      fireEvent.click(highButton);

      // High should now be selected
      expect(highButton).toHaveClass('border-blue-500');
    });

    it('should show all priority options side by side', () => {
      const { container } = render(
        <CardModal
          isOpen={true}
          onClose={() => {}}
          onSave={() => {}}
          card={null}
        />
      );

      // Check that priority buttons are in a flex container
      const prioritySection = container.querySelector('.flex.gap-2');
      expect(prioritySection).toBeInTheDocument();
    });
  });
});

