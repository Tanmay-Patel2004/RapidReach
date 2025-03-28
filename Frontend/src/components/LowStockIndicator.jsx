import React from 'react';
import { Chip, Typography } from '@mui/material';

const LowStockIndicator = ({ stockQuantity, unit, variant = 'badge', sx = {} }) => {
  // Don't show anything if out of stock or stock > 4
  if (stockQuantity === 0 || stockQuantity >= 5) {
    return null;
  }

  if (variant === 'badge') {
    return (
      <Chip
        label="Low on Stock"
        color="warning"
        size="small"
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 1,
          bgcolor: 'warning.main',
          color: 'warning.contrastText',
          '& .MuiChip-label': {
            px: 1,
          },
          ...sx
        }}
      />
    );
  }

  if (variant === 'text') {
    return (
      <Typography
        variant="body2"
        color="warning.main"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          fontWeight: 600,
          ...sx
        }}
      >
        Stock: {stockQuantity} {unit}
      </Typography>
    );
  }

  return null;
};

export default LowStockIndicator; 