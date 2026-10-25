// src/pages/CreateList.tsx
import { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Trash2, Plus, AlertCircle} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { createList } from '../store/listsSlice';
import { Button, Input } from '../components/UI';
import type { ShoppingItem } from '../types';

export const CreateList = () => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Groceries',
    notes: '',
    dateAdded: new Date().toISOString().split('T')[0], // Default to today YYYY-MM-DD
  });

  // Local state for items being added
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [currentItemName, setCurrentItemName] = useState('');
  const [currentItemQty, setCurrentItemQty] = useState('1');

  const [isLoading, setIsLoading] = useState(false);
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleAddItem = () => {
    if (!currentItemName.trim()) return;
    
    const newItem: ShoppingItem = {
      id: crypto.randomUUID(),
      name: currentItemName,
      quantity: currentItemQty || '1',
      completed: false,
    };

    setItems([...items, newItem]);
    setCurrentItemName('');
    setCurrentItemQty('1');
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);

    try {
      await dispatch(createList({
        userId: user.id,
        name: formData.name,
        category: formData.category,
        notes: formData.notes,
        dateAdded: new Date(formData.dateAdded).toISOString(), // Save as ISO format
        sharedWith: [],
        items: items,
      })).unwrap();

      toast.success('Shopping list created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to create list');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Create a new list</h1>
          <p className="page-subtitle">From first thought to fully stocked. Start right here.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="create-list-grid">
          
          {/* LEFT COLUMN */}
          <div>
            {/* The Essentials Panel */}
            <div className="panel">
              <h2 className="panel-title">The essentials</h2>
              
              <Input
                id="name"
                label="List name"
                placeholder="e.g., Weekend brunch"
                value={formData.name}
                onChange={handleChange}
                required
              />
              
              <div className="form-group">
                <label htmlFor="notes" className="form-label">Notes (optional)</label>
                <textarea
                  id="notes"
                  className="form-input"
                  placeholder="Sunday brunch for four..."
                  value={formData.notes}
                  onChange={handleChange}
                  rows={2}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category" className="form-label">Category</label>
                  <select id="category" className="form-input" value={formData.category} onChange={handleChange}>
                    <option value="Groceries">Groceries</option>
                    <option value="Household">Household</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>
                
                {/* REAL FUNCTIONING DATE PICKER */}
                <div className="form-group">
                  <label htmlFor="dateAdded" className="form-label">Shopping date</label>
                  <input 
                    id="dateAdded"
                    type="date" 
                    className="form-input" 
                    value={formData.dateAdded} 
                    onChange={handleChange} 
                    required
                  />
                </div>
              </div>
            </div>

            {/* Items Panel */}
            <div className="panel">
              <h2 className="panel-title">
                Items <span className="badge-count">{items.length}</span>
              </h2>
              
              {/* Add Item Input Row */}
              <div className="item-input-row">
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="+ Add an item, like fresh orange juice"
                  value={currentItemName}
                  onChange={(e) => setCurrentItemName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem())}
                />
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Qty"
                  style={{ maxWidth: '80px' }}
                  value={currentItemQty}
                  onChange={(e) => setCurrentItemQty(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem())}
                />
                <Button type="button" onClick={handleAddItem} style={{ padding: '0 1rem' }}>
                  <Plus size={18} />
                </Button>
              </div>

              {/* Items Table */}
              {items.length > 0 ? (
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Quantity</th>
                      <th style={{ width: '40px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>
                          <button 
                            type="button" 
                            className="icon-button" 
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-muted" style={{ fontSize: '0.85rem', fontStyle: 'italic', textAlign: 'center', padding: '1rem 0' }}>
                  No items added to this list yet.
                </p>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN (Sidebar summary) */}
          <div>
            <div className="panel">
              <h2 className="panel-title">List summary</h2>
              <p className="text-muted" style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                {formData.name || 'Untitled list'}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                <span>{items.length} items</span>
                <span>1 category</span>
              </div>
            </div>

            <div className="panel">
              <h2 className="panel-title">Make it yours</h2>
              <div className="form-group">
                <label className="form-label">Budget (optional)</label>
                <input type="text" className="form-input" placeholder="R 40.00" />
              </div>
              
              <div className="setting-item" style={{ padding: '1rem 0', borderTop: '1px solid var(--border-color)', marginTop: '1rem' }}>
                <div>
                  <strong style={{ fontSize: '0.9rem' }}>Group items by category</strong>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <Button type="button" variant="secondary" onClick={() => navigate('/dashboard')} style={{ flex: 1 }}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isLoading} style={{ flex: 2 }}>
                Create list
              </Button>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '1rem' }}>
              <AlertCircle size={14} /> Only you can see this list until you share it.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};