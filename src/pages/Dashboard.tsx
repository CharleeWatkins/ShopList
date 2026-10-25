// src/pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, List, Users, CheckCircle, Plus, MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchUserLists } from '../store/listsSlice';
import { useUrlSync } from '../hooks/useUrlSync';
import { Button } from '../components/UI';
import { EditListModal, DeleteListModal } from '../components/ListModals';
import type { ShoppingList, SortField, SortOrder } from '../types'; // FIX: Added Sort Types

export const Dashboard = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { lists, status } = useAppSelector((state) => state.lists);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  // URL Sync for Search/Sort
  const { search, sort, order, updateUrl } = useUrlSync();

  // Modal & Dropdown State
  const [editingList, setEditingList] = useState<ShoppingList | null>(null);
  const [deletingList, setDeletingList] = useState<ShoppingList | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  useEffect(() => {
    if (user && status === 'idle') {
      dispatch(fetchUserLists(user.id));
    }
  }, [dispatch, user, status]);

  // Sorting & Filtering Logic
  const filteredAndSortedLists = lists
    .filter(l => l.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      let comparison = 0;
      if (sort === 'name') comparison = a.name.localeCompare(b.name);
      if (sort === 'category') comparison = a.category.localeCompare(b.category);
      if (sort === 'dateAdded') comparison = new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
      return order === 'asc' ? comparison : -comparison;
    });

  // Stats calculation
  const totalItems = lists.reduce((acc, l) => acc + l.items.length, 0);
  const totalShared = lists.filter((l) => l.sharedWith.length > 0).length;
  const totalCompleted = lists.filter((l) => l.items.length > 0 && l.items.every(i => i.completed)).length;

  if (status === 'loading') return <div className="page-content">Loading...</div>;

  return (
    <div onClick={() => setOpenDropdownId(null)}> {/* Click anywhere to close dropdown */}
      
      {/* Header & Stats */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Hey, {user?.name}</h1>
          <p className="page-subtitle">A fresh day. A little planning. You've got this.</p>
        </div>
        <Button onClick={() => navigate('/create-list')} style={{ display: 'flex', gap: '0.5rem' }}>
          <Plus size={18} /> Create new list
        </Button>
      </div>

      <div className="stats-grid-4">
        <div className="stat-card-4">
          <div className="stat-icon-pink"><ShoppingBag size={20} /></div>
          <div className="stat-info"><h3>{totalItems}</h3><p>Items to pick up</p></div>
        </div>
        <div className="stat-card-4">
          <div className="stat-icon-pink"><List size={20} /></div>
          <div className="stat-info"><h3>{lists.length}</h3><p>Total lists</p></div>
        </div>
        <div className="stat-card-4">
          <div className="stat-icon-pink"><Users size={20} /></div>
          <div className="stat-info"><h3>{totalShared}</h3><p>Shared lists</p></div>
        </div>
        <div className="stat-card-4">
          <div className="stat-icon-pink"><CheckCircle size={20} /></div>
          <div className="stat-info"><h3>{totalCompleted}</h3><p>Completed</p></div>
        </div>
      </div>

      {/* Filter & Sort Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="filter-tabs" style={{ marginBottom: 0 }}>
          <button className="filter-tab active">All lists <span>{lists.length}</span></button>
          <button className="filter-tab">Shared lists <span>{totalShared}</span></button>
          <button className="filter-tab">Completed <span>{totalCompleted}</span></button>
          <button className="filter-tab">Archived <span>0</span></button>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="text-muted" style={{ fontSize: '0.85rem' }}>Sort by:</span>
          <select 
            className="form-input" 
            style={{ padding: '0.4rem', width: 'auto', border: 'none', background: 'transparent', fontWeight: 500 }}
            value={`${sort}-${order}`}
            onChange={(e) => {
              // FIX: Strictly typed split
              const [newSort, newOrder] = e.target.value.split('-') as [SortField, SortOrder];
              updateUrl({ sort: newSort, order: newOrder });
            }}
          >
            <option value="dateAdded-desc">Last updated</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="category-asc">Category</option>
          </select>
        </div>
      </div>

      {/* Full-Width Grid */}
      <div className="lists-grid">
        {filteredAndSortedLists.length === 0 ? (
          <div className="panel" style={{ textAlign: 'center', padding: '4rem 2rem', gridColumn: '1 / -1' }}>
            <List size={48} style={{ color: 'var(--border-color)', margin: '0 auto 1rem' }} />
            <h2 style={{ marginBottom: '0.5rem' }}>No lists found</h2>
            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Try adjusting your search or create a new list.</p>
          </div>
        ) : (
          filteredAndSortedLists.map((list) => {
            const completed = list.items.filter(i => i.completed).length;
            const total = list.items.length;
            const progress = total === 0 ? 0 : (completed / total) * 100;
            const isComplete = total > 0 && completed === total;
            
            const previewText = list.items.length > 0 
              ? list.items.slice(0, 3).map(i => i.name).join(', ') + (list.items.length > 3 ? ` +${list.items.length - 3}` : '')
              : 'No items added yet.';

            return (
              <div key={list.id} className="list-card-new">
                
                {/* Card Header */}
                <div className="list-card-header">
                  <span className="list-meta">{list.category}</span>
                  
                  <div className="dropdown-container">
                    <button 
                      className="icon-button" 
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent parent onClick
                        setOpenDropdownId(openDropdownId === list.id ? null : list.id);
                      }}
                    >
                      <MoreHorizontal size={20} />
                    </button>
                    
                    {openDropdownId === list.id && (
                      <div className="dropdown-menu">
                        <button className="dropdown-item" onClick={() => setEditingList(list)}>
                          <Edit2 size={16} /> Edit
                        </button>
                        <button className="dropdown-item danger" onClick={() => setDeletingList(list)}>
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <h3 style={{ margin: '0.5rem 0', fontSize: '1.1rem' }}>{list.name}</h3>
                <p className="list-items-preview">{previewText}</p>
                
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${progress}%`, background: isComplete ? '#10b981' : 'var(--primary-pink)' }} 
                  />
                </div>
                
                <div className="list-footer">
                  <span>{completed} of {total} items</span>
                  <span style={{ fontWeight: 'bold', color: isComplete ? '#10b981' : 'var(--text-muted)' }}>
                    {isComplete ? 'Complete' : `${Math.round(progress)}%`}
                  </span>
                </div>
                <div className="list-footer" style={{ marginTop: '0.5rem' }}>
                  <span>Updated {new Date(list.dateAdded).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Render Modals */}
      {editingList && <EditListModal list={editingList} onClose={() => setEditingList(null)} />}
      {deletingList && <DeleteListModal list={deletingList} onClose={() => setDeletingList(null)} />}
    </div>
  );
};