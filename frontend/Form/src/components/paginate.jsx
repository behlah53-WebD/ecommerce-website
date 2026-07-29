import React from 'react';
import { Box, Pagination as MuiPagination, alpha } from '@mui/material';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  
  if (!totalPages || totalPages <= 1) return null;

  const handleChange = (event, value) => {
    onPageChange(value);
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        p: 3, 
        borderTop: '1px solid #f1f5f9',
        background: '#fafafa'
      }}
    >
      <MuiPagination
        count={totalPages}
        page={currentPage}
        onChange={handleChange}
        shape="rounded"
        size="large"
        sx={{
          '& .MuiPaginationItem-root': {
            color: '#64748b',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            fontWeight: 600,
            '&:hover': {
              background: alpha('#6366f1', 0.06),
              color: '#4f46e5',
              borderColor: alpha('#6366f1', 0.4),
            },
            '&.Mui-selected': {
              background: 'linear-gradient(135deg, #4f46e5 0%, #0284c7 100%)',
              color: '#fff',
              fontWeight: 700,
              border: 'none',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4338ca 0%, #0369a1 100%)',
              },
            },
            '&.MuiPaginationItem-ellipsis': {
              border: 'none',
              color: '#94a3b8',
            }
          },
        }}
      />
    </Box>
  );
};

export default Pagination;