import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Divider,
  Paper,
} from '@mui/material';
import { ShoppingCart, Schedule, ArrowForward } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useCartStore } from '@/store/cartStore';
import { Header } from '@/components/Header';

export default function HomePage() {
  const router = useRouter();
  const { setMode } = useCartStore();

  const handleModeSelect = (mode: 'sale' | 'rental') => {
    setMode(mode);
    router.push(`/select?mode=${mode}`);
  };

  const handleReturnFlow = () => {
    router.push('/return');
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'grey.50' }}>
      <Header title="お面販売・レンタル管理システム" />

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="primary">
            学園祭お面ショップ
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            ご利用方法をお選びください
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
              onClick={() => handleModeSelect('sale')}
            >
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <ShoppingCart sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h4" component="h2" gutterBottom fontWeight="bold">
                  購入
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  お面を購入されたい方はこちら
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  fullWidth
                  sx={{ py: 2, fontSize: '1.2rem' }}
                >
                  購入する
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
              onClick={() => handleModeSelect('rental')}
            >
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Schedule sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />
                <Typography variant="h4" component="h2" gutterBottom fontWeight="bold">
                  レンタル
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  お面をレンタルされたい方はこちら
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  endIcon={<ArrowForward />}
                  fullWidth
                  sx={{ py: 2, fontSize: '1.2rem' }}
                >
                  レンタルする
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            料金表
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              購入価格
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              <Chip label="お面: ¥500" color="primary" />
              <Chip label="民芸お面: ¥1,000" color="primary" />
              <Chip label="ビニール玩具: ¥300" color="primary" />
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              レンタル料金
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                お面・民芸お面のみ（ビニール玩具はレンタル不可）
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                <Chip label="1時間: ¥100" color="secondary" size="small" />
                <Chip label="3時間: ¥200" color="secondary" size="small" />
                <Chip label="6時間: ¥300" color="secondary" size="small" />
                <Chip label="終日: ¥400" color="secondary" size="small" />
              </Box>
              <Typography variant="body2" color="text.secondary">
                ※民芸お面は料金2倍 / レンタル時は販売価格を預かり、返却時に差額返金
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="outlined"
            onClick={handleReturnFlow}
            sx={{ px: 4, py: 1.5 }}
          >
            返却手続きはこちら
          </Button>
        </Box>
      </Container>
    </Box>
  );
}