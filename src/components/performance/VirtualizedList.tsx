import React, { useState, useCallback, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { cn } from '@/lib/utils';

interface VirtualizedListProps<T> {
  items: T[];
  height: number;
  width?: number | string;
  itemHeight: number;
  renderItem: (item: T, index: number, style: React.CSSProperties) => React.ReactNode;
  className?: string;
  overscan?: number;
}

export function VirtualizedList<T>({
  items,
  height,
  width = '100%',
  itemHeight,
  renderItem,
  className,
  overscan = 5
}: VirtualizedListProps<T>) {
  const itemCount = items.length;

  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = items[index];
    return (
      <div style={style}>
        {renderItem(item, index, style)}
      </div>
    );
  }, [items, renderItem]);

  const memoizedList = useMemo(() => (
    <List
      height={height}
      width={width}
      itemCount={itemCount}
      itemSize={itemHeight}
      overscanCount={overscan}
      className={cn("scrollbar-thin", className)}
    >
      {Row}
    </List>
  ), [height, width, itemCount, itemHeight, overscan, className, Row]);

  if (itemCount === 0) {
    return (
      <div 
        className={cn("flex items-center justify-center text-muted-foreground", className)}
        style={{ height }}
      >
        No items to display
      </div>
    );
  }

  return memoizedList;
}

// Hook for managing virtual list state
export const useVirtualList = <T,>(
  items: T[],
  options: {
    height: number;
    itemHeight: number;
    threshold?: number;
  }
) => {
  const { height, itemHeight, threshold = 50 } = options;
  
  const shouldVirtualize = useMemo(() => {
    return items.length > threshold;
  }, [items.length, threshold]);

  const totalHeight = useMemo(() => {
    return Math.min(items.length * itemHeight, height);
  }, [items.length, itemHeight, height]);

  return {
    shouldVirtualize,
    totalHeight,
    itemCount: items.length
  };
};