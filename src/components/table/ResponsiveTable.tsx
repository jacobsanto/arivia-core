import * as React from "react";
import { cn } from "@/lib/utils";
import MobileScroll from "@/components/mobile/MobileScroll";

export interface ResponsiveTableProps {
  headers?: React.ReactNode[];
  caption?: string;
  children: React.ReactNode; // table rows (tbody content)
  ariaLabel?: string;
  stickyHeader?: boolean;
  className?: string;
  dense?: boolean;
}

/**
 * ResponsiveTable
 * Ensures horizontal scroll on small screens and consistent table styling.
 */
export function ResponsiveTable({
  headers,
  caption,
  children,
  ariaLabel,
  stickyHeader = true,
  className,
  dense = false,
}: ResponsiveTableProps) {
  return (
    <div className={cn("w-full", className)}>
      <MobileScroll orientation="x" ariaLabel={ariaLabel}>
        <table className={cn("min-w-[640px] w-full text-sm", dense && "text-xs")}> 
          {caption && <caption className="text-left text-muted-foreground mb-2">{caption}</caption>}
          {headers && (
            <thead className={cn(stickyHeader && "sticky top-0 bg-background z-10")}> 
              <tr className="border-b">
                {headers.map((h, i) => (
                  <th key={i} className="text-left font-medium px-3 py-2 text-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody className="[&>tr:nth-child(even)]:bg-muted/30">
            {children}
          </tbody>
        </table>
      </MobileScroll>
    </div>
  );
}

export default ResponsiveTable;
