// app/page.js
'use client';
import {
  Box, Button, Checkbox, Container, FormControl, InputLabel, MenuItem,
  OutlinedInput, Select, TextField, Typography, ListItemText, Paper,
  IconButton, Divider, Pagination, Tooltip, Zoom, Fade, Grow
} from '@mui/material';
import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Add, Edit, Delete, Cancel, CheckCircle, 
  RadioButtonUnchecked, Circle, Task, Category,
  Search, FilterAlt, DateRange, Star, StarBorder
} from '@mui/icons-material';

const categories = ['Homework', 'Office Work', 'Personal', 'Shopping'];
const statuses = ['Not Started', 'Pending', 'Completed'];

export default function Page() {
  const [form, setForm] = useState({ 
    title: '', 
    description: '', 
    category: '', 
    status: 'Not Started' 
  });
  const [todos, setTodos] = useState([]);
  const [filters, setFilters] = useState({
    search: '', 
    categories: [], 
    status: [], 
    modifiedStart: '', 
    modifiedEnd: '', 
    showCompleted: false
  });
  const [editId, setEditId] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hoveredTodo, setHoveredTodo] = useState(null);

  const fetchTodos = async () => {
    const res = await axios.get('http://localhost:3001/api/todos', {
      params: {
        search: filters.search,
        categories: filters.categories.join(','),
        status: filters.status.join(','),
        modifiedStart: filters.modifiedStart,
        modifiedEnd: filters.modifiedEnd,
        showCompleted: filters.showCompleted,
        page,
        limit: 5,
      },
    });
    setTodos(res.data.todos);
    setTotal(res.data.totalCount);
  };

  useEffect(() => {
    fetchTodos();
  }, [filters, page]);

  const handleInput = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.title || !form.category) return alert('Title & Category required');

    try {
      if (editId) {
        await axios.put(`http://localhost:3001/api/todos/${editId}`, form);
        setEditId(null);
      } else {
        await axios.post('http://localhost:3001/api/todos', form);
      }

      setForm({ title: '', description: '', category: '', status: 'Not Started' });
      fetchTodos();
    } catch (error) {
      console.error('Error saving TODO:', error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this TODO?")) {
      await axios.delete(`http://localhost:3001/api/todos/${id}`);
      fetchTodos();
    }
  };

  const handleEdit = (todo) => {
    setForm({
      title: todo.title,
      description: todo.description,
      category: todo.category,
      status: todo.status,
    });
    setEditId(todo._id);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircle color="success" />;
      case 'Pending': return <RadioButtonUnchecked color="warning" />;
      default: return <Circle color="disabled" />;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
      {/* Header with animated title */}
      <Box sx={{ 
        textAlign: 'center', 
        mb: 4,
        '& h4': {
          background: 'linear-gradient(45deg, #ff0099, #00ffcc)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 'bold',
          fontSize: '2.5rem',
          letterSpacing: '2px',
          animation: 'glow 2s ease-in-out infinite alternate',
          textShadow: '0 0 10px rgba(255,0,153,0.5)'
        }
      }}>
        <Typography variant="h4" component="h1">
          <Task sx={{ verticalAlign: 'middle', mr: 1, fontSize: '2.5rem' }} />
          TODO Manager
        </Typography>
      </Box>

      {/* CREATE/EDIT FORM */}
      <Grow in={true}>
        <Paper elevation={6} sx={{ 
          p: 3, 
          mb: 4,
          background: 'rgba(30, 41, 59, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}>
          <Typography variant="h6" gutterBottom sx={{ color: '#00ffcc' }}>
            {editId ? 'Edit TODO' : 'Add New TODO'}
          </Typography>
          <Box display="flex" gap={2} flexDirection="column">
            <TextField
              label="Title"
              name="title"
              value={form.title}
              onChange={handleInput}
              variant="outlined"
              fullWidth
              InputProps={{
                sx: { color: 'white' }
              }}
              InputLabelProps={{
                sx: { color: '#94a3b8' }
              }}
            />
            <TextField
              label="Description"
              name="description"
              value={form.description}
              onChange={handleInput}
              variant="outlined"
              multiline
              rows={3}
              fullWidth
              InputProps={{
                sx: { color: 'white' }
              }}
              InputLabelProps={{
                sx: { color: '#94a3b8' }
              }}
            />
            <Box display="flex" gap={2}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#94a3b8' }}>Category</InputLabel>
                <Select
                  name="category"
                  value={form.category}
                  onChange={handleInput}
                  sx={{ color: 'white' }}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Category sx={{ mr: 1, fontSize: '1rem' }} />
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#94a3b8' }}>Status</InputLabel>
                <Select
                  name="status"
                  value={form.status}
                  onChange={handleInput}
                  sx={{ color: 'white' }}
                >
                  {statuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {getStatusIcon(status)}
                      <Box component="span" sx={{ ml: 1 }}>{status}</Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box display="flex" gap={2} mt={2}>
              <Button
                onClick={handleSubmit}
                variant="contained"
                startIcon={editId ? <Edit /> : <Add />}
                sx={{
                  flex: 1,
                  background: 'linear-gradient(45deg, #ff0099, #0ea5e9)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #0ea5e9, #00ffcc)',
                    boxShadow: '0 0 15px rgba(0, 229, 255, 0.5)'
                  }
                }}
              >
                {editId ? "Update" : "Add"}
              </Button>
              {editId && (
                <Button
                  onClick={() => {
                    setEditId(null);
                    setForm({ title: '', description: '', category: '', status: 'Not Started' });
                  }}
                  variant="outlined"
                  color="error"
                  startIcon={<Cancel />}
                  sx={{ flex: 1 }}
                >
                  Cancel
                </Button>
              )}
            </Box>
          </Box>
        </Paper>
      </Grow>

      {/* FILTERS */}
      <Fade in={true} timeout={800}>
        <Paper elevation={6} sx={{ 
          p: 3, 
          mb: 4,
          background: 'rgba(30, 41, 59, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px'
        }}>
          <Typography variant="h6" gutterBottom sx={{ 
            color: '#0ea5e9',
            display: 'flex',
            alignItems: 'center'
          }}>
            <FilterAlt sx={{ mr: 1 }} /> Filters
          </Typography>
          <Box display="flex" flexDirection="column" gap={3}>
            <TextField
              label="Search"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              variant="outlined"
              fullWidth
              InputProps={{
                startAdornment: <Search sx={{ color: '#94a3b8', mr: 1 }} />,
                sx: { color: 'white' }
              }}
              InputLabelProps={{
                sx: { color: '#94a3b8' }
              }}
            />
            <Box display="flex" gap={2}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#94a3b8' }}>Category</InputLabel>
                <Select
                  multiple
                  value={filters.categories}
                  onChange={(e) => setFilters({ ...filters, categories: e.target.value })}
                  input={<OutlinedInput label="Category" />}
                  renderValue={(selected) => selected.join(', ')}
                  sx={{ color: 'white' }}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      <Checkbox checked={filters.categories.includes(cat)} sx={{ color: '#0ea5e9' }} />
                      <ListItemText primary={cat} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#94a3b8' }}>Status</InputLabel>
                <Select
                  multiple
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  input={<OutlinedInput label="Status" />}
                  renderValue={(selected) => selected.join(', ')}
                  sx={{ color: 'white' }}
                >
                  {statuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      <Checkbox checked={filters.status.includes(status)} sx={{ color: '#0ea5e9' }} />
                      <ListItemText primary={status} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box display="flex" gap={2}>
              <TextField
                label="Start Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={filters.modifiedStart}
                onChange={(e) => setFilters({ ...filters, modifiedStart: e.target.value })}
                fullWidth
                InputProps={{
                  startAdornment: <DateRange sx={{ color: '#94a3b8', mr: 1 }} />,
                  sx: { color: 'white' }
                }}
              />
              <TextField
                label="End Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={filters.modifiedEnd}
                onChange={(e) => setFilters({ ...filters, modifiedEnd: e.target.value })}
                fullWidth
                InputProps={{
                  sx: { color: 'white' }
                }}
              />
            </Box>
            <Box display="flex" alignItems="center">
              <Checkbox
                checked={filters.showCompleted}
                onChange={(e) => setFilters({ ...filters, showCompleted: e.target.checked })}
                sx={{ color: '#0ea5e9' }}
              />
              <Typography sx={{ color: '#94a3b8' }}>Show Completed</Typography>
            </Box>
          </Box>
        </Paper>
      </Fade>

      {/* TODO LIST */}
      <Box>
        <Typography variant="h6" gutterBottom sx={{ 
          color: '#ff0099',
          mb: 2,
          display: 'flex',
          alignItems: 'center'
        }}>
          <Task sx={{ mr: 1 }} /> Your TODOs ({total})
        </Typography>
        
        {todos.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Star sx={{ fontSize: '3rem', color: '#0ea5e9', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#94a3b8' }}>
              No TODOs found. Add one to get started!
            </Typography>
          </Box>
        ) : (
          <Box display="flex" flexDirection="column" gap={2}>
            {todos.map((todo) => (
              <Zoom in={true} key={todo._id}>
                <Paper
                  elevation={hoveredTodo === todo._id ? 8 : 4}
                  onMouseEnter={() => setHoveredTodo(todo._id)}
                  onMouseLeave={() => setHoveredTodo(null)}
                  sx={{
                    p: 3,
                    border: '1px solid',
                    borderColor: todo.status === 'Completed' ? 
                      'rgba(0, 255, 204, 0.3)' : 
                      todo.status === 'Pending' ? 
                      'rgba(255, 165, 0, 0.3)' : 
                      'rgba(148, 163, 184, 0.3)',
                    borderRadius: '12px',
                    background: `linear-gradient(
                      to right bottom,
                      rgba(30, 41, 59, 0.8),
                      rgba(15, 23, 42, 0.9)
                    )`,
                    backdropFilter: 'blur(5px)',
                    transition: 'all 0.3s ease',
                    transform: hoveredTodo === todo._id ? 'translateY(-5px)' : 'none',
                    boxShadow: hoveredTodo === todo._id ? 
                      `0 10px 25px -5px ${todo.status === 'Completed' ? 
                        'rgba(0, 255, 204, 0.3)' : 
                        todo.status === 'Pending' ? 
                        'rgba(255, 165, 0, 0.3)' : 
                        'rgba(148, 163, 184, 0.3)'}` : 
                      'none'
                  }}
                >
                  <Box display="flex" justifyContent="space-between">
                    <Box>
                      <Typography variant="h6" sx={{ 
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        mb: 1
                      }}>
                        {getStatusIcon(todo.status)}
                        <Box component="span" sx={{ ml: 1 }}>{todo.title}</Box>
                      </Typography>
                      <Typography sx={{ 
                        color: '#94a3b8',
                        mb: 2
                      }}>
                        {todo.description}
                      </Typography>
                      <Box display="flex" gap={2} sx={{ mb: 1 }}>
                        <Typography variant="caption" sx={{ 
                          color: '#0ea5e9',
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          <Category sx={{ fontSize: '1rem', mr: 0.5 }} /> {todo.category}
                        </Typography>
                        <Typography variant="caption" sx={{ 
                          color: todo.status === 'Completed' ? '#00ffcc' : 
                                todo.status === 'Pending' ? '#ffa500' : '#94a3b8',
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          <Circle sx={{ fontSize: '0.6rem', mr: 0.5 }} /> {todo.status}
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" gap={1}>
                      <Tooltip title="Edit" TransitionComponent={Zoom}>
                        <IconButton 
                          onClick={() => handleEdit(todo)}
                          sx={{ 
                            color: '#0ea5e9',
                            '&:hover': { 
                              background: 'rgba(14, 165, 233, 0.1)',
                              transform: 'scale(1.1)'
                            }
                          }}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete" TransitionComponent={Zoom}>
                        <IconButton 
                          onClick={() => handleDelete(todo._id)}
                          sx={{ 
                            color: '#ff0099',
                            '&:hover': { 
                              background: 'rgba(255, 0, 153, 0.1)',
                              transform: 'scale(1.1)'
                            }
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      Created: {new Date(todo.created_at).toLocaleString()}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      Modified: {new Date(todo.modified_at).toLocaleString()}
                    </Typography>
                  </Box>
                </Paper>
              </Zoom>
            ))}
          </Box>
        )}
      </Box>

      {/* PAGINATION */}
      {todos.length > 0 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={Math.ceil(total / 5)}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            sx={{
              '& .MuiPaginationItem-root': {
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              },
              '& .MuiPaginationItem-root.Mui-selected': {
                background: 'linear-gradient(45deg, #ff0099, #0ea5e9)',
                fontWeight: 'bold'
              },
              '& .MuiPaginationItem-root:hover': {
                background: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          />
        </Box>
      )}
    </Container>
  );
}