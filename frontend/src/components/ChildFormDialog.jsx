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
import { createChild, updateChild } from '../services/childrenApi';

const emptyForm = {
  nom: '',
  sexe: 'MALE',
  dateNaissance: '',
  situation: '',
  anneeEtude: '',
};

// child = null => وضع الإضافة | child = object => وضع التعديل
export default function ChildFormDialog({ open, onClose, onSaved, familyId, child }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const isEditMode = Boolean(child);

  useEffect(() => {
    if (child) {
      setForm({
        nom: child.nom || '',
        sexe: child.sexe || 'MALE',
        dateNaissance: child.dateNaissance ? child.dateNaissance.slice(0, 10) : '',
        situation: child.situation || '',
        anneeEtude: child.anneeEtude || '',
      });
    } else {
      setForm(emptyForm);
    }
    setError('');
  }, [child, open]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    setError('');

    if (!form.nom || !form.sexe || !form.dateNaissance) {
      setError('يرجى تعبئة الاسم والجنس وتاريخ الميلاد');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        situation: form.situation || null,
        anneeEtude: form.anneeEtude || null,
      };

      if (isEditMode) {
        await updateChild(child.id, payload);
      } else {
        await createChild(familyId, payload);
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
        {isEditMode ? 'تعديل بيانات الطفل' : 'إضافة طفل جديد'}
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
              label="اسم الطفل *"
              fullWidth
              size="small"
              value={form.nom}
              onChange={(e) => handleChange('nom', e.target.value)}
            />
          </Grid>

          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <InputLabel>الجنس *</InputLabel>
              <Select value={form.sexe} label="الجنس *" onChange={(e) => handleChange('sexe', e.target.value)}>
                <MenuItem value="MALE">ذكر</MenuItem>
                <MenuItem value="FEMALE">أنثى</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="تاريخ الميلاد *"
              type="date"
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              value={form.dateNaissance}
              onChange={(e) => handleChange('dateNaissance', e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="الوضعية (يتيم، معاق...)"
              fullWidth
              size="small"
              value={form.situation}
              onChange={(e) => handleChange('situation', e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="السنة الدراسية"
              fullWidth
              size="small"
              placeholder="مثال: الخامسة ابتدائي"
              value={form.anneeEtude}
              onChange={(e) => handleChange('anneeEtude', e.target.value)}
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
