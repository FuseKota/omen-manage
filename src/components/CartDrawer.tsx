import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Divider,
  Chip,
} from '@mui/material';
import { Delete, ShoppingCart } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useCartStore } from '@/store/cartStore';
import { getPlanDisplayName } from '@/lib/pricing';
import { QtyPicker } from './QtyPicker';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ open, onClose }) => {
  const router = useRouter();
  const {
    mode,
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalQuantity,
    getDepositAmount,
  } = useCartStore();

  const handleProceedToConfirm = () => {
    onClose();
    router.push('/confirm');
  };

  const totalPrice = getTotalPrice();
  const totalQuantity = getTotalQuantity();
  const depositAmount = getDepositAmount();

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 400, p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <ShoppingCart />
          <Typography variant="h5" component="h2">
            カート
          </Typography>
          <Chip
            label={mode === 'sale' ? '購入' : 'レンタル'}
            color="primary"
            size="small"
          />
        </Box>

        {items.length === 0 ? (
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              カートは空です
            </Typography>
          </Box>
        ) : (
          <>
            <List sx={{ flexGrow: 1, overflow: 'auto' }}>
              {items.map((item, index) => (
                <ListItem key={`${item.product.id}-${index}`} divider>
                  <ListItemText
                    primary={item.product.name}
                    secondary={
                      <>
                        ¥{item.product.salePrice} × {item.quantity}
                        {mode === 'rental' && item.rentalPlan && (
                          <>
                            <br />
                            プラン: {getPlanDisplayName(item.rentalPlan)}
                          </>
                        )}
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <QtyPicker
                        value={item.quantity}
                        onChange={(qty) => updateQuantity(item.product.id, qty)}
                        min={1}
                        max={10}
                      />
                      <IconButton
                        edge="end"
                        onClick={() => removeFromCart(item.product.id)}
                        color="error"
                        size="small"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>合計数量:</span>
                <span>{totalQuantity}点</span>
              </Typography>

              {mode === 'sale' ? (
                <Typography variant="h6" sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                  <span>合計金額:</span>
                  <span>¥{totalPrice}</span>
                </Typography>
              ) : (
                <>
                  <Typography variant="body1" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>預かり金:</span>
                    <span>¥{depositAmount}</span>
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    ※実際の料金は返却時に確定します
                  </Typography>
                </>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                onClick={clearCart}
                sx={{ flex: 1 }}
              >
                カートを空にする
              </Button>
              <Button
                variant="contained"
                onClick={handleProceedToConfirm}
                sx={{ flex: 2 }}
                size="large"
              >
                確認画面へ
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Drawer>
  );
};