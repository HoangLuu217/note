import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:3001/notes';

function App() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Lấy danh sách notes từ json-server
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await axios.get(API_URL);
      setNotes(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Có lỗi xảy ra khi lấy dữ liệu:', error);
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        console.warn('Json-server có thể chưa sẵn sàng. Vui lòng đợi vài giây...');
      }
      setLoading(false);
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
  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      alert('Vui lòng nhập tiêu đề và nội dung!');
      return;
    }

    setSaving(true);
    try {
      const noteData = {
        title: title.trim(),
        content: content.trim(),
        createdAt: selectedNote ? selectedNote.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      let response;
      if (selectedNote) {
        // Cập nhật note
        response = await axios.put(`${API_URL}/${selectedNote.id}`, noteData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } else {
        // Tạo note mới
        response = await axios.post(API_URL, noteData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }

      // Đợi một chút để đảm bảo server đã xử lý xong
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await fetchNotes();
      if (!selectedNote) {
        handleNewNote();
      }
    } catch (error) {
      console.error('Có lỗi xảy ra khi lưu:', error);
      let errorMessage = 'Có lỗi xảy ra khi lưu note!';
      
      if (error.response) {
        // Server trả về lỗi
        errorMessage = `Lỗi từ server: ${error.response.status} - ${error.response.statusText}`;
        if (error.response.data) {
          console.error('Chi tiết lỗi:', error.response.data);
        }
      } else if (error.request) {
        // Request đã được gửi nhưng không nhận được response
        errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra json-server có đang chạy tại http://localhost:3001 không!';
      } else {
        // Lỗi khi setup request
        errorMessage = `Lỗi: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Xóa note
  const handleDelete = async () => {
    if (!selectedNote) return;
    
    if (!window.confirm('Bạn có chắc chắn muốn xóa note này?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/${selectedNote.id}`);
      await fetchNotes();
      handleNewNote();
    } catch (error) {
      console.error('Có lỗi xảy ra khi xóa:', error);
      alert('Có lỗi xảy ra khi xóa note!');
    }
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
              disabled={saving}
            >
              {saving ? 'Đang lưu...' : '💾 Lưu'}
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
