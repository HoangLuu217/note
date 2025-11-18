import React, { useEffect, useState } from 'react';
import './App.css';

const STORAGE_KEY = 'notes-app-data';

function App() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  // Lấy danh sách notes từ localStorage
  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = () => {
    try {
      const savedNotes = localStorage.getItem(STORAGE_KEY);
      if (savedNotes) {
        const parsedNotes = JSON.parse(savedNotes);
        setNotes(parsedNotes);
      }
    } catch (error) {
      console.error('Có lỗi xảy ra khi tải dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveNotes = (notesToSave) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notesToSave));
      setNotes(notesToSave);
    } catch (error) {
      console.error('Có lỗi xảy ra khi lưu dữ liệu:', error);
      alert('Có lỗi xảy ra khi lưu note!');
    }
  };

  // Chọn note để chỉnh sửa
  const handleSelectNote = (note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
  };

  // Tạo note mới
  const handleNewNote = () => {
    setSelectedNote(null);
    setTitle('');
    setContent('');
  };

  // Lưu note (tạo mới hoặc cập nhật)
  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      alert('Vui lòng nhập tiêu đề và nội dung!');
      return;
    }

    const noteData = {
      id: selectedNote ? selectedNote.id : Date.now(),
      title: title.trim(),
      content: content.trim(),
      createdAt: selectedNote ? selectedNote.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    let updatedNotes;
    if (selectedNote) {
      // Cập nhật note
      updatedNotes = notes.map(note =>
        note.id === selectedNote.id ? noteData : note
      );
    } else {
      // Tạo note mới
      updatedNotes = [...notes, noteData];
    }

    saveNotes(updatedNotes);
    if (!selectedNote) {
      handleNewNote();
    }
  };

  // Xóa note
  const handleDelete = () => {
    if (!selectedNote) return;
    
    if (!window.confirm('Bạn có chắc chắn muốn xóa note này?')) {
      return;
    }

    const updatedNotes = notes.filter(note => note.id !== selectedNote.id);
    saveNotes(updatedNotes);
    handleNewNote();
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <div className="app-container">
      {/* Sidebar - Danh sách notes */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h1>📝 Ghi chú</h1>
          <button className="btn-new" onClick={handleNewNote}>
            + Note mới
          </button>
        </div>
        <div className="notes-list">
          {notes.length === 0 ? (
            <div className="empty-state">
              <p>Chưa có ghi chú nào</p>
              <p className="hint">Tạo note mới để bắt đầu!</p>
            </div>
          ) : (
            notes.map(note => (
              <div
                key={note.id}
                className={`note-item ${selectedNote?.id === note.id ? 'active' : ''}`}
                onClick={() => handleSelectNote(note)}
              >
                <h3 className="note-title">{note.title}</h3>
                <p className="note-preview">
                  {note.content.length > 50 
                    ? note.content.substring(0, 50) + '...' 
                    : note.content}
                </p>
                <span className="note-date">
                  {new Date(note.createdAt).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main content - Form viết/chỉnh sửa note */}
      <div className="main-content">
        <div className="editor">
          <div className="editor-header">
            <h2>{selectedNote ? 'Chỉnh sửa note' : 'Note mới'}</h2>
            {selectedNote && (
              <button className="btn-delete" onClick={handleDelete}>
                🗑️ Xóa
              </button>
            )}
          </div>
          
          <div className="form-group">
            <label>Tiêu đề</label>
            <input
              type="text"
              className="input-title"
              placeholder="Nhập tiêu đề..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Nội dung</label>
            <textarea
              className="textarea-content"
              placeholder="Nhập nội dung..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={15}
            />
          </div>

          <div className="editor-footer">
            <button 
              className="btn-save" 
              onClick={handleSave}
            >
              💾 Lưu
            </button>
            {selectedNote && (
              <button className="btn-cancel" onClick={handleNewNote}>
                Hủy
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
