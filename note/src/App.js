import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lấy dữ liệu từ json-server
    axios.get('http://localhost:3001/notes')
      .then(response => {
        setNotes(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Có lỗi xảy ra khi lấy dữ liệu:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="App">Đang tải...</div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Danh sách ghi chú</h1>
        <div>
          {notes.length === 0 ? (
            <p>Chưa có ghi chú nào</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {notes.map(note => (
                <li key={note.id} style={{ marginBottom: '20px', textAlign: 'left' }}>
                  <h2>{note.title}</h2>
                  <p>{note.content}</p>
                  <small>{new Date(note.createdAt).toLocaleDateString('vi-VN')}</small>
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;
