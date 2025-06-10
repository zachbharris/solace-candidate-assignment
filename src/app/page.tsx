"use client";

import { debounce } from "lodash";
import { useEffect, useMemo, useState, useCallback } from "react";
import { DataTable } from "@/components/ui/data-table";
import { columns, type Advocate } from "./columns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { parseAsInteger, useQueryState } from "nuqs";

type AdvocatesQuery = {
  data: Advocate[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export default function Home() {
  // handle tracking our current page in search parameters
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [searchQuery, setSearchQuery] = useQueryState("query", {
    defaultValue: "",
  });

  const { data, isPending, isError, error, isFetching, isPlaceholderData } =
    useQuery<AdvocatesQuery>({
      queryKey: ["advocates", page, searchQuery],
      queryFn: async () => {
        const params = new URLSearchParams({
          page: page.toString(),
          ...(searchQuery && { query: searchQuery }),
        });

        return fetch(`/api/advocates?${params.toString()}`).then((response) =>
          response.json(),
        );
      },
      placeholderData: keepPreviousData,
    });

  const advocates: AdvocatesQuery["data"] =
    data?.data || ([] as AdvocatesQuery["data"]);
  const pagination: AdvocatesQuery["pagination"] = data?.pagination || {
    currentPage: 1,
    pageSize: 0,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  // local state to handle immediate input updates
  const [inputValue, setInputValue] = useState(searchQuery);

  // sync input value with searchQuery when searchQuery changes from URL
  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  // Create debounced function with useCallback to avoid recreating it
  const debouncedSearchQuery = useCallback(
    debounce((value: string) => {
      setSearchQuery(value);
      setPage(1);
    }, 500),
    [], // Empty dependency array since setSearchQuery and setPage should be stable
  );

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedSearchQuery.cancel();
    };
  }, [debouncedSearchQuery]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;

    // update local input value immediately
    setInputValue(searchTerm);

    // debounce the search query update
    debouncedSearchQuery(searchTerm);
  };

  const onClick = () => {
    debouncedSearchQuery.cancel(); // cancel any pending debounced calls

    // reset both local and url state
    setInputValue("");
    setSearchQuery("");
    setPage(1);
  };

  return (
    <main className="m-6 flex gap-4 flex-col">
      <h1>Solace Advocates</h1>

      <div>
        <p>
          Searching for: <span id="search-term">{searchQuery}</span>
        </p>
        <div className="flex flex-row gap-4">
          <Input
            value={inputValue}
            onChange={onChange}
            placeholder="Search advocates..."
          />
          <Button onClick={onClick}>Reset Search</Button>
        </div>
      </div>

      {isFetching && <p className="text-sm text-gray-500">Searching...</p>}

      <DataTable columns={columns} data={advocates} />
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              disabled={!pagination.hasPreviousPage}
              onClick={() => setPage(page - 1)}
            />
          </PaginationItem>
          {Array.from({ length: pagination.totalPages }, (_, idx) => (
            <PaginationItem key={idx}>
              <Button
                className={`px-3 py-1 ${
                  pagination.currentPage === idx + 1 ? "font-bold" : ""
                }`}
                size="default"
                variant="ghost"
                onClick={() => setPage(idx + 1)}
              >
                {idx + 1}
              </Button>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              disabled={!pagination.hasNextPage}
              onClick={() => setPage(page + 1)}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </main>
  );
}
