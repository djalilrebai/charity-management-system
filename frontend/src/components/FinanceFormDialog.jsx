import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Autocomplete,
  Alert,
} from '@mui/material';
import {
  createIncome,
  updateIncome,
  createExpense,
  updateExpense,
} from '../services/financeApi';

const CATEGORY_SUGGESTIONS = {
  income: ['تبرع', 'زكاة', 'اشتراكات', 'إعانة بلدية', 'وقف'],
  expense: ['قفة رمضان', 'كسوة العيد', 'أدوات مدرسية', 'إيجار', 'فواتير', 'نقل'],
};

const emptyForm = { date: '', amount: '', category: '', reference: '', description: '' };

// type: 'income' | 'expense' — record = null (إضافة) | object (تعديل)
export default function FinanceFormDialog({ open, onClose, onSaved, type, record }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const isEditMode = Boolean(record);
  const isIncome = type === 'income';

  useEffect(() => {
    if (record) {
      setForm({
        date: record.date ? record.date.slice(0, 10) : '',
        amount: record.amount ?? '',
        category: record.category || '',
        reference: record.reference || '',
        description: record.description || '',
      });
    } else {
      setForm(emptyForm);
    }
    setError('');
  }, [record, open]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    setError('');

    if (!form.date || !form.amount || !form.category) {
      setError('يرجى تعبئة التاريخ والمبلغ والتصنيف');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        amount: Number(form.amount),
        reference: form.reference || null,
        description: form.description || null,
      };

      if (isIncome) {
        if (isEditMode) await updateIncome(record.id, payload);
        else await createIncome(payload);
      } else {
        if (isEditMode) await updateExpense(record.id, payload);
        else await createExpense(payload);
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  }

  const title = isIncome
    ? isEditMode ? 'تعديل مدخول' : 'إضافة مدخول جديد'
    : isEditMode ? 'تعديل مصروف' : 'إضافة مصروف جديد';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ direction: 'rtl' }}>{title}</DialogTitle>

      <DialogContent sx={{ direction: 'rtl' }}>
        {error && (
          <Alert severity="error" sx={{ marginBottom: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ marginTop: 0.5 }}>
          <Grid item xs={12}>
            <TextField
              label="التاريخ *"
              type="date"
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              value={form.date}
              onChange={(e) => handleChange('date', e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="المبلغ (دج) *"
              type="number"
              fullWidth
              size="small"
              value={form.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <Autocomplete
              freeSolo
              options={CATEGORY_SUGGESTIONS[type] || []}
              value={form.category}
              onInputChange={(e, value) => handleChange('category', value)}
              renderInput={(params) => (
                <TextField {...params} label="التصنيف *" size="small" />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="رقم الوصل/السند"
              fullWidth
              size="small"
              placeholder={isIncome ? 'مثال: DON-2026-001' : 'مثال: EXP-2026-001'}
              value={form.reference}
              onChange={(e) => handleChange('reference', e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="ملاحظات"
              fullWidth
              multiline
              rows={2}
              size="small"
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ direction: 'rtl', paddingX: 3, paddingBottom: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          إلغاء
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={saving}>
          {saving ? '...جاري الحفظ' : isEditMode ? 'حفظ التعديلات' : 'إضافة'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
