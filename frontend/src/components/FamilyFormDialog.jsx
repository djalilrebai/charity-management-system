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
import { createFamily, updateFamily } from '../services/familiesApi';

const emptyForm = {
  nom: '',
  prenom: '',
  dateNaissance: '',
  nationalId: '',
  telephone: '',
  adresse: '',
  quartier: '',
  categorie: 'A',
  salaire: '',
  housingStatus: 'OTHER',
  orphansCount: 0,
  notes: '',
};

// family = null => وضع الإضافة | family = object => وضع التعديل
export default function FamilyFormDialog({ open, onClose, onSaved, family }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const isEditMode = Boolean(family);

  useEffect(() => {
    if (family) {
      setForm({
        nom: family.nom || '',
        prenom: family.prenom || '',
        dateNaissance: family.dateNaissance ? family.dateNaissance.slice(0, 10) : '',
        nationalId: family.nationalId || '',
        telephone: family.telephone || '',
        adresse: family.adresse || '',
        quartier: family.quartier || '',
        categorie: family.categorie || 'A',
        salaire: family.salaire ?? '',
        housingStatus: family.housingStatus || 'OTHER',
        orphansCount: family.orphansCount ?? 0,
        notes: family.notes || '',
      });
    } else {
      setForm(emptyForm);
    }
    setError('');
  }, [family, open]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    setError('');

    if (!form.nom || !form.prenom || !form.dateNaissance || !form.telephone || !form.adresse || !form.salaire) {
      setError('يرجى تعبئة كل الحقول الإلزامية (الاسم، اللقب، تاريخ الميلاد، الهاتف، العنوان، الراتب)');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        salaire: Number(form.salaire),
        orphansCount: Number(form.orphansCount) || 0,
        nationalId: form.nationalId || null,
        quartier: form.quartier || null,
        notes: form.notes || null,
      };

      if (isEditMode) {
        await updateFamily(family.id, payload);
      } else {
        await createFamily(payload);
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ direction: 'rtl' }}>
        {isEditMode ? 'تعديل بيانات العائلة' : 'إضافة عائلة جديدة'}
      </DialogTitle>

      <DialogContent sx={{ direction: 'rtl' }}>
        {error && (
          <Alert severity="error" sx={{ marginBottom: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ marginTop: 0.5 }}>
          <Grid item xs={6}>
            <TextField
              label="اسم الأرملة *"
              fullWidth
              size="small"
              value={form.nom}
              onChange={(e) => handleChange('nom', e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="اللقب *"
              fullWidth
              size="small"
              value={form.prenom}
              onChange={(e) => handleChange('prenom', e.target.value)}
            />
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
          <Grid item xs={6}>
            <TextField
              label="رقم بطاقة التعريف الوطنية"
              fullWidth
              size="small"
              value={form.nationalId}
              onChange={(e) => handleChange('nationalId', e.target.value)}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="الهاتف *"
              fullWidth
              size="small"
              value={form.telephone}
              onChange={(e) => handleChange('telephone', e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="الحي"
              fullWidth
              size="small"
              value={form.quartier}
              onChange={(e) => handleChange('quartier', e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="العنوان الكامل *"
              fullWidth
              size="small"
              value={form.adresse}
              onChange={(e) => handleChange('adresse', e.target.value)}
            />
          </Grid>

          <Grid item xs={4}>
            <FormControl fullWidth size="small">
              <InputLabel>الصنف *</InputLabel>
              <Select
                value={form.categorie}
                label="الصنف *"
                onChange={(e) => handleChange('categorie', e.target.value)}
              >
                <MenuItem value="A">A</MenuItem>
                <MenuItem value="B">B</MenuItem>
                <MenuItem value="C">C</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="الراتب *"
              type="number"
              fullWidth
              size="small"
              value={form.salaire}
              onChange={(e) => handleChange('salaire', e.target.value)}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="عدد الأيتام"
              type="number"
              fullWidth
              size="small"
              value={form.orphansCount}
              onChange={(e) => handleChange('orphansCount', e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>حالة السكن</InputLabel>
              <Select
                value={form.housingStatus}
                label="حالة السكن"
                onChange={(e) => handleChange('housingStatus', e.target.value)}
              >
                <MenuItem value="RENT">كراء</MenuItem>
                <MenuItem value="OWN">ملك</MenuItem>
                <MenuItem value="OTHER">أخرى</MenuItem>
              </Select>
            </FormControl>
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
