import React from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useCartStore } from '@/store/cartStore';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  backUrl?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = false,
  backUrl = '/',
}) => {
  const router = useRouter();
  const { mode, getTotalQuantity } = useCartStore();

  const handleBackClick = () => {
    router.push(backUrl);
  };

  const totalQuantity = getTotalQuantity();

  return (
    <AppBar position="sticky" color="primary">
      <Toolbar>
        {showBackButton && (
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleBackClick}
            aria-label="戻る"
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
        )}

        <Typography variant="h5" component="h1" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          {title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {mode && (
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              {mode === 'sale' ? '購入モード' : 'レンタルモード'}
            </Typography>
          )}

          {totalQuantity > 0 && (
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              カート: {totalQuantity}点
            </Typography>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};