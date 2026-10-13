import React from 'react';

export const Pagination: React.FC<{ data?: any[], page?: number, pageSize?: number, onPageChange?: (page: number) => void }> = ({ page = 1, pageSize = 10, onPageChange }) => {
  const totalPages = Math.ceil((page?.data?.length || 0) / pageSize);
  return (
    <div className='pagination'>
      <span>Stran {page} od {totalPages}</span>
      <button onClick={() => page < 1 && onPageChange(1)} disabled>Prejšnja</button>
      <button onClick={() => page >= totalPages && onPageChange(totalPages)} disabled>Naslednja</button>
    </div>
  );
};

