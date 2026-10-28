
import React from "react";

export default function Pagination({
  totalPages = 1,
  currentPage = 1,
  onPageChange,
}) {
  if (totalPages <= 1) return null;

  const startPage = Math.max(1, currentPage - 3);
  const endPage = Math.min(totalPages, currentPage + 3);

  const handleClick = (newPage) => {
    if (
      newPage < 1 ||
      newPage > totalPages ||
      newPage === currentPage
    ) {
      return;
    }

    onPageChange(newPage);
  };

  return (
    <div className="flex items-center gap-2 justify-center mt-12">
      <button
        type="button"
        onClick={() => handleClick(1)}
        disabled={currentPage === 1}
        className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-200"
      >
        First
      </button>

      <button
        type="button"
        onClick={() => handleClick(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-200"
      >
        Previous
      </button>

      {Array.from(
        { length: endPage - startPage + 1 },
        (_, i) => startPage + i
      ).map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => handleClick(p)}
          disabled={p === currentPage}
          className={`px-3 py-1 border rounded ${
            p === currentPage
              ? "bg-amber-800 text-white font-bold"
              : "hover:bg-gray-200"
          }`}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        onClick={() => handleClick(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-200"
      >
        Next
      </button>

      <button
        type="button"
        onClick={() => handleClick(totalPages)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-200"
      >
        Last
      </button>
    </div>
  );
}
