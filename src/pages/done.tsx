import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
} from '@mui/material';
import { CheckCircle, Home, Refresh } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { Header } from '@/components/Header';

export default function DonePage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // 3秒後に自動でトップページに遷移
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const handleReturnHome = () => {
    router.push('/');
  };

  const handleNewTransaction = () => {
    router.push('/');
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'grey.50' }}>
      <Header title="処理完了" />

      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Paper
          elevation={4}
          sx={{
            p: 6,
            textAlign: 'center',
            backgroundColor: 'success.50',
            border: '2px solid',
            borderColor: 'success.main',
          }}
        >
          <CheckCircle
            sx={{
              fontSize: 80,
              color: 'success.main',
              mb: 3,
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': {
                  transform: 'scale(1)',
                },
                '50%': {
                  transform: 'scale(1.1)',
                },
                '100%': {
                  transform: 'scale(1)',
                },
              },
            }}
          />

          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            fontWeight="bold"
            color="success.dark"
          >
            処理完了
          </Typography>

          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ mb: 4 }}
          >
            ありがとうございました
          </Typography>

          <Box
            sx={{
              mb: 4,
              p: 2,
              backgroundColor: 'white',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'grey.200',
            }}
          >
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {countdown > 0 && (
                <>
                  {countdown}秒後にトップページに戻ります
                </>
              )}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleReturnHome}
              startIcon={<Home />}
              sx={{ px: 4 }}
            >
              トップページに戻る
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={handleNewTransaction}
              startIcon={<Refresh />}
              sx={{ px: 4 }}
            >
              新しい取引
            </Button>
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 4, fontStyle: 'italic' }}
          >
            学園祭お面ショップをご利用いただき<br />
            ありがとうございました
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}