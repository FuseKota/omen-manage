import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Tabs,
  Tab,
  Grid,
  Fab,
  Typography,
  Chip,
} from '@mui/material';
import { ShoppingCart } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useCartStore } from '@/store/cartStore';
import { Header } from '@/components/Header';
import { ProductCard } from '@/components/ProductCard';
import { CartDrawer } from '@/components/CartDrawer';
import { PRODUCTS, CATEGORY_LABELS, Category, Mode } from '@/lib/constants';

export default function SelectPage() {
  const router = useRouter();
  const { mode, setMode, getTotalQuantity } = useCartStore();
  const [currentTab, setCurrentTab] = useState<Category>('OMEN');
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  const totalQuantity = getTotalQuantity();

  useEffect(() => {
    const urlMode = router.query.mode as Mode;
    if (urlMode && (urlMode === 'sale' || urlMode === 'rental')) {
      setMode(urlMode);
    } else {
      router.push('/');
    }
  }, [router.query.mode, setMode, router]);

  const getProductsByCategory = (category: Category) => {
    return PRODUCTS.filter(product => product.category === category);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: Category) => {
    setCurrentTab(newValue);
  };

  if (!mode) {
    return null; // ローディング中
  }

  const categories: Category[] = ['OMEN', 'VINYL'];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'grey.50' }}>
      <Header
        title={mode === 'sale' ? '購入 - 商品選択' : 'レンタル - 商品選択'}
        showBackButton
        backUrl="/"
      />

      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Chip
            label={mode === 'sale' ? '購入モード' : 'レンタルモード'}
            color={mode === 'sale' ? 'primary' : 'secondary'}
            size="large"
            sx={{ fontSize: '1rem', px: 2, py: 1 }}
          />
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            centered
            textColor="primary"
            indicatorColor="primary"
            variant="fullWidth"
          >
            {categories.map((category) => (
              <Tab
                key={category}
                label={CATEGORY_LABELS[category]}
                value={category}
                sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}
              />
            ))}
          </Tabs>
        </Box>

        <Box sx={{ mb: 3 }}>
          {categories.map((category) => (
            <Box
              key={category}
              sx={{
                display: currentTab === category ? 'block' : 'none',
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                {CATEGORY_LABELS[category]}
                {category === 'VINYL' && mode === 'rental' && (
                  <Chip
                    label="レンタル不可"
                    color="error"
                    size="small"
                    sx={{ ml: 2 }}
                  />
                )}
              </Typography>

              <Grid container spacing={3}>
                {getProductsByCategory(category).map((product) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                    <ProductCard product={product} mode={mode} />
                  </Grid>
                ))}
              </Grid>

              {getProductsByCategory(category).length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    この商品に商品はありません
                  </Typography>
                </Box>
              )}
            </Box>
          ))}
        </Box>

        {/* カートFAB */}
        {totalQuantity > 0 && (
          <Fab
            color="primary"
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 1000,
            }}
            onClick={() => setCartDrawerOpen(true)}
          >
            <Box sx={{ position: 'relative' }}>
              <ShoppingCart />
              <Box
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  backgroundColor: 'error.main',
                  color: 'white',
                  borderRadius: '50%',
                  width: 20,
                  height: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                }}
              >
                {totalQuantity}
              </Box>
            </Box>
          </Fab>
        )}

        {/* カートドロワー */}
        <CartDrawer
          open={cartDrawerOpen}
          onClose={() => setCartDrawerOpen(false)}
        />
      </Container>
    </Box>
  );
}