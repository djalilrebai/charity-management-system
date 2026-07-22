import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import {
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Button,
  Stack,
  Typography,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useAuth } from '../context/AuthContext';
import { fetchFamilies, deleteFamily } from '../services/familiesApi';
import FamilyFormDialog from '../components/FamilyFormDialog';

export default function Families() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [categorie, setCategorie] = useState('');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 20 });

  // حالة الـ Dialog: مفتوح ولا لا + العائلة قيد التعديل (null = وضع الإضافة)
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState(null);

  const canEdit = user?.role === 'admin' || user?.role === 'secretary';
  const canDelete = user?.role === 'admin';

  const loadFamilies = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchFamilies({
        search,
        categorie,
        page: paginationModel.page + 1, // DataGrid يبدأ من 0، والـ API يبدأ من 1
        limit: paginationModel.pageSize,
      });
      setRows(result.data);
      setRowCount(result.pagination.total);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [search, categorie, paginationModel]);

  useEffect(() => {
    // تأخير بسيط عند الكتابة في البحث باش ما نديروش طلب مع كل حرف
    const timeout = setTimeout(() => {
      loadFamilies();
    }, 400);
    return () => clearTimeout(timeout);
  }, [loadFamilies]);

  function openAddDialog() {
    setSelectedFamily(null); // وضع الإضافة
    setDialogOpen(true);
  }

  function openEditDialog(family) {
    setSelectedFamily(family); // وضع التعديل
    setDialogOpen(true);
  }

  async function handleDelete(id) {
    if (!window.confirm('متأكد بغيت تحذف هذي العائلة؟')) return;
    try {
      await deleteFamily(id);
      loadFamilies();
    } catch (error) {
      alert(error.response?.data?.message || 'حدث خطأ أثناء الحذف');
    }
  }

  const columns = [
    { field: 'numSequentiel', headerName: 'الرقم التسلسلي', width: 130 },
    { field: 'nom', headerName: 'الاسم', width: 140 },
    { field: 'prenom', headerName: 'اللقب', width: 140 },
    { field: 'telephone', headerName: 'الهاتف', width: 130 },
    { field: 'quartier', headerName: 'الحي', width: 120 },
    { field: 'categorie', headerName: 'الصنف', width: 90 },
    {
      field: 'salaire',
      headerName: 'الراتب',
      width: 110,
      valueFormatter: (value) => `${value} دج`,
    },
    {
      field: 'childrenCount',
      headerName: 'عدد الأطفال',
      width: 110,
      valueGetter: (value, row) => row._count?.children ?? 0,
    },
    {
      field: 'actions',
      headerName: 'إجراءات',
      width: 170,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" onClick={() => navigate(`/families/${params.row.id}`)}>
            <VisibilityIcon fontSize="small" />
          </IconButton>
          {canEdit && (
            <IconButton size="small" color="primary" onClick={() => openEditDialog(params.row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          )}
          {canDelete && (
            <IconButton size="small" color="error" onClick={() => handleDelete(params.row.id)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
      ),
    },
  ];

  return (
    <div style={{ direction: 'rtl', padding: 24 }}>
      <Typography variant="h5" gutterBottom>
        قائمة العائلات المستفيدة
      </Typography>

      <Stack direction="row" spacing={2} sx={{ marginBottom: 2 }}>
        <TextField
          label="بحث (اسم، لقب، هاتف، رقم تسلسلي)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ minWidth: 280 }}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>الصنف</InputLabel>
          <Select value={categorie} label="الصنف" onChange={(e) => setCategorie(e.target.value)}>
            <MenuItem value="">الكل</MenuItem>
            <MenuItem value="A">A</MenuItem>
            <MenuItem value="B">B</MenuItem>
            <MenuItem value="C">C</MenuItem>
          </Select>
        </FormControl>

        {canEdit && (
          <Button variant="contained" onClick={openAddDialog}>
            + إضافة عائلة
          </Button>
        )}
      </Stack>

      <div style={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          rowCount={rowCount}
          loading={loading}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 20, 50]}
          disableRowSelectionOnClick
        />
      </div>

      <FamilyFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSaved={loadFamilies}
        family={selectedFamily}
      />
    </div>
  );
}
