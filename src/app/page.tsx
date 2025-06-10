"use client";

import { useEffect, useState } from "react";
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

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value.toLowerCase();

    setSearchQuery(searchTerm);

    // we want to reset the offset when handling a new query
    // otherwise, the query might return no data since an offset could be applied
    if (page > 1) setPage(1);
  };

  const onClick = () => {
    setSearchQuery("");
  };

  return (
    <main className="m-6 flex gap-4 flex-col">
      <h1>Solace Advocates</h1>

      <div>
        <p>
          Searching for: <span id="search-term">{searchQuery}</span>
        </p>
        <div className="flex flex-row gap-4">
          <Input value={searchQuery} onChange={onChange} />
          <Button onClick={onClick}>Reset Search</Button>
        </div>
      </div>

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
