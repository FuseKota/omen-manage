import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Button,
  Tooltip,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import { Block } from '@mui/icons-material';
import { Product, RentalPlan, CATEGORY_LABELS } from '@/lib/constants';
import { getRentalEstimateText, getPlanDisplayName } from '@/lib/pricing';
import { useCartStore } from '@/store/cartStore';
import { QtyPicker } from './QtyPicker';

interface ProductCardProps {
  product: Product;
  mode: 'sale' | 'rental';
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, mode }) => {
  const [quantity, setQuantity] = useState(1);
  const [rentalPlan, setRentalPlan] = useState<RentalPlan>('1h');
  const { addToCart } = useCartStore();

  const isDisabled = mode === 'rental' && !product.rentalAllowed;

  const handleAddToCart = () => {
    if (isDisabled) return;

    addToCart(product, quantity, mode === 'rental' ? rentalPlan : undefined);
    setQuantity(1); // リセット
  };

  const getPriceDisplay = () => {
    if (mode === 'sale') {
      return `¥${product.salePrice}`;
    } else {
      return getRentalEstimateText(product.category, rentalPlan);
    }
  };

  const getStockDisplay = () => {
    // ダミー在庫表示（仕様通り）
    const statuses = ['未使用', '消毒済み', '使用中'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    return randomStatus;
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        opacity: isDisabled ? 0.5 : 1,
        position: 'relative',
      }}
    >
      {isDisabled && (
        <Tooltip title="ビニール玩具はレンタルできません">
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 1,
              backgroundColor: 'error.main',
              borderRadius: '50%',
              p: 0.5,
            }}
          >
            <Block sx={{ color: 'white', fontSize: 20 }} />
          </Box>
        </Tooltip>
      )}

      <CardMedia
        sx={{
          height: 140,
          backgroundColor: 'grey.200',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        title={product.name}
      >
        <Typography variant="h6" color="text.secondary">
          画像プレースホルダ
        </Typography>
      </CardMedia>

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="h6" component="h3" gutterBottom>
          {product.name}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {CATEGORY_LABELS[product.category]}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          状態: {getStockDisplay()}
        </Typography>

        <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
          {getPriceDisplay()}
        </Typography>

        {mode === 'rental' && !isDisabled && (
          <FormControl component="fieldset" sx={{ mt: 1 }}>
            <FormLabel component="legend" sx={{ fontSize: '0.9rem' }}>
              目安プラン
            </FormLabel>
            <RadioGroup
              row
              value={rentalPlan}
              onChange={(e) => setRentalPlan(e.target.value as RentalPlan)}
              sx={{ mt: 0.5 }}
            >
              {(['1h', '3h', '6h', 'allday'] as RentalPlan[]).map((plan) => (
                <FormControlLabel
                  key={plan}
                  value={plan}
                  control={<Radio size="small" />}
                  label={getPlanDisplayName(plan)}
                  sx={{ fontSize: '0.8rem' }}
                />
              ))}
            </RadioGroup>
          </FormControl>
        )}

        <Box sx={{ mt: 'auto', pt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <QtyPicker
              value={quantity}
              onChange={setQuantity}
              min={1}
              max={10}
              disabled={isDisabled}
            />
          </Box>

          <Button
            variant="contained"
            fullWidth
            onClick={handleAddToCart}
            disabled={isDisabled}
            size="large"
          >
            カートに入れる
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};