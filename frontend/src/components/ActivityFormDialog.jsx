import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Alert,
} from '@mui/material';
import { createActivity, updateActivity } from '../services/activitiesApi';

const emptyForm = { name: '', type: '', description: '' };

// activity = null => وضع الإضافة | activity = object => وضع التعديل
export default function ActivityFormDialog({ open, onClose, onSaved, activity }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const isEditMode = Boolean(activity);

  useEffect(() => {
    if (activity) {
      setForm({
        name: activity.name || '',
        type: activity.type || '',
        description: activity.description || '',
      });
    } else {
      setForm(emptyForm);
    }
    setError('');
  }, [activity, open]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    setError('');

    if (!form.name) {
      setError('اسم النشاط إلزامي');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        type: form.type || null,
        description: form.description || null,
      };

      if (isEditMode) {
        await updateActivity(activity.id, payload);
      } else {
        await createActivity(payload);
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
        {isEditMode ? 'تعديل النشاط' : 'إضافة نشاط جديد'}
      </DialogTitle>

      <DialogContent sx={{ direction: 'rtl' }}>
        {error && (
          <Alert severity="error" sx={{ marginBottom: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ marginTop: 0.5 }}>
          <Grid item xs={12}>
            <TextField
              label="اسم النشاط *"
              fullWidth
              size="small"
              placeholder="مثال: قفة رمضان"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="النوع"
              fullWidth
              size="small"
              placeholder="مثال: عيني / مالي"
              value={form.type}
              onChange={(e) => handleChange('type', e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="الوصف"
              fullWidth
              multiline
              rows={3}
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
