import type { TableRow } from "@/types/table";

const DATA_URL = "https://microsoftedge.github.io/Demos/json-dummy-data/5MB.json";
const ITEMS_PER_PAGE = 50;

// Cache for the full dataset
let cachedData: TableRow[] | null = null;
let dataPromise: Promise<TableRow[]> | null = null;

// Transform raw data to our table format
function transformData(rawData: any[]): TableRow[] {
  return rawData.map((item, index) => ({
    id: item.id || `row-${index}`,
    bio: item.bio || item.address || "",
    name: item.name || `${item.first_name || ""} ${item.last_name || ""}`.trim() || "Unknown",
    language: item.language || item.city || "English",
    version: item.version || "v1.0",
    state: item.state || "active",
    createdDate: item.createdDate || "2020-05-04 09:18:16",
    ...item,
  }));
}

// Fetch and cache the full dataset
async function fetchFullData(): Promise<TableRow[]> {
  if (cachedData) {
    return cachedData;
  }

  if (dataPromise) {
    return dataPromise;
  }

  dataPromise = fetch(DATA_URL)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      const transformedData = transformData(data);
      cachedData = transformedData;
      return transformedData;
    })
    .catch((error) => {
      dataPromise = null;
      throw error;
    });

  return dataPromise;
}

export async function fetchTableData(
  page = 0,
  searchTerm = "",
  sortField: string | null = null,
  sortDirection: "asc" | "desc" = "asc"
): Promise<{ data: TableRow[]; hasMore: boolean; total: number }> {
  try {
    const fullData = await fetchFullData();

    // Apply search filter
    let filteredData = fullData;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredData = fullData.filter((row) => Object.values(row).some((value) => String(value).toLowerCase().includes(searchLower)));
    }

    if (sortField) {
      filteredData.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];

        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    const startIndex = page * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedData = filteredData.slice(startIndex, endIndex);
    const hasMore = endIndex < filteredData.length;

    return {
      data: paginatedData,
      hasMore,
      total: filteredData.length,
    };
  } catch (error) {
    console.error("Error fetching table data:", error);
    throw error;
  }
}

// Generate a new row with temporary ID
export function createNewRow(): TableRow {
  const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  return {
    id: tempId,
    bio: "",
    name: "",
    language: "English",
    version: "v1.0",
    state: "new customer",
    createdDate: new Date().toISOString().slice(0, 19).replace("T", " "),
  };
}
