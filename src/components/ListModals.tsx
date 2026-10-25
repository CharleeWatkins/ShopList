// src/components/ListModals.tsx
import { useState} from 'react';
import { X, CheckCircle2, Circle, Trash2 } from 'lucide-react';
import { useAppDispatch } from '../hooks/redux';
import { updateList, deleteList } from '../store/listsSlice';
import { Button} from './UI';
import toast from 'react-hot-toast';
import type { ShoppingList, ShoppingItem } from '../types';

interface ModalProps {
  list: ShoppingList;
  onClose: () => void;
}

// --- EDIT MODAL ---
export const EditListModal = ({ list, onClose }: ModalProps) => {
  const dispatch = useAppDispatch();
  const [name, setName] = useState(list.name);
  const [category, setCategory] = useState(list.category);
  const [items, setItems] = useState<ShoppingItem[]>(list.items);
  const [isSaving, setIsSaving] = useState(false);

  const toggleItem = (itemId: string) => {
    setItems(items.map(i => i.id === itemId ? { ...i, completed: !i.completed } : i));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await dispatch(updateList({ id: list.id, updates: { name, category, items } })).unwrap();
      toast.success('List updated!');
      onClose();
    } catch {
      toast.error('Failed to update list.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit List</h2>
          <button onClick={onClose} className="icon-button"><X size={20} /></button>
        </div>
        
        <div className="form-group">
          <label className="form-label">List Name</label>
          <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        
        <div className="form-group">
          <label className="form-label">Category</label>
          <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="Groceries">Groceries</option>
            <option value="Household">Household</option>
            <option value="Hardware">Hardware</option>
            <option value="Personal">Personal</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Items</label>
          <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.5rem' }}>
            {items.map(item => (
              <div key={item.id} className="checklist-item" style={{ padding: '0.5rem', cursor: 'pointer' }} onClick={() => toggleItem(item.id)}>
                <div className="checklist-item-left">
                  {item.completed ? <CheckCircle2 size={18} color="var(--primary-pink)" /> : <Circle size={18} color="var(--text-muted)" />}
                  <label style={{ textDecoration: item.completed ? 'line-through' : 'none', margin: 0 }}>{item.name}</label>
                </div>
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>{item.quantity}</span>
              </div>
            ))}
            {items.length === 0 && <p className="text-muted" style={{ fontSize: '0.85rem' }}>No items in this list.</p>}
          </div>
        </div>

        <div className="modal-actions">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} isLoading={isSaving}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
};

// --- DELETE MODAL ---
export const DeleteListModal = ({ list, onClose }: ModalProps) => {
  const dispatch = useAppDispatch();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await dispatch(deleteList(list.id)).unwrap();
      toast.success('List deleted successfully');
      onClose();
    } catch {
      toast.error('Failed to delete list');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: '#ef4444' }}>
          <Trash2 size={48} />
        </div>
        <h2 style={{ marginTop: 0 }}>Delete "{list.name}"?</h2>
        <p className="text-muted">Are you sure you want to delete this list? This action cannot be undone.</p>
        
        <div className="modal-actions" style={{ justifyContent: 'center' }}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleDelete} isLoading={isDeleting} style={{ background: '#ef4444' }}>Delete</Button>
        </div>
      </div>
    </div>
  );
};