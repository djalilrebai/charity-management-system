import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Alert,
} from '@mui/material';
import { fetchActivities } from '../services/activitiesApi';
import { createFamilyActivity, updateFamilyActivity } from '../services/familyActivitiesApi';

const emptyForm = { activityId: '', date: '', quantity: 1, value: '', notes: '' };

// record = null => وضع الإضافة | record = object => وضع التعديل
export default function FamilyActivityFormDialog({ open, onClose, onSaved, familyId, record }) {
  const [form, setForm] = useState(emptyForm);
  const [activitiesOptions, setActivitiesOptions] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const isEditMode = Boolean(record);

  // نجيب قائمة الأنشطة الموجودة باش نعبي الـ Select
  useEffect(() => {
    if (open) {
      fetchActivities()
        .then(setActivitiesOptions)
        .catch((err) => console.error(err));
    }
  }, [open]);

  useEffect(() => {
    if (record) {
      setForm({
        activityId: record.activityId || '',
        date: record.date ? record.date.slice(0, 10) : '',
        quantity: record.quantity ?? 1,
        value: record.value ?? '',
        notes: record.notes || '',
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

    if (!form.activityId || !form.date) {
      setError('يرجى اختيار النشاط وتحديد التاريخ');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        quantity: Number(form.quantity) || 1,
        value: form.value === '' ? null : Number(form.value),
        notes: form.notes || null,
      };

      if (isEditMode) {
        await updateFamilyActivity(record.id, payload);
      } else {
        await createFamilyActivity(familyId, payload);
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ direction: 'rtl' }}>
        {isEditMode ? 'تعديل الاستفادة' : 'تسجيل استفادة جديدة'}
      </DialogTitle>

      <DialogContent sx={{ direction: 'rtl' }}>
        {error && (
          <Alert severity="error" sx={{ marginBottom: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ marginTop: 0.5 }}>
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>النشاط *</InputLabel>
              <Select
                value={form.activityId}
                label="النشاط *"
                onChange={(e) => handleChange('activityId', e.target.value)}
              >
                {activitiesOptions.map((a) => (
                  <MenuItem key={a.id} value={a.id}>
                    {a.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

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

          <Grid item xs={6}>
            <TextField
              label="الكمية"
              type="number"
              fullWidth
              size="small"
              value={form.quantity}
              onChange={(e) => handleChange('quantity', e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="القيمة (دج)"
              type="number"
              fullWidth
              size="small"
              value={form.value}
              onChange={(e) => handleChange('value', e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="ملاحظات"
              fullWidth
              multiline
              rows={2}
              size="small"
              value={form.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ direction: 'rtl', paddingX: 3, paddingBottom: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          إلغاء
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={saving}>
          {saving ? '...جاري الحفظ' : isEditMode ? 'حفظ التعديلات' : 'تسجيل'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
