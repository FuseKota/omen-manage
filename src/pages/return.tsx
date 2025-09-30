// レンタル返却画面
// 検索、時刻入力、料金計算、返却処理の完全実装

import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  Grid,
  Chip,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  FormControlLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import {
  AssignmentReturn,
  Search,
  AccessTime,
  CheckCircle,
  Block,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { Header } from '@/components/Header';
import type { RentalRow } from '@/pages/api/sheets/query';
import { formatTime, getCurrentJapanTime } from '@/lib/rental';
import { CATEGORY_LABELS } from '@/lib/constants';

interface ReturnResult {
  usedMinutes: number;
  plan: string;
  amount: number;
  deposit: number;
  refund: number;
}

export default function ReturnPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'number' | 'name'>('number');
  const [searchResults, setSearchResults] = useState<RentalRow[]>([]);
  const [selectedRental, setSelectedRental] = useState<RentalRow | null>(null);
  const [endTime, setEndTime] = useState(formatTime(getCurrentJapanTime()));
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' as 'success' | 'error' | 'info' });
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [returnResult, setReturnResult] = useState<ReturnResult | null>(null);
  const [returnType, setReturnType] = useState<'OK' | 'NG'>('OK');

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSnackbar({ open: true, message: '検索条件を入力してください', severity: 'error' });
      return;
    }

    setLoading(true);
    setSearchResults([]);
    setSelectedRental(null);

    try {
      const searchParams = searchType === 'number'
        ? { rentalNo: searchQuery.trim() }
        : { name: searchQuery.trim() };

      const response = await fetch('/api/sheets/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'rental',
          q: searchParams,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '検索に失敗しました');
      }

      setSearchResults(data.rows || []);

      if (data.count === 0) {
        setSnackbar({ open: true, message: '該当する未返却データが見つかりませんでした', severity: 'info' });
      } else {
        setSnackbar({ open: true, message: `${data.count}件の未返却データが見つかりました`, severity: 'success' });
      }
    } catch (error) {
      console.error('Search error:', error);
      const errorMessage = error instanceof Error ? error.message : '検索に失敗しました';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRental = (rental: RentalRow) => {
    setSelectedRental(rental);
    // 現在時刻を返却時刻にセット
    setEndTime(formatTime(getCurrentJapanTime()));
  };

  const handleConfirmReturn = () => {
    if (!selectedRental) return;
    setConfirmDialog(true);
  };

  const handleProcessReturn = async () => {
    if (!selectedRental) return;

    setProcessing(true);
    setConfirmDialog(false);

    try {
      const response = await fetch('/api/sheets/updateRental', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rentalNo: selectedRental.RentalNo,
          endTime: endTime,
          returnable: returnType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '返却処理に失敗しました');
      }

      setReturnResult(data);
      setSnackbar({
        open: true,
        message: `レンタル番号 ${selectedRental.RentalNo} の返却処理が完了しました`,
        severity: 'success'
      });

      // 検索結果から削除
      setSearchResults(prev => prev.filter(r => r.RentalNo !== selectedRental.RentalNo));
      setSelectedRental(null);

    } catch (error) {
      console.error('Return processing error:', error);
      const errorMessage = error instanceof Error ? error.message : '返却処理に失敗しました';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setProcessing(false);
    }
  };

  const handleBackHome = () => {
    router.push('/');
  };

  const handleNewSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedRental(null);
    setReturnResult(null);
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'grey.50' }}>
      <Header
        title="返却手続き"
        showBackButton
        backUrl="/"
      />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <AssignmentReturn sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            お面返却
          </Typography>
          <Typography variant="h6" color="text.secondary">
            レンタルしたお面の返却手続きを行います
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* 検索パネル */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 4, height: 'fit-content' }}>
              <Typography variant="h6" gutterBottom>
                レンタル検索
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button
                  variant={searchType === 'number' ? 'contained' : 'outlined'}
                  onClick={() => setSearchType('number')}
                >
                  番号検索
                </Button>
                <Button
                  variant={searchType === 'name' ? 'contained' : 'outlined'}
                  onClick={() => setSearchType('name')}
                >
                  名前検索
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
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />

              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Search />}
                onClick={handleSearch}
                disabled={!searchQuery.trim() || loading}
                size="large"
                fullWidth
              >
                検索
              </Button>

              {searchResults.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    検索結果（{searchResults.length}件）
                  </Typography>
                  <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                    {searchResults.map((rental) => (
                      <ListItem
                        key={rental.RentalNo}
                        onClick={() => handleSelectRental(rental)}
                        sx={{
                          border: 1,
                          borderColor: selectedRental?.RentalNo === rental.RentalNo ? 'primary.main' : 'divider',
                          borderRadius: 1,
                          mb: 1,
                          cursor: 'pointer',
                          backgroundColor: selectedRental?.RentalNo === rental.RentalNo ? 'primary.50' : 'transparent',
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          },
                        }}
                      >
                        <ListItemText
                          primary={`#${rental.RentalNo} - ${rental.ProductName}`}
                          secondary={
                            <Box>
                              <Typography variant="body2">
                                お客様: {rental.Name || '（お名前なし）'}
                              </Typography>
                              <Typography variant="body2">
                                開始: {rental.Date} {rental.StartTime}
                              </Typography>
                              <Chip
                                label={CATEGORY_LABELS[rental.Category as keyof typeof CATEGORY_LABELS]}
                                size="small"
                                color="secondary"
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* 返却処理パネル */}
          <Grid item xs={12} md={6}>
            {selectedRental ? (
              <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h6" gutterBottom>
                  返却処理
                </Typography>

                <Card sx={{ mb: 3, backgroundColor: 'info.50' }}>
                  <CardContent>
                    <Typography variant="h5" gutterBottom>
                      #{selectedRental.RentalNo}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>商品:</strong> {selectedRental.ProductName}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>お客様:</strong> {selectedRental.Name || '（お名前なし）'}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>開始:</strong> {selectedRental.Date} {selectedRental.StartTime}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>預かり金:</strong> ¥{selectedRental.Deposit}
                    </Typography>
                  </CardContent>
                </Card>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    返却時刻
                  </Typography>
                  <TextField
                    fullWidth
                    type="time"
                    value={endTime.substring(0, 5)} // HH:mm 形式
                    onChange={(e) => setEndTime(`${e.target.value}:00`)}
                    variant="outlined"
                    InputProps={{
                      startAdornment: <AccessTime sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    現在時刻: {formatTime(getCurrentJapanTime())}
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    返却状態
                  </Typography>
                  <RadioGroup
                    value={returnType}
                    onChange={(e) => setReturnType(e.target.value as 'OK' | 'NG')}
                  >
                    <FormControlLabel
                      value="OK"
                      control={<Radio />}
                      label="正常返却（料金確定・返金あり）"
                    />
                    <FormControlLabel
                      value="NG"
                      control={<Radio />}
                      label="返却不可（破損・紛失・返金なし）"
                    />
                  </RadioGroup>
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    color={returnType === 'OK' ? 'success' : 'error'}
                    startIcon={returnType === 'OK' ? <CheckCircle /> : <Block />}
                    onClick={handleConfirmReturn}
                    disabled={processing}
                      fullWidth
                  >
                    {returnType === 'OK' ? '返却確定' : '返却不可で処理'}
                  </Button>
                </Box>
              </Paper>
            ) : (
              <Paper elevation={2} sx={{ p: 4, backgroundColor: 'grey.100', textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  左側で検索して、返却するレンタルを選択してください
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>

        {/* 返却結果表示 */}
        {returnResult && (
          <Paper elevation={4} sx={{ p: 4, mt: 4, backgroundColor: 'success.50' }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircle sx={{ mr: 2, color: 'success.main' }} />
              返却完了
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="primary">使用時間</Typography>
                  <Typography variant="h4">{Math.floor(returnResult.usedMinutes / 60)}h {returnResult.usedMinutes % 60}m</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="primary">プラン</Typography>
                  <Typography variant="h4">{returnResult.plan}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="primary">料金</Typography>
                  <Typography variant="h4">¥{returnResult.amount}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="success.main">返金額</Typography>
                  <Typography variant="h4" color="success.main">¥{returnResult.refund}</Typography>
                </Box>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button
                variant="contained"
                onClick={handleNewSearch}
                size="large"
                sx={{ mr: 2 }}
              >
                新しい返却処理
              </Button>
              <Button
                variant="outlined"
                onClick={handleBackHome}
                size="large"
              >
                トップページに戻る
              </Button>
            </Box>
          </Paper>
        )}

        {/* 確認ダイアログ */}
        <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            返却確認
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              以下の内容で返却処理を実行しますか？
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>レンタル番号:</strong> #{selectedRental?.RentalNo}
              </Typography>
              <Typography variant="body2">
                <strong>商品:</strong> {selectedRental?.ProductName}
              </Typography>
              <Typography variant="body2">
                <strong>返却時刻:</strong> {endTime}
              </Typography>
              <Typography variant="body2">
                <strong>返却状態:</strong> {returnType === 'OK' ? '正常返却' : '返却不可'}
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialog(false)}>キャンセル</Button>
            <Button
              onClick={handleProcessReturn}
              variant="contained"
              disabled={processing}
              startIcon={processing ? <CircularProgress size={20} color="inherit" /> : undefined}
            >
              実行
            </Button>
          </DialogActions>
        </Dialog>

        {/* スナックバー */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          <Alert
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}