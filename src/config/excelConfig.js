// Excel dosyalarının başlangıç satır değerleri
// Her dosya tipi için istediğiniz satır numarasını buradan değiştirebilirsiniz

export const excelStartRows = {
  'stock': 100,                      // Günlük Stok Listesi
  'dcs-report': 50,                  // DCS Haftalık Rapor
  'electric': 100,                   // Elektrik Tüketimi
  'downtime': 50,                    // Duruş İşleri
  'sales': 200,                      // Satış Siparişleri
  'shipping': 200,                   // Yüklemeler
  'electrical-maintenance': 150,     // Elektrik Bakım
  'mechanical-maintenance': 150,     // Mekanik Bakım
  'electrical-downtime': 50,         // Elektrik Duruş
  'mechanical-downtime': 100         // Mekanik Duruş
};

// Zoom seviyeleri (100 = %100, 80 = %80)
export const excelZoomLevels = {
  'stock': 100,
  'dcs-report': 100,
  'electric': 100,
  'downtime': 100,
  'sales': 100,
  'shipping': 100,
  'electrical-maintenance': 80,
  'mechanical-maintenance': 100,
  'electrical-downtime': 100,
  'mechanical-downtime': 100
};
