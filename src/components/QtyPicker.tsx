import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import { Add, Remove } from '@mui/icons-material';

interface QtyPickerProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export const QtyPicker: React.FC<QtyPickerProps> = ({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
}) => {
  const handleDecrement = () => {
    if (!disabled && value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (!disabled && value < max) {
      onChange(value + 1);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        backgroundColor: disabled ? 'grey.100' : 'transparent',
      }}
    >
      <IconButton
        size="small"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        sx={{ borderRadius: 0 }}
      >
        <Remove />
      </IconButton>

      <Typography
        variant="body1"
        sx={{
          minWidth: '3ch',
          textAlign: 'center',
          fontWeight: 'bold',
          px: 1,
        }}
      >
        {value}
      </Typography>

      <IconButton
        size="small"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        sx={{ borderRadius: 0 }}
      >
        <Add />
      </IconButton>
    </Box>
  );
};