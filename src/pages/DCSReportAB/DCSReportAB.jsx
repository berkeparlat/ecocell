import React, { useState, useEffect } from 'react';
import { getLatestExcelFile } from '../../services/excelService';
import ExcelPreview from '../../components/excel/ExcelPreview';
import './DCSReportAB.css';

const DCSReportAB = () => {
  const [fileDataA, setFileDataA] = useState(null);
  const [fileDataB, setFileDataB] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadExcelFiles();
  }, []);

  const loadExcelFiles = async () => {
    try {
      setLoading(true);
      setError(null);

      const [dataA, dataB] = await Promise.all([
        getLatestExcelFile('dcs-a'),
        getLatestExcelFile('dcs-b')
      ]);

      setFileDataA(dataA);
      setFileDataB(dataB);
    } catch (err) {
      console.error('Excel dosyaları yüklenirken hata:', err);
      setError('Excel dosyaları yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dcs-report-ab-container">
        <div className="loading">Yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dcs-report-ab-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="dcs-report-ab-container">
      <h1 className="page-title">DCS Haftalık Rapor - A ve B Hattı</h1>
      
      <div className="dual-excel-view">
        <div className="excel-column">
          <h2 className="column-title">A Hattı</h2>
          {fileDataA && (
            <ExcelPreview
              fileUrl={fileDataA.viewerUrl}
              fileName={fileDataA.name}
            />
          )}
        </div>

        <div className="excel-column">
          <h2 className="column-title">B Hattı</h2>
          {fileDataB && (
            <ExcelPreview
              fileUrl={fileDataB.viewerUrl}
              fileName={fileDataB.name}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DCSReportAB;
