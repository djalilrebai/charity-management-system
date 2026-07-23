import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Paper,
  Grid,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  IconButton,
  Stack,
  Chip,
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../context/AuthContext';
import { fetchFamilyById } from '../services/familiesApi';
import { fetchChildrenByFamily, deleteChild } from '../services/childrenApi';
import { fetchFamilyActivities, deleteFamilyActivity } from '../services/familyActivitiesApi';
import ChildFormDialog from '../components/ChildFormDialog';
import FamilyActivityFormDialog from '../components/FamilyActivityFormDialog';

// حساب العمر من تاريخ الميلاد بدل ما نخزنو فـ القاعدة
function calculateAge(dateNaissance) {
  const birth = new Date(dateNaissance);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export default function FamilyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [family, setFamily] = useState(null);
  const [children, setChildren] = useState([]);
  const [activityRecords, setActivityRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const [childDialogOpen, setChildDialogOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);

  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [selectedActivityRecord, setSelectedActivityRecord] = useState(null);

  const canEdit = user?.role === 'admin' || user?.role === 'secretary';
  const canDelete = user?.role === 'admin';

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [familyData, childrenData, activitiesData] = await Promise.all([
        fetchFamilyById(id),
        fetchChildrenByFamily(id),
        fetchFamilyActivities(id),
      ]);
      setFamily(familyData);
      setChildren(childrenData);
      setActivityRecords(activitiesData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- الأطفال ---
  function openAddChildDialog() {
    setSelectedChild(null);
    setChildDialogOpen(true);
  }

  function openEditChildDialog(child) {
    setSelectedChild(child);
    setChildDialogOpen(true);
  }

  async function handleDeleteChild(childId) {
    if (!window.confirm('متأكد بغيت تحذف هذا الطفل؟')) return;
    try {
      await deleteChild(childId);
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || 'حدث خطأ أثناء الحذف');
    }
  }

  // --- الاستفادات ---
  function openAddActivityDialog() {
    setSelectedActivityRecord(null);
    setActivityDialogOpen(true);
  }

  function openEditActivityDialog(record) {
    setSelectedActivityRecord(record);
    setActivityDialogOpen(true);
  }

  async function handleDeleteActivityRecord(recordId) {
    if (!window.confirm('متأكد بغيت تحذف هذي الاستفادة؟')) return;
    try {
      await deleteFamilyActivity(recordId);
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || 'حدث خطأ أثناء الحذف');
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <CircularProgress />
      </div>
    );
  }

  if (!family) {
    return <Typography sx={{ padding: 4 }}>العائلة غير موجودة</Typography>;
  }

  return (
    <div style={{ direction: 'rtl', padding: 24 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/families')} sx={{ marginBottom: 2 }}>
        رجوع لقائمة العائلات
      </Button>

      {/* بيانات العائلة */}
      <Paper sx={{ padding: 3, marginBottom: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ marginBottom: 2 }}>
          <Typography variant="h5">
            {family.nom} {family.prenom}
          </Typography>
          <Chip label={`رقم تسلسلي: ${family.numSequentiel}`} />
        </Stack>

        <Grid container spacing={2}>
          <Grid item xs={6} md={3}>
            <Typography variant="caption" color="text.secondary">الهاتف</Typography>
            <Typography>{family.telephone}</Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography variant="caption" color="text.secondary">الصنف</Typography>
            <Typography>{family.categorie}</Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography variant="caption" color="text.secondary">الراتب</Typography>
            <Typography>{family.salaire} دج</Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography variant="caption" color="text.secondary">عدد الأيتام</Typography>
            <Typography>{family.orphansCount}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="caption" color="text.secondary">العنوان</Typography>
            <Typography>{family.adresse}</Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography variant="caption" color="text.secondary">الحي</Typography>
            <Typography>{family.quartier || '—'}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* جدول الأطفال */}
      <Paper sx={{ padding: 3, marginBottom: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ marginBottom: 2 }}>
          <Typography variant="h6">الأطفال ({children.length})</Typography>
          {canEdit && (
            <Button variant="contained" size="small" onClick={openAddChildDialog}>
              + إضافة طفل
            </Button>
          )}
        </Stack>

        {children.length === 0 ? (
          <Typography color="text.secondary">لا يوجد أطفال مسجلين لهذه العائلة</Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>الاسم</TableCell>
                <TableCell>الجنس</TableCell>
                <TableCell>العمر</TableCell>
                <TableCell>الوضعية</TableCell>
                <TableCell>السنة الدراسية</TableCell>
                <TableCell>إجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {children.map((child) => (
                <TableRow key={child.id}>
                  <TableCell>{child.nom}</TableCell>
                  <TableCell>{child.sexe === 'MALE' ? 'ذكر' : 'أنثى'}</TableCell>
                  <TableCell>{calculateAge(child.dateNaissance)} سنة</TableCell>
                  <TableCell>{child.situation || '—'}</TableCell>
                  <TableCell>{child.anneeEtude || '—'}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      {canEdit && (
                        <IconButton size="small" color="primary" onClick={() => openEditChildDialog(child)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}
                      {canDelete && (
                        <IconButton size="small" color="error" onClick={() => handleDeleteChild(child.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* جدول الاستفادات */}
      <Paper sx={{ padding: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ marginBottom: 2 }}>
          <Typography variant="h6">الاستفادات ({activityRecords.length})</Typography>
          {canEdit && (
            <Button variant="contained" size="small" onClick={openAddActivityDialog}>
              + تسجيل استفادة
            </Button>
          )}
        </Stack>

        {activityRecords.length === 0 ? (
          <Typography color="text.secondary">لا توجد استفادات مسجلة لهذه العائلة</Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>النشاط</TableCell>
                <TableCell>التاريخ</TableCell>
                <TableCell>الكمية</TableCell>
                <TableCell>القيمة</TableCell>
                <TableCell>تم التسجيل بواسطة</TableCell>
                <TableCell>إجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activityRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.activityName}</TableCell>
                  <TableCell>{record.date?.slice(0, 10)}</TableCell>
                  <TableCell>{record.quantity}</TableCell>
                  <TableCell>{record.value ? `${record.value} دج` : '—'}</TableCell>
                  <TableCell>{record.createdByUsername || '—'}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      {canEdit && (
                        <IconButton size="small" color="primary" onClick={() => openEditActivityDialog(record)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}
                      {canDelete && (
                        <IconButton size="small" color="error" onClick={() => handleDeleteActivityRecord(record.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      <ChildFormDialog
        open={childDialogOpen}
        onClose={() => setChildDialogOpen(false)}
        onSaved={loadData}
        familyId={id}
        child={selectedChild}
      />

      <FamilyActivityFormDialog
        open={activityDialogOpen}
        onClose={() => setActivityDialogOpen(false)}
        onSaved={loadData}
        familyId={id}
        record={selectedActivityRecord}
      />
    </div>
  );
}
