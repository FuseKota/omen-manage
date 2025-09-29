import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  CircularProgress,
} from '@mui/material';
import { Receipt, Error as ErrorIcon } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useCartStore } from '@/store/cartStore';
import { Header } from '@/components/Header';
import { NoticeBlock } from '@/components/NoticeBlock';
import { getCurrentJapanTime, formatDate, formatTime, getRentalTicketData } from '@/lib/rental';
import { STAFF_NAME } from '@/lib/constants';
import { getPlanDisplayName } from '@/lib/pricing';

export default function ConfirmPage() {
  const router = useRouter();
  const { mode, items, clearCart, getTotalPrice, getDepositAmount } = useCartStore();
  const [customerName, setCustomerName] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [rentalNumber, setRentalNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [ticketDialog, setTicketDialog] = useState(false);
  const [ticketData, setTicketData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!mode || items.length === 0) {
      router.push('/');
      return;
    }

    // レンタルの場合は番号を事前生成
    if (mode === 'rental') {
      generateRentalNumber();
    }
  }, [mode, items, router]);

  const generateRentalNumber = async () => {
    try {
      // 暫定：localStorage から番号生成
      const currentMax = localStorage.getItem('lastRentalNumber');
      const nextNumber = currentMax ? parseInt(currentMax) + 1 : 1;
      setRentalNumber(nextNumber.toString());
    } catch (err) {
      console.error('Error generating rental number:', err);
      setError('レンタル番号の生成に失敗しました');
    }
  };

  const handleConfirm = async () => {
    if (mode === 'rental' && !agreed) {
      setError('注意事項に同意してください');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const currentTime = getCurrentJapanTime();
      const rows: string[][] = [];

      if (mode === 'sale') {
        // 購入の場合：Salesシートに書き込み
        items.forEach((item) => {
          const row = [
            formatDate(currentTime), // Date
            formatTime(currentTime), // Time
            item.product.category,   // Category
            item.product.name,       // ProductName
            item.quantity.toString(), // Quantity
            item.product.salePrice.toString(), // UnitPrice
            (item.product.salePrice * item.quantity).toString(), // Subtotal
            STAFF_NAME, // Staff
            '', // Note
          ];
          rows.push(row);
        });

        // API呼び出し
        const response = await fetch('/api/sheets/append', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'sale', rows }),
        });

        if (!response.ok) {
          throw new Error('販売データの保存に失敗しました');
        }

      } else {
        // レンタルの場合：Rentalsシートに書き込み
        localStorage.setItem('lastRentalNumber', rentalNumber); // 番号を保存

        items.forEach((item) => {
          const planText = item.rentalPlan ? `${getPlanDisplayName(item.rentalPlan)}(目安)` : '';
          const row = [
            rentalNumber,                    // RentalNo
            customerName || '',              // Name
            item.product.name,               // ProductName
            item.product.category,           // Category
            formatDate(currentTime),         // Date
            formatTime(currentTime),         // StartTime
            '',                             // EndTime (空)
            '',                             // UsedMinutes (空)
            planText,                       // Plan
            '',                             // Amount (空)
            item.product.salePrice.toString(), // Deposit
            '',                             // Refund (空)
            '',                             // Returnable (空)
            STAFF_NAME,                     // Staff
            '',                             // Note
          ];
          rows.push(row);
        });

        // API呼び出し
        const response = await fetch('/api/sheets/append', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'rental', rows }),
        });

        if (!response.ok) {
          throw new Error('レンタルデータの保存に失敗しました');
        }

        // 貸出票データ準備
        const productNames = items.map(item => item.product.name);
        const ticket = getRentalTicketData(rentalNumber, customerName, productNames, currentTime);
        setTicketData(ticket);
        setTicketDialog(true);
      }

      // 成功時の処理
      clearCart();

      if (mode === 'sale') {
        router.push('/done');
      }
      // レンタルの場合は貸出票表示後に/doneに遷移

    } catch (err) {
      console.error('Error during confirm:', err);
      setError((err as Error).message || '処理中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleTicketClose = () => {
    setTicketDialog(false);
    router.push('/done');
  };

  const totalPrice = getTotalPrice();
  const depositAmount = getDepositAmount();

  if (!mode || items.length === 0) {
    return null;
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'grey.50' }}>
      <Header
        title={mode === 'sale' ? '購入確認' : 'レンタル確認'}
        showBackButton
        backUrl="/select"
      />

      <Container maxWidth="md" sx={{ py: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Chip
            label={mode === 'sale' ? '購入確認' : 'レンタル確認'}
            color={mode === 'sale' ? 'primary' : 'secondary'}
            size="large"
            sx={{ fontSize: '1rem', px: 2, py: 1 }}
          />
        </Box>

        {/* 注意事項（レンタルのみ） */}
        {mode === 'rental' && (
          <NoticeBlock checked={agreed} onChange={setAgreed} />
        )}

        {/* お名前入力（レンタルのみ） */}
        {mode === 'rental' && (
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              お名前（任意）
            </Typography>
            <TextField
              fullWidth
              placeholder="お名前を入力してください（未入力でも可）"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              variant="outlined"
            />
          </Paper>
        )}

        {/* レンタル番号表示（レンタルのみ） */}
        {mode === 'rental' && rentalNumber && (
          <Paper elevation={2} sx={{ p: 3, mb: 3, backgroundColor: 'info.50' }}>
            <Typography variant="h6" gutterBottom>
              レンタル番号
            </Typography>
            <Typography variant="h4" color="info.main" fontWeight="bold">
              #{rentalNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              返却時にこの番号をお伝えください
            </Typography>
          </Paper>
        )}

        {/* 商品一覧 */}
        <Paper elevation={2} sx={{ mb: 3 }}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              ご注文内容
            </Typography>

            <List>
              {items.map((item, index) => (
                <React.Fragment key={`${item.product.id}-${index}`}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary={item.product.name}
                      secondary={
                        <>
                          単価: ¥{item.product.salePrice} × {item.quantity}点
                          {mode === 'rental' && item.rentalPlan && (
                            <>
                              <br />
                              目安プラン: {getPlanDisplayName(item.rentalPlan)}
                            </>
                          )}
                        </>
                      }
                    />
                    <Typography variant="body1" fontWeight="bold">
                      ¥{item.product.salePrice * item.quantity}
                    </Typography>
                  </ListItem>
                  {index < items.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>

            <Divider sx={{ my: 2 }} />

            {mode === 'sale' ? (
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h5" fontWeight="bold" color="primary">
                  合計: ¥{totalPrice}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h5" fontWeight="bold" color="secondary">
                  預かり金: ¥{depositAmount}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  ※実際の料金は返却時の使用時間で確定します
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>

        {/* エラー表示 */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} icon={<ErrorIcon />}>
            {error}
          </Alert>
        )}

        {/* 確定ボタン */}
        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleConfirm}
            disabled={loading || (mode === 'rental' && !agreed)}
            sx={{ px: 6, py: 2, fontSize: '1.2rem' }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} color="inherit" />
                処理中...
              </Box>
            ) : (
              `現金を受け取った（¥${mode === 'sale' ? totalPrice : depositAmount}）`
            )}
          </Button>
        </Box>

        {/* 貸出票ダイアログ */}
        <Dialog
          open={ticketDialog}
          onClose={handleTicketClose}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <Receipt color="primary" />
            貸出票
          </DialogTitle>

          {ticketData && (
            <DialogContent>
              <Paper variant="outlined" sx={{ p: 3, backgroundColor: 'grey.50' }}>
                <Typography variant="h4" textAlign="center" fontWeight="bold" gutterBottom>
                  #{ticketData.rentalNo}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="body1" gutterBottom>
                  <strong>お客様名:</strong> {ticketData.customerName}
                </Typography>

                <Typography variant="body1" gutterBottom>
                  <strong>開始時刻:</strong> {ticketData.startTime}
                </Typography>

                <Typography variant="body1" gutterBottom>
                  <strong>商品:</strong>
                </Typography>
                <Box sx={{ ml: 2 }}>
                  {ticketData.productNames.map((name: string, index: number) => (
                    <Typography key={index} variant="body2">
                      • {name}
                    </Typography>
                  ))}
                </Box>

                <Divider sx={{ my: 2 }} />

                {ticketData.instructions.map((instruction: string, index: number) => (
                  <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                    • {instruction}
                  </Typography>
                ))}
              </Paper>
            </DialogContent>
          )}

          <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
            <Button
              variant="contained"
              onClick={handleTicketClose}
              size="large"
              sx={{ px: 4 }}
            >
              確認しました
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}