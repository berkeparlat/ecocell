import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SimpleHeader from '../../components/layout/SimpleHeader';
import { Upload, Download, RefreshCw, Calendar, FileSpreadsheet, Trash2, ShoppingCart, Lock } from 'lucide-react';
import { uploadExcelFile, getLatestExcelFile, fetchAndParseExcel, listAllExcelFiles, deleteExcelFile } from '../../services/excelService';
import { useApp } from '../../context/AppContext';
import { isAdmin } from '../../services/adminService';
import './SalesOrder.css';

const SalesOrder = () => {
  const navigate = useNavigate();
  const { user } = useApp();
  const isUserAdmin = user && isAdmin(user);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [excelData, setExcelData] = useState(null);
  const [latestFile, setLatestFile] = useState(null);
  const [allFiles, setAllFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    loadLatestFile();
    loadAllFiles();
  }, []);

  const loadLatestFile = async () => {
    setLoading(true);
    try {
      const file = await getLatestExcelFile('sales');
      if (file) {
        setLatestFile(file);
        const parsedData = await fetchAndParseExcel(file.url);
        setExcelData(parsedData);
      }
    } catch (error) {
      console.error('Dosya yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllFiles = async () => {
    try {
      const files = await listAllExcelFiles('sales');
      setAllFiles(files);
    } catch (error) {
      console.error('Dosya listesi yükleme hatası:', error);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Lütfen bir dosya seçin!');
      return;
    }

    setUploading(true);
    try {
      await uploadExcelFile(selectedFile, 'sales');
      alert('Dosya başarıyla yüklendi!');
      setSelectedFile(null);
      document.getElementById('fileInput').value = '';
      await loadLatestFile();
      await loadAllFiles();
    } catch (error) {
      alert('Dosya yüklenirken hata oluştu: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileRef, fileName) => {
    if (!window.confirm(`"${fileName}" dosyasını silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      await deleteExcelFile(fileRef);
      alert('Dosya silindi!');
      await loadLatestFile();
      await loadAllFiles();
    } catch (error) {
      alert('Dosya silinirken hata oluştu!');
    }
  };

  const handleDownload = (url, fileName) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR') + ' ' + date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="sales-order-page">
      <SimpleHeader />
      
      <div className="sales-container">
        <div className="sales-header">
          <div className="header-title">
            <ShoppingCart size={32} />
            <div>
              <h1>Satış Sipariş Takibi</h1>
              <p>Excel dosyalarını yükleyin ve görüntüleyin</p>
            </div>
          </div>
          <button className="refresh-btn" onClick={() => { loadLatestFile(); loadAllFiles(); }}>
            <RefreshCw size={18} />
            Yenile          </button>
        </div>

        {/* Upload Section - Sadece Admin */}
        {isUserAdmin && (
          <div className="upload-section">
            <div className="upload-card">
              <div className="upload-icon">
                <Upload size={48} />
              </div>
              <h3>Yeni Excel Dosyası Yükle</h3>
              <p>Güncellenmiş satış sipariş dosyanızı buradan yükleyebilirsiniz</p>
              
              <div className="file-input-wrapper">
                <input
                  id="fileInput"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  className="file-input"
                />
                <label htmlFor="fileInput" className="file-input-label">
                  <Upload size={18} />
                  {selectedFile ? selectedFile.name : 'Dosya Seç'}
                </label>
              </div>

              {selectedFile && (
                <button 
                  className="upload-btn" 
                  onClick={handleUpload}
                  disabled={uploading}
                >
                  {uploading ? 'Yükleniyor...' : 'Yükle'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Admin olmayan kullanıcılar için bilgilendirme */}
        {!isUserAdmin && (
          <div className="info-section">
            <div className="info-card">
              <Lock size={32} />
              <h3>Dosya Yükleme Yetkisi</h3>
              <p>Yeni dosya yüklemek için admin yetkisine ihtiyacınız var. Güncel verileri aşağıda görüntüleyebilirsiniz.</p>
            </div>
          </div>
        )}

        {latestFile && (
          <div className="latest-file-info">
            <div className="file-info-header">
              <Calendar size={20} />
              <span>Son Yüklenen Dosya</span>
            </div>
            <div className="file-info-content">
              <div className="file-details">
                <p><strong>Dosya Adı:</strong> {latestFile.name}</p>
                <p><strong>Yüklenme Tarihi:</strong> {formatDate(latestFile.uploadDate)}</p>
                <p><strong>Dosya Boyutu:</strong> {formatFileSize(latestFile.size)}</p>
              </div>
              <button 
                className="download-btn"
                onClick={() => handleDownload(latestFile.url, latestFile.name)}
              >
                <Download size={18} />
                İndir
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading-state">
            <RefreshCw className="spin" size={48} />
            <p>Yükleniyor...</p>
          </div>
        ) : excelData ? (
          <div className="excel-viewer">
            <div className="excel-header">
              <h3>{excelData.sheetName}</h3>
            </div>
            <div className="table-wrapper">
              <table className="excel-table">
                <thead>
                  <tr>
                    {excelData.data[0]?.map((header, index) => (
                      <th key={index}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {excelData.data.slice(1).map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <FileSpreadsheet size={64} />
            <h3>Henüz dosya yüklenmemiş</h3>
            <p>Başlamak için yukarıdan bir Excel dosyası yükleyin</p>
          </div>
        )}

        {allFiles.length > 0 && (
          <div className="file-history">
            <h3>Dosya Geçmişi</h3>
            <div className="history-list">
              {allFiles.map((file, index) => (
                <div key={index} className="history-item">
                  <div className="history-info">
                    <FileSpreadsheet size={20} />
                    <div>
                      <p className="file-name">{file.name}</p>
                      <p className="file-date">{formatDate(file.uploadDate)}</p>
                    </div>
                  </div>
                  <div className="history-actions">                    <button
                      className="btn-download"
                      onClick={() => handleDownload(file.url, file.name)}
                      title="İndir"
                    >
                      <Download size={16} />
                    </button>
                    {isUserAdmin && (
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(file.ref, file.name)}
                        title="Sil"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesOrder;
