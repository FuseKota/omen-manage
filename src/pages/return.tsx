import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Divider,
} from '@mui/material';
import { AssignmentReturn, Search, Build } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { Header } from '@/components/Header';

export default function ReturnPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'number' | 'name'>('number');

  const handleSearch = () => {
    // プレースホルダー実装
    alert('返却機能は次のタスクで実装予定です');
  };

  const handleBackHome = () => {
    router.push('/');
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'grey.50' }}>
      <Header
        title="返却手続き"
        showBackButton
        backUrl="/"
      />

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <AssignmentReturn sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            お面返却
          </Typography>
          <Typography variant="h6" color="text.secondary">
            レンタルしたお面の返却手続きを行います
          </Typography>
        </Box>

        {/* 開発中のお知らせ */}
        <Alert severity="info" sx={{ mb: 4 }} icon={<Build />}>
          <Typography variant="body1" fontWeight="bold" gutterBottom>
            この機能は開発中です
          </Typography>
          <Typography variant="body2">
            返却フローは次のタスクで実装予定です。以下の機能が追加される予定です：
          </Typography>
          <ul style={{ marginTop: '8px', marginBottom: '8px' }}>
            <li>レンタル番号または名前での検索</li>
            <li>返却時刻の入力と料金自動計算</li>
            <li>差額返金額の表示</li>
            <li>レンタル管理スプレッドシートの更新</li>
          </ul>
        </Alert>

        <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            レンタル検索（プレビュー版）
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              variant={searchType === 'number' ? 'contained' : 'outlined'}
              onClick={() => setSearchType('number')}
            >
              レンタル番号で検索
            </Button>
            <Button
              variant={searchType === 'name' ? 'contained' : 'outlined'}
              onClick={() => setSearchType('name')}
            >
              お名前で検索
            </Button>
          </Box>

          <TextField
            fullWidth
            placeholder={
              searchType === 'number'
                ? 'レンタル番号を入力（例：1, 2, 3...）'
                : 'お客様のお名前を入力'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="outlined"
            sx={{ mb: 3 }}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<Search />}
              onClick={handleSearch}
              disabled={!searchQuery.trim()}
              sx={{ flex: 1 }}
            >
              検索して返却手続きへ
            </Button>
          </Box>
        </Paper>

        <Paper elevation={2} sx={{ p: 3, backgroundColor: 'grey.100' }}>
          <Typography variant="h6" gutterBottom>
            返却手続きの流れ（予定）
          </Typography>

          <Box component="ol" sx={{ pl: 2 }}>
            <Box component="li" sx={{ mb: 1 }}>
              <Typography variant="body2">レンタル番号または名前で検索</Typography>
            </Box>
            <Box component="li" sx={{ mb: 1 }}>
              <Typography variant="body2">該当するレンタル情報を表示</Typography>
            </Box>
            <Box component="li" sx={{ mb: 1 }}>
              <Typography variant="body2">返却時刻を入力（現在時刻が自動入力）</Typography>
            </Box>
            <Box component="li" sx={{ mb: 1 }}>
              <Typography variant="body2">使用時間と料金を自動計算</Typography>
            </Box>
            <Box component="li" sx={{ mb: 1 }}>
              <Typography variant="body2">返金額を確認・表示</Typography>
            </Box>
            <Box component="li" sx={{ mb: 1 }}>
              <Typography variant="body2">レンタル管理データを更新</Typography>
            </Box>
            <Box component="li">
              <Typography variant="body2">返却完了</Typography>
            </Box>
          </Box>
        </Paper>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="outlined"
            onClick={handleBackHome}
            size="large"
            sx={{ px: 4 }}
          >
            トップページに戻る
          </Button>
        </Box>
      </Container>
    </Box>
  );
}