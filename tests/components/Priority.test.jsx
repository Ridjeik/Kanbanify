import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Priority, { getPriorityLevels, getPriorityOrder } from '../../src/components/Priority';

describe('Priority Component', () => {
  describe('Priority rendering', () => {
    it('should render priority with default medium level', () => {
      const { container } = render(<Priority />);
      expect(container.querySelector('span')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
    });

    it('should render low priority correctly', () => {
      render(<Priority level="low" />);
      expect(screen.getByText('Low')).toBeInTheDocument();
    });

    it('should render medium priority correctly', () => {
      render(<Priority level="medium" />);
      expect(screen.getByText('Medium')).toBeInTheDocument();
    });

    it('should render high priority correctly', () => {
      render(<Priority level="high" />);
      expect(screen.getByText('High')).toBeInTheDocument();
    });

    it('should render critical priority correctly', () => {
      render(<Priority level="critical" />);
      expect(screen.getByText('Critical')).toBeInTheDocument();
    });

    it('should render without label when showLabel is false', () => {
      render(<Priority level="high" showLabel={false} />);
      expect(screen.queryByText('High')).not.toBeInTheDocument();
    });

    it('should render with label when showLabel is true', () => {
      render(<Priority level="high" showLabel={true} />);
      expect(screen.getByText('High')).toBeInTheDocument();
    });
  });

  describe('Priority styling', () => {
    it('should apply correct color classes for low priority', () => {
      const { container } = render(<Priority level="low" />);
      const span = container.querySelector('span');
      expect(span).toHaveClass('bg-gray-100');
      expect(span).toHaveClass('text-gray-700');
    });

    it('should apply correct color classes for medium priority', () => {
      const { container } = render(<Priority level="medium" />);
      const span = container.querySelector('span');
      expect(span).toHaveClass('bg-blue-100');
      expect(span).toHaveClass('text-blue-800');
    });

    it('should apply correct color classes for high priority', () => {
      const { container } = render(<Priority level="high" />);
      const span = container.querySelector('span');
      expect(span).toHaveClass('bg-orange-100');
      expect(span).toHaveClass('text-orange-800');
    });

    it('should apply correct color classes for critical priority', () => {
      const { container } = render(<Priority level="critical" />);
      const span = container.querySelector('span');
      expect(span).toHaveClass('bg-red-100');
      expect(span).toHaveClass('text-red-800');
    });

    it('should apply small size classes', () => {
      const { container } = render(<Priority level="high" size="small" />);
      const span = container.querySelector('span');
      expect(span).toHaveClass('text-xs');
      expect(span).toHaveClass('px-2');
      expect(span).toHaveClass('py-0.5');
    });

    it('should apply medium size classes', () => {
      const { container } = render(<Priority level="high" size="medium" />);
      const span = container.querySelector('span');
      expect(span).toHaveClass('text-sm');
      expect(span).toHaveClass('px-2.5');
      expect(span).toHaveClass('py-1');
    });
  });

  describe('Priority icon rendering', () => {
    it('should render flag icon', () => {
      const { container } = render(<Priority level="high" />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render icon with correct size for small', () => {
      const { container } = render(<Priority level="high" size="small" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '12');
      expect(svg).toHaveAttribute('height', '12');
    });

    it('should render icon with correct size for medium', () => {
      const { container } = render(<Priority level="high" size="medium" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '14');
      expect(svg).toHaveAttribute('height', '14');
    });
  });

  describe('Edge cases', () => {
    it('should default to medium priority for invalid level', () => {
      render(<Priority level="invalid" />);
      expect(screen.getByText('Medium')).toBeInTheDocument();
    });

    it('should handle undefined level', () => {
      render(<Priority level={undefined} />);
      expect(screen.getByText('Medium')).toBeInTheDocument();
    });
  });
});

describe('getPriorityLevels', () => {
  it('should return all priority levels', () => {
    const levels = getPriorityLevels();
    expect(levels).toHaveLength(4);
    expect(levels).toEqual([
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'critical', label: 'Critical' },
    ]);
  });

  it('should return an array', () => {
    const levels = getPriorityLevels();
    expect(Array.isArray(levels)).toBe(true);
  });

  it('should return immutable data', () => {
    const levels1 = getPriorityLevels();
    const levels2 = getPriorityLevels();
    expect(levels1).toEqual(levels2);
  });
});

describe('getPriorityOrder', () => {
  it('should return correct order for low priority', () => {
    expect(getPriorityOrder('low')).toBe(1);
  });

  it('should return correct order for medium priority', () => {
    expect(getPriorityOrder('medium')).toBe(2);
  });

  it('should return correct order for high priority', () => {
    expect(getPriorityOrder('high')).toBe(3);
  });

  it('should return correct order for critical priority', () => {
    expect(getPriorityOrder('critical')).toBe(4);
  });

  it('should return default order for invalid priority', () => {
    expect(getPriorityOrder('invalid')).toBe(2);
  });

  it('should return default order for undefined priority', () => {
    expect(getPriorityOrder(undefined)).toBe(2);
  });

  it('should maintain priority ordering', () => {
    expect(getPriorityOrder('low')).toBeLessThan(getPriorityOrder('medium'));
    expect(getPriorityOrder('medium')).toBeLessThan(getPriorityOrder('high'));
    expect(getPriorityOrder('high')).toBeLessThan(getPriorityOrder('critical'));
  });
});

