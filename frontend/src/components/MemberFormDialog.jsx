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
import { createMember, updateMember } from '../services/membersApi';

const emptyForm = {
  nom: '',
  prenom: '',
  telephone: '',
  dateNaissance: '',
  niveauEtude: '',
  profession: '',
  poste: '',
  dateAdhesion: '',
};

// member = null => وضع الإضافة | member = object => وضع التعديل
export default function MemberFormDialog({ open, onClose, onSaved, member }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const isEditMode = Boolean(member);

  useEffect(() => {
    if (member) {
      setForm({
        nom: member.nom || '',
        prenom: member.prenom || '',
        telephone: member.telephone || '',
        dateNaissance: member.dateNaissance ? member.dateNaissance.slice(0, 10) : '',
        niveauEtude: member.niveauEtude || '',
        profession: member.profession || '',
        poste: member.poste || '',
        dateAdhesion: member.dateAdhesion ? member.dateAdhesion.slice(0, 10) : '',
      });
    } else {
      setForm(emptyForm);
    }
    setError('');
  }, [member, open]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    setError('');

    if (!form.nom || !form.prenom || !form.telephone || !form.dateNaissance || !form.poste) {
      setError('يرجى تعبئة الاسم واللقب والهاتف وتاريخ الميلاد والمنصب');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        niveauEtude: form.niveauEtude || null,
        profession: form.profession || null,
        dateAdhesion: form.dateAdhesion || undefined,
      };

      if (isEditMode) {
        await updateMember(member.id, payload);
      } else {
        await createMember(payload);
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
        {isEditMode ? 'تعديل بيانات العضو' : 'إضافة عضو جديد'}
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
              label="الاسم *"
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
              label="الهاتف *"
              fullWidth
              size="small"
              value={form.telephone}
              onChange={(e) => handleChange('telephone', e.target.value)}
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
              label="المستوى الدراسي"
              fullWidth
              size="small"
              value={form.niveauEtude}
              onChange={(e) => handleChange('niveauEtude', e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="الوظيفة"
              fullWidth
              size="small"
              value={form.profession}
              onChange={(e) => handleChange('profession', e.target.value)}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="المنصب في الجمعية *"
              fullWidth
              size="small"
              placeholder="مثال: رئيس الجمعية"
              value={form.poste}
              onChange={(e) => handleChange('poste', e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="تاريخ الانضمام"
              type="date"
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              value={form.dateAdhesion}
              onChange={(e) => handleChange('dateAdhesion', e.target.value)}
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
