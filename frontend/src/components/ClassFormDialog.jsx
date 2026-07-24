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
import { createClass, updateClass } from '../services/classesApi';

const emptyForm = { name: '', teacher: '', type: 'SOUTIEN', niveau: '', horaire: '', notes: '' };

// classRoom = null => وضع الإضافة | classRoom = object => وضع التعديل
export default function ClassFormDialog({ open, onClose, onSaved, classRoom }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const isEditMode = Boolean(classRoom);

  useEffect(() => {
    if (classRoom) {
      setForm({
        name: classRoom.name || '',
        teacher: classRoom.teacher || '',
        type: classRoom.type || 'SOUTIEN',
        niveau: classRoom.niveau || '',
        horaire: classRoom.horaire || '',
        notes: classRoom.notes || '',
      });
    } else {
      setForm(emptyForm);
    }
    setError('');
  }, [classRoom, open]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    setError('');

    if (!form.name || !form.teacher || !form.type) {
      setError('يرجى تعبئة اسم القسم والمعلم والنوع');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        niveau: form.niveau || null,
        horaire: form.horaire || null,
        notes: form.notes || null,
      };

      if (isEditMode) {
        await updateClass(classRoom.id, payload);
      } else {
        await createClass(payload);
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
        {isEditMode ? 'تعديل القسم' : 'إضافة قسم جديد'}
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
              label="اسم القسم *"
              fullWidth
              size="small"
              placeholder="مثال: قسم الدعم - الخامسة ابتدائي"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </Grid>

          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <InputLabel>النوع *</InputLabel>
              <Select value={form.type} label="النوع *" onChange={(e) => handleChange('type', e.target.value)}>
                <MenuItem value="SOUTIEN">دعم مدرسي</MenuItem>
                <MenuItem value="CORANIQUE">تعليم قرآني</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="المعلم *"
              fullWidth
              size="small"
              value={form.teacher}
              onChange={(e) => handleChange('teacher', e.target.value)}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="المستوى"
              fullWidth
              size="small"
              value={form.niveau}
              onChange={(e) => handleChange('niveau', e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="التوقيت"
              fullWidth
              size="small"
              placeholder="مثال: كل سبت 14:00"
              value={form.horaire}
              onChange={(e) => handleChange('horaire', e.target.value)}
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
          {saving ? '...جاري الحفظ' : isEditMode ? 'حفظ التعديلات' : 'إضافة'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
