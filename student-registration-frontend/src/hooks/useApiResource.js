import { useCallback, useEffect, useState } from "react";
import { extractErrorMessage } from "../api/axios";

/**
 * Generic API resource hook.
 *
 * Supports backend responses such as:
 *
 * 1. { data: [...] }
 * 2. { items: [...] }
 * 3. { students: [...] }
 * 4. { courses: [...] }
 * 5. { departments: [...] }
 * 6. { instructors: [...] }
 * 7. [...]
 *
 * Also supports pagination metadata:
 * { total: 100 }
 * { count: 100 }
 */
export function useApiResource(
  fetchFn,
  { pageSize = 10, initialSort = null } = {}
) {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const [sortKey, setSortKey] = useState(initialSort);
  const [sortDir, setSortDir] = useState("asc");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [refreshTick, setRefreshTick] = useState(0);

  const refetch = useCallback(() => {
    setRefreshTick((t) => t + 1);
  }, []);

  const handleSort = useCallback(
    (key) => {
      if (sortKey === key) {
        setSortDir((currentDirection) =>
          currentDirection === "asc" ? "desc" : "asc"
        );
      } else {
        setSortKey(key);
        setSortDir("asc");
      }
    },
    [sortKey]
  );

  useEffect(() => {
    let isCurrent = true;

    async function loadData() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetchFn({
          page,
          limit: pageSize,
          search: search || undefined,
          sortBy: sortKey || undefined,
          sortDir: sortKey ? sortDir : undefined
        });

        if (!isCurrent) return;

        const responseData = response?.data;

        console.log("API RESPONSE:", responseData);

        let list = [];

        /*
         * Handle a bare array:
         *
         * [
         *   {...},
         *   {...}
         * ]
         */
        if (Array.isArray(responseData)) {
          list = responseData;
        }

        /*
         * Handle:
         *
         * {
         *   data: [...]
         * }
         */
        else if (Array.isArray(responseData?.data)) {
          list = responseData.data;
        }

        /*
         * Handle:
         *
         * {
         *   items: [...]
         * }
         */
        else if (Array.isArray(responseData?.items)) {
          list = responseData.items;
        }

        /*
         * Handle students:
         *
         * {
         *   students: [...]
         * }
         */
        else if (Array.isArray(responseData?.students)) {
          list = responseData.students;
        }

        /*
         * Handle courses:
         *
         * {
         *   courses: [...]
         * }
         */
        else if (Array.isArray(responseData?.courses)) {
          list = responseData.courses;
        }

        /*
         * Handle departments:
         *
         * {
         *   departments: [...]
         * }
         */
        else if (Array.isArray(responseData?.departments)) {
          list = responseData.departments;
        }

        /*
         * Handle instructors:
         *
         * {
         *   instructors: [...]
         * }
         */
        else if (Array.isArray(responseData?.instructors)) {
          list = responseData.instructors;
        }

        /*
         * Handle a nested response:
         *
         * {
         *   data: {
         *     students: [...]
         *   }
         * }
         */
        else if (Array.isArray(responseData?.data?.students)) {
          list = responseData.data.students;
        }

        else if (Array.isArray(responseData?.data?.courses)) {
          list = responseData.data.courses;
        }

        else if (Array.isArray(responseData?.data?.departments)) {
          list = responseData.data.departments;
        }

        else if (Array.isArray(responseData?.data?.instructors)) {
          list = responseData.data.instructors;
        }

        const totalCount =
          responseData?.total ??
          responseData?.count ??
          responseData?.pagination?.total ??
          list.length;

        setRows(list);
        setTotal(Number(totalCount) || 0);
      } catch (err) {
        if (!isCurrent) return;

        console.error("API RESOURCE ERROR:", err);

        setError(
          extractErrorMessage(
            err,
            "Unable to load records."
          )
        );

        setRows([]);
        setTotal(0);
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isCurrent = false;
    };

    // fetchFn is intentionally omitted because API objects are normally
    // recreated on render and should not trigger infinite requests.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    page,
    pageSize,
    search,
    sortKey,
    sortDir,
    refreshTick
  ]);

  /*
   * Reset pagination when search changes.
   */
  useEffect(() => {
    setPage(1);
  }, [search]);

  return {
    rows,
    total,

    page,
    setPage,

    pageSize,

    search,
    setSearch,

    sortKey,
    sortDir,
    handleSort,

    isLoading,
    error,

    refetch
  };
}