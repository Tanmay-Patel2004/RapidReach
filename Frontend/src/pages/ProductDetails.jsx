import React from 'react';
import { Box, Typography } from '@mui/material';
import LowStockIndicator from '../components/LowStockIndicator';

const ProductDetails = ({ product }) => {
  return (
    <Box sx={{ mb: 3, position: 'relative' }}>
      {/* Product title and other existing content */}
      <LowStockIndicator 
        stockQuantity={product.stockQuantity} 
        unit={product.unit} 
        variant="badge"
        sx={{
          top: 0,
          right: 0,
          '& .MuiChip-label': {
            px: 2,
            py: 0.5,
            fontSize: '0.9rem',
          },
        }}
      />
      
      {/* ... other product details ... */}
      
      <LowStockIndicator 
        stockQuantity={product.stockQuantity} 
        unit={product.unit} 
        variant="text"
        sx={{ 
          mt: 2,
          fontSize: '1rem'
        }}
      />
    </Box>
  );
};

export default ProductDetails; 