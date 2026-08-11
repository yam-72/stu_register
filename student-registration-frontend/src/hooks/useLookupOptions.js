
import { useEffect, useState } from "react";
import { extractErrorMessage } from "../api/axios";

export function useLookupOptions(fetchFn, mapper) {
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadOptions = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetchFn();

        if (!mounted) return;

        const data = response?.data;

        let list = [];

        if (Array.isArray(data?.students)) {
          list = data.students;
        } else if (Array.isArray(data?.courses)) {
          list = data.courses;
        } else if (Array.isArray(data?.data)) {
          list = data.data;
        } else if (Array.isArray(data?.items)) {
          list = data.items;
        } else if (Array.isArray(data)) {
          list = data;
        }

        const mapped = list
          .map((item) => mapper(item))
          .filter(Boolean);

        setOptions(mapped);

      } catch (err) {
        if (!mounted) return;

        setOptions([]);

        setError(
          extractErrorMessage(
            err,
            "Unable to load options."
          )
        );
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadOptions();

    return () => {
      mounted = false;
    };

    // IMPORTANT:
    // Do NOT put fetchFn or mapper in this dependency array.
    // They are passed functions and can cause an infinite loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    options,
    isLoading,
    error
  };
}

