import { useState, useEffect, useCallback } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
  Typography,
  Paper,
  Grid,
  Tabs,
  Tab,
  Button,
  Stack,
  IconButton,
  Box,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useAuth } from '../context/AuthContext';
import {
  fetchIncomes,
  fetchExpenses,
  fetchFinanceSummary,
  deleteIncome,
  deleteExpense,
} from '../services/financeApi';
import FinanceFormDialog from '../components/FinanceFormDialog';

export default function Finance() {
  const { user } = useAuth();
  const [tab, setTab] = useState('income'); // income | expense
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, balance: 0 });
  const [loading, setLoading] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // admin و accountant بس يقدرو يزيدو/يعدلو، admin بس يحذف
  const canEdit = user?.role === 'admin' || user?.role === 'accountant';
  const canDelete = user?.role === 'admin';

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [records, summaryData] = await Promise.all([
        tab === 'income' ? fetchIncomes() : fetchExpenses(),
        fetchFinanceSummary(),
      ]);
      setRows(records);
      setSummary(summaryData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function openAddDialog() {
    setSelectedRecord(null);
    setDialogOpen(true);
  }

  function openEditDialog(record) {
    setSelectedRecord(record);
    setDialogOpen(true);
  }

  async function handleDelete(id) {
    if (!window.confirm('متأكد بغيت تحذف هذا السجل؟')) return;
    try {
      if (tab === 'income') await deleteIncome(id);
      else await deleteExpense(id);
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || 'حدث خطأ أثناء الحذف');
    }
  }

  const columns = [
    { field: 'date', headerName: 'التاريخ', width: 110, valueGetter: (value, row) => row.date?.slice(0, 10) },
    { field: 'category', headerName: 'التصنيف', width: 150 },
    {
      field: 'amount',
      headerName: 'المبلغ',
      width: 110,
      valueFormatter: (value) => `${value} دج`,
    },
    { field: 'reference', headerName: 'رقم الوصل/السند', width: 140 },
    { field: 'description', headerName: 'ملاحظات', flex: 1, minWidth: 150 },
    { field: 'createdByUsername', headerName: 'تم التسجيل بواسطة', width: 140 },
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
        المداخيل والمصاريف
      </Typography>

      {/* ملخص سريع */}
      <Grid container spacing={2} sx={{ marginBottom: 3 }}>
        <Grid item xs={4}>
          <Paper sx={{ padding: 2, textAlign: 'center', backgroundColor: '#e8f5e9' }}>
            <Typography variant="caption" color="text.secondary">إجمالي المداخيل</Typography>
            <Typography variant="h6">{summary.totalIncome} دج</Typography>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper sx={{ padding: 2, textAlign: 'center', backgroundColor: '#ffebee' }}>
            <Typography variant="caption" color="text.secondary">إجمالي المصاريف</Typography>
            <Typography variant="h6">{summary.totalExpenses} دج</Typography>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper
            sx={{
              padding: 2,
              textAlign: 'center',
              backgroundColor: summary.balance >= 0 ? '#e3f2fd' : '#fff3e0',
            }}
          >
            <Typography variant="caption" color="text.secondary">الرصيد</Typography>
            <Typography variant="h6">{summary.balance} دج</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* التبويبات */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', marginBottom: 2 }}>
        <Tabs value={tab} onChange={(e, value) => setTab(value)}>
          <Tab label="المداخيل" value="income" />
          <Tab label="المصاريف" value="expense" />
        </Tabs>
      </Box>

      <Stack direction="row" justifyContent="flex-end" sx={{ marginBottom: 2 }}>
        {canEdit && (
          <Button variant="contained" onClick={openAddDialog}>
            + {tab === 'income' ? 'إضافة مدخول' : 'إضافة مصروف'}
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

      <FinanceFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSaved={loadData}
        type={tab}
        record={selectedRecord}
      />
    </div>
  );
}
