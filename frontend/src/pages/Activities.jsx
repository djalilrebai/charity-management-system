import { useState, useEffect, useCallback } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { TextField, Button, Stack, Typography, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useAuth } from '../context/AuthContext';
import { fetchActivities, deleteActivity } from '../services/activitiesApi';
import ActivityFormDialog from '../components/ActivityFormDialog';

export default function Activities() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  const canEdit = user?.role === 'admin' || user?.role === 'secretary';
  const canDelete = user?.role === 'admin';

  const loadActivities = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchActivities(search);
      setRows(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadActivities();
    }, 400);
    return () => clearTimeout(timeout);
  }, [loadActivities]);

  function openAddDialog() {
    setSelectedActivity(null);
    setDialogOpen(true);
  }

  function openEditDialog(activity) {
    setSelectedActivity(activity);
    setDialogOpen(true);
  }

  async function handleDelete(id) {
    if (!window.confirm('متأكد بغيت تحذف هذا النشاط؟')) return;
    try {
      await deleteActivity(id);
      loadActivities();
    } catch (error) {
      alert(error.response?.data?.message || 'حدث خطأ أثناء الحذف');
    }
  }

  const columns = [
    { field: 'name', headerName: 'اسم النشاط', width: 200 },
    { field: 'type', headerName: 'النوع', width: 130 },
    { field: 'description', headerName: 'الوصف', flex: 1, minWidth: 200 },
    {
      field: 'usageCount',
      headerName: 'عدد الاستفادات',
      width: 130,
      valueGetter: (value, row) => row._count?.familyActivities ?? 0,
    },
    {
      field: 'actions',
      headerName: 'إجراءات',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
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
        الأعمال والمساعدات
      </Typography>

      <Stack direction="row" spacing={2} sx={{ marginBottom: 2 }}>
        <TextField
          label="بحث (اسم النشاط أو النوع)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ minWidth: 280 }}
        />

        {canEdit && (
          <Button variant="contained" onClick={openAddDialog}>
            + إضافة نشاط
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

      <ActivityFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSaved={loadActivities}
        activity={selectedActivity}
      />
    </div>
  );
}
