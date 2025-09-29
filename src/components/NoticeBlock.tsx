import React from 'react';
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Paper,
  Alert,
} from '@mui/material';
import { Warning } from '@mui/icons-material';

interface NoticeBlockProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const NoticeBlock: React.FC<NoticeBlockProps> = ({ checked, onChange }) => {
  const notices = [
    'お面は大切に扱い、破損・汚損にご注意ください',
    '破損・紛失の場合は、販売価格での実費をお支払いいただきます',
    'レンタル料金は返却時の実際の使用時間で確定します',
    '営業終了の30分前までに必ず返却してください',
  ];

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3, backgroundColor: 'warning.50', border: '1px solid', borderColor: 'warning.main' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Warning color="warning" />
        <Typography variant="h6" component="h3" color="warning.dark" fontWeight="bold">
          レンタルご利用の注意事項
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        {notices.map((notice, index) => (
          <Alert
            key={index}
            severity="warning"
            variant="outlined"
            sx={{ mb: 1, fontSize: '0.95rem' }}
          >
            <Typography variant="body2">
              {index + 1}. {notice}
            </Typography>
          </Alert>
        ))}
      </Box>

      <FormControlLabel
        control={
          <Checkbox
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            color="primary"
            size="medium"
          />
        }
        label={
          <Typography variant="body1" fontWeight="bold">
            上記の注意事項をすべて理解し、同意します
          </Typography>
        }
        sx={{
          backgroundColor: checked ? 'success.50' : 'grey.50',
          border: checked ? '1px solid' : '1px solid',
          borderColor: checked ? 'success.main' : 'grey.300',
          borderRadius: 1,
          p: 1,
          m: 0,
          width: '100%',
        }}
      />
    </Paper>
  );
};