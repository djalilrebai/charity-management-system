import { useState, useEffect, useCallback } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { TextField, Button, Stack, Typography, IconButton, Chip, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import KeyIcon from '@mui/icons-material/VpnKey';
import { useAuth } from '../context/AuthContext';
import { fetchMembers, deleteMember } from '../services/membersApi';
import MemberFormDialog from '../components/MemberFormDialog';
import CreateAccountDialog from '../components/CreateAccountDialog';

export default function Members() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [memberForAccount, setMemberForAccount] = useState(null);

  const canEdit = user?.role === 'admin' || user?.role === 'secretary';
  const canDelete = user?.role === 'admin';
  const isAdmin = user?.role === 'admin'; // بس admin يقدر ينشئ حسابات (كيما اتفقنا)

  const loadMembers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchMembers(search);
      setRows(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadMembers();
    }, 400);
    return () => clearTimeout(timeout);
  }, [loadMembers]);

  function openAddDialog() {
    setSelectedMember(null);
    setDialogOpen(true);
  }

  function openEditDialog(member) {
    setSelectedMember(member);
    setDialogOpen(true);
  }

  function openAccountDialog(member) {
    setMemberForAccount(member);
    setAccountDialogOpen(true);
  }

  async function handleDelete(id) {
    if (!window.confirm('متأكد بغيت تحذف هذا العضو؟')) return;
    try {
      await deleteMember(id);
      loadMembers();
    } catch (error) {
      alert(error.response?.data?.message || 'حدث خطأ أثناء الحذف');
    }
  }

  const columns = [
    { field: 'nom', headerName: 'الاسم', width: 130 },
    { field: 'prenom', headerName: 'اللقب', width: 130 },
    { field: 'telephone', headerName: 'الهاتف', width: 130 },
    { field: 'poste', headerName: 'المنصب', width: 160 },
    { field: 'niveauEtude', headerName: 'المستوى الدراسي', width: 140 },
    { field: 'profession', headerName: 'الوظيفة', width: 130 },
    {
      field: 'hasAccount',
      headerName: 'حساب الدخول',
      width: 150,
      renderCell: (params) =>
        params.row.hasAccount ? (
          <Chip size="small" color="success" label={`${params.row.accountUsername} (${params.row.accountRole})`} />
        ) : (
          <Chip size="small" variant="outlined" label="بلا حساب" />
        ),
    },
    {
      field: 'actions',
      headerName: 'إجراءات',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          {isAdmin && !params.row.hasAccount && (
            <Tooltip title="إنشاء حساب دخول">
              <IconButton size="small" color="secondary" onClick={() => openAccountDialog(params.row)}>
                <KeyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
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
        أعضاء المكتب
      </Typography>

      <Stack direction="row" spacing={2} sx={{ marginBottom: 2 }}>
        <TextField
          label="بحث (اسم، لقب، هاتف، منصب)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ minWidth: 280 }}
        />

        {canEdit && (
          <Button variant="contained" onClick={openAddDialog}>
            + إضافة عضو
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

      <MemberFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSaved={loadMembers}
        member={selectedMember}
      />

      <CreateAccountDialog
        open={accountDialogOpen}
        onClose={() => setAccountDialogOpen(false)}
        onSaved={loadMembers}
        member={memberForAccount}
      />
    </div>
  );
}
