import React from "react";
import { useLanguage } from "@/hooks/use-language";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  totalCount?: number;
  hasPrevious: boolean;
  hasNext: boolean;
  itemsPerPage: number;
  limit?: number;
}

interface DataPaginationProps {
  pagination: PaginationData;
  currentPage?: string | number;
  onPageChange: (page: string) => void;
  pageSize?: string | number;
  onPageSizeChange?: (limit: string) => void;
  showPageSizeSelector?: boolean;
  pageSizeOptions?: number[];
  showInfo?: boolean;
  className?: string;
  isLoading?: boolean;
}

export function DataPagination({
  pagination,
  onPageChange,
  pageSize,
  onPageSizeChange,
  showPageSizeSelector = false,
  pageSizeOptions = [5, 10, 20, 50],
  showInfo = true,
  className = "mt-6",
}: DataPaginationProps) {
  const { t, isRTL } = useLanguage();

  // Calculate range of items being shown
  const itemsPerPage = pagination.itemsPerPage || pagination.limit || 10;
  const totalItems = pagination.totalItems || pagination.totalCount || 0;

  const startItem =
    totalItems > 0 ? (pagination.currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(pagination.currentPage * itemsPerPage, totalItems);

  // Generate page numbers to show (max 7 pages visible)
  const getVisiblePages = () => {
    const total = pagination.totalPages;
    const current = pagination.currentPage;

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    if (current <= 4) {
      return [1, 2, 3, 4, 5, "...", total];
    }

    if (current >= total - 3) {
      return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
    }

    return [1, "...", current - 1, current, current + 1, "...", total];
  };

  const visiblePages = getVisiblePages();

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Info and page size selector */}
      <div
        className={`flex items-center justify-between
       ${!showPageSizeSelector ? "flex-col" : ""}
          ${isRTL ? "flex-row-reverse" : ""}`}>
        {/* Results info */}
        {showInfo && (
          <div
            className={`text-sm text-muted-foreground ${
              isRTL ? "text-right" : "text-left"
            }`}>
            {totalItems > 0 ? (
              <span>
                {t("pagination", "showing")} {startItem} {t("pagination", "to")}{" "}
                {endItem} {t("pagination", "of")} {totalItems}{" "}
                {t("pagination", "results")}
              </span>
            ) : (
              <span>{t("pagination", "noResults")}</span>
            )}
          </div>
        )}

        {/* Page size selector */}
        {showPageSizeSelector && onPageSizeChange && (
          <div
            className={`flex items-center gap-2 ${
              isRTL ? "flex-row-reverse" : ""
            }`}>
            <span className="text-sm text-muted-foreground">
              {t("pagination", "itemsPerPage")}
            </span>
            <Select
              value={pageSize?.toString() || "10"}
              onValueChange={(value) => {
                onPageSizeChange?.(value);
                onPageChange("1");
              }}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Pagination controls */}
      {pagination.totalPages > 1 && (
        <Pagination className={isRTL ? "rtl" : "ltr"}>
          <PaginationContent className={isRTL ? "flex-row-reverse" : ""}>
            {/* Previous button */}
            <PaginationItem>
              <PaginationPrevious
                onClick={() =>
                  pagination.hasPrevious &&
                  onPageChange((pagination.currentPage - 1).toString())
                }
                className={
                  !pagination.hasPrevious
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }>
                <span className={isRTL ? "mx-2" : "ml-2"}>
                  {t("pagination", "previous")}
                </span>
              </PaginationPrevious>
            </PaginationItem>

            {/* First page button */}
            {pagination.currentPage > 3 && pagination.totalPages > 7 && (
              <>
                <PaginationItem>
                  <PaginationLink
                    isActive={false}
                    onClick={() => onPageChange("1")}
                    className="cursor-pointer">
                    1
                  </PaginationLink>
                </PaginationItem>
                {pagination.currentPage > 4 && (
                  <PaginationItem>
                    <span className="px-3 py-2 text-muted-foreground">...</span>
                  </PaginationItem>
                )}
              </>
            )}

            {/* Page numbers */}
            {visiblePages.map((page, index) => (
              <PaginationItem key={index}>
                {page === "..." ? (
                  <span className="px-3 py-2 text-muted-foreground">...</span>
                ) : (
                  <PaginationLink
                    isActive={pagination.currentPage === page}
                    onClick={() => onPageChange(page.toString())}
                    className="cursor-pointer">
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            {/* Last page button */}
            {pagination.currentPage < pagination.totalPages - 2 &&
              pagination.totalPages > 7 && (
                <>
                  {pagination.currentPage < pagination.totalPages - 3 && (
                    <PaginationItem>
                      <span className="px-3 py-2 text-muted-foreground">
                        ...
                      </span>
                    </PaginationItem>
                  )}
                  <PaginationItem>
                    <PaginationLink
                      isActive={false}
                      onClick={() =>
                        onPageChange(pagination.totalPages.toString())
                      }
                      className="cursor-pointer">
                      {pagination.totalPages}
                    </PaginationLink>
                  </PaginationItem>
                </>
              )}

            {/* Next button */}
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  pagination.hasNext &&
                  onPageChange((pagination.currentPage + 1).toString())
                }
                className={
                  !pagination.hasNext
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }>
                <span className={isRTL ? "ml-2" : "mx-2"}>
                  {t("pagination", "next")}
                </span>
              </PaginationNext>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

export default DataPagination;
