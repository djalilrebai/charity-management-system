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
  Typography,
} from '@mui/material';
import { createAccountForMember } from '../services/membersApi';

const ROLES = [
  { value: 'admin', label: 'admin — كل الصلاحيات' },
  { value: 'secretary', label: 'secretary — إدارة العائلات والأنشطة' },
  { value: 'accountant', label: 'accountant — المداخيل والمصاريف' },
  { value: 'viewer', label: 'viewer — عرض فقط' },
];

const emptyForm = { username: '', password: '', roleName: 'viewer' };

// هذا الـ Dialog يبان بس لـ admin (محمي من صفحة Members نفسها)
export default function CreateAccountDialog({ open, onClose, onSaved, member }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(emptyForm);
    setError('');
  }, [member, open]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    setError('');

    if (!form.username || !form.password || !form.roleName) {
      setError('يرجى تعبئة كل الحقول');
      return;
    }
    if (form.password.length < 6) {
      setError('كلمة السر يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setSaving(true);
    try {
      await createAccountForMember(member.id, form);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء إنشاء الحساب');
    } finally {
      setSaving(false);
    }
  }

  if (!member) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ direction: 'rtl' }}>
        إنشاء حساب دخول لـ {member.nom} {member.prenom}
      </DialogTitle>

      <DialogContent sx={{ direction: 'rtl' }}>
        <Typography variant="body2" color="text.secondary" sx={{ marginBottom: 2 }}>
          هذا الحساب رح يمكّن العضو من تسجيل الدخول للموقع بالصلاحية اللي تختارها.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ marginBottom: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="اسم المستخدم *"
              fullWidth
              size="small"
              value={form.username}
              onChange={(e) => handleChange('username', e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="كلمة السر *"
              type="password"
              fullWidth
              size="small"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>الصلاحية *</InputLabel>
              <Select
                value={form.roleName}
                label="الصلاحية *"
                onChange={(e) => handleChange('roleName', e.target.value)}
              >
                {ROLES.map((r) => (
                  <MenuItem key={r.value} value={r.value}>
                    {r.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ direction: 'rtl', paddingX: 3, paddingBottom: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          إلغاء
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={saving}>
          {saving ? '...جاري الإنشاء' : 'إنشاء الحساب'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
