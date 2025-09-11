import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { 
  LoadingSkeleton,
  LoadingCard,
  LoadingList,
  LoadingTable,
  LoadingSpinner,
  LoadingPage,
  LoadingButton
} from '../LoadingStates';

describe('LoadingStates', () => {
  describe('LoadingSkeleton', () => {
    it('renders with default props', () => {
      render(<LoadingSkeleton />);
      const skeletons = screen.getAllByTestId(/skeleton/i);
      expect(skeletons).toHaveLength(3); // default lines
    });

    it('renders custom number of lines', () => {
      render(<LoadingSkeleton lines={5} />);
      const skeletons = screen.getAllByTestId(/skeleton/i);
      expect(skeletons).toHaveLength(5);
    });

    it('renders avatar when showAvatar is true', () => {
      render(<LoadingSkeleton showAvatar={true} />);
      const skeletons = screen.getAllByTestId(/skeleton/i);
      expect(skeletons).toHaveLength(5); // 3 lines + avatar + name
    });
  });

  describe('LoadingCard', () => {
    it('renders with header by default', () => {
      render(<LoadingCard />);
      const skeletons = screen.getAllByTestId(/skeleton/i);
      expect(skeletons.length).toBeGreaterThan(4); // header + content lines
    });

    it('renders without header when showHeader is false', () => {
      render(<LoadingCard showHeader={false} />);
      const skeletons = screen.getAllByTestId(/skeleton/i);
      expect(skeletons).toHaveLength(4); // default content lines only
    });
  });

  describe('LoadingList', () => {
    it('renders default number of items', () => {
      render(<LoadingList />);
      const listItems = screen.getAllByTestId(/skeleton/i);
      expect(listItems.length).toBeGreaterThan(5); // 5 items with multiple skeletons each
    });

    it('renders custom number of items', () => {
      render(<LoadingList items={3} />);
      const containers = document.querySelectorAll('.flex.items-center.space-x-3');
      expect(containers).toHaveLength(3);
    });
  });

  describe('LoadingTable', () => {
    it('renders with default dimensions', () => {
      render(<LoadingTable />);
      const skeletons = screen.getAllByTestId(/skeleton/i);
      expect(skeletons.length).toBeGreaterThan(20); // header + rows * columns
    });

    it('renders custom dimensions', () => {
      render(<LoadingTable rows={2} columns={3} />);
      const skeletons = screen.getAllByTestId(/skeleton/i);
      expect(skeletons).toHaveLength(9); // (2 rows + 1 header) * 3 columns
    });
  });

  describe('LoadingSpinner', () => {
    it('renders with default size', () => {
      render(<LoadingSpinner />);
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('h-6', 'w-6'); // medium size
    });

    it('renders with custom size', () => {
      render(<LoadingSpinner size="lg" />);
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toHaveClass('h-8', 'w-8'); // large size
    });

    it('renders with text', () => {
      render(<LoadingSpinner text="Please wait..." />);
      expect(screen.getByText('Please wait...')).toBeInTheDocument();
    });
  });

  describe('LoadingPage', () => {
    it('renders full page loading', () => {
      render(<LoadingPage />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      const container = document.querySelector('.min-h-screen');
      expect(container).toBeInTheDocument();
    });

    it('renders with custom text', () => {
      render(<LoadingPage text="Setting up your dashboard..." />);
      expect(screen.getByText('Setting up your dashboard...')).toBeInTheDocument();
    });
  });

  describe('LoadingButton', () => {
    it('renders children when not loading', () => {
      render(
        <LoadingButton isLoading={false}>
          Click me
        </LoadingButton>
      );
      expect(screen.getByText('Click me')).toBeInTheDocument();
      expect(document.querySelector('.animate-spin')).not.toBeInTheDocument();
    });

    it('renders spinner when loading', () => {
      render(
        <LoadingButton isLoading={true}>
          Click me
        </LoadingButton>
      );
      expect(screen.getByText('Click me')).toBeInTheDocument();
      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('is disabled when loading', () => {
      render(
        <LoadingButton isLoading={true}>
          Click me
        </LoadingButton>
      );
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('can be disabled independently of loading state', () => {
      render(
        <LoadingButton isLoading={false} disabled={true}>
          Click me
        </LoadingButton>
      );
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });
});