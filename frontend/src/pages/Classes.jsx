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
  Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useAuth } from '../context/AuthContext';
import { fetchClasses, deleteClass } from '../services/classesApi';
import ClassFormDialog from '../components/ClassFormDialog';

export default function Classes() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  const canEdit = user?.role === 'admin' || user?.role === 'secretary';
  const canDelete = user?.role === 'admin';

  const loadClasses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchClasses({ search, type });
      setRows(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [search, type]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadClasses();
    }, 400);
    return () => clearTimeout(timeout);
  }, [loadClasses]);

  function openAddDialog() {
    setSelectedClass(null);
    setDialogOpen(true);
  }

  function openEditDialog(classRoom) {
    setSelectedClass(classRoom);
    setDialogOpen(true);
  }

  async function handleDelete(id) {
    if (!window.confirm('متأكد بغيت تحذف هذا القسم؟')) return;
    try {
      await deleteClass(id);
      loadClasses();
    } catch (error) {
      alert(error.response?.data?.message || 'حدث خطأ أثناء الحذف');
    }
  }

  const columns = [
    { field: 'name', headerName: 'اسم القسم', width: 220 },
    {
      field: 'type',
      headerName: 'النوع',
      width: 130,
      renderCell: (params) => (
        <Chip
          size="small"
          label={params.value === 'SOUTIEN' ? 'دعم مدرسي' : 'تعليم قرآني'}
          color={params.value === 'SOUTIEN' ? 'primary' : 'success'}
          variant="outlined"
        />
      ),
    },
    { field: 'teacher', headerName: 'المعلم', width: 150 },
    { field: 'niveau', headerName: 'المستوى', width: 130 },
    { field: 'horaire', headerName: 'التوقيت', width: 150 },
    {
      field: 'enrollmentsCount',
      headerName: 'عدد المسجلين',
      width: 120,
      valueGetter: (value, row) => row._count?.enrollments ?? 0,
    },
    {
      field: 'actions',
      headerName: 'إجراءات',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" onClick={() => navigate(`/classes/${params.row.id}`)}>
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
        دروس الدعم والتعليم القرآني
      </Typography>

      <Stack direction="row" spacing={2} sx={{ marginBottom: 2 }}>
        <TextField
          label="بحث (اسم القسم أو المعلم)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ minWidth: 260 }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>النوع</InputLabel>
          <Select value={type} label="النوع" onChange={(e) => setType(e.target.value)}>
            <MenuItem value="">الكل</MenuItem>
            <MenuItem value="SOUTIEN">دعم مدرسي</MenuItem>
            <MenuItem value="CORANIQUE">تعليم قرآني</MenuItem>
          </Select>
        </FormControl>

        {canEdit && (
          <Button variant="contained" onClick={openAddDialog}>
            + إضافة قسم
          </Button>
        )}
      </Stack>

      <div style={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          pageSizeOptions={[10, 20, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 20 } } }}
          disableRowSelectionOnClick
        />
      </div>

      <ClassFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSaved={loadClasses}
        classRoom={selectedClass}
      />
    </div>
  );
}
