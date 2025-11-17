// Excel dosyalarının başlangıç satır değerleri
// Her dosya tipi için istediğiniz satır numarasını buradan değiştirebilirsiniz

export const excelStartRows = {
  'stock': 1,                        // Günlük Stok Listesi
  'dcs-a': 1,                        // DCS Haftalık Rapor A Hattı
  'dcs-b': 1,                        // DCS Haftalık Rapor B Hattı
  'dcs-buhar': 1,                    // DCS Haftalık Rapor Buhar
  'electric': 1,                     // Elektrik Tüketimi
  'downtime': 1,                     // Duruş İşleri
  'sales': 1,                        // Satış Siparişleri
  'shipping': 2100,                  // Yüklemeler
  'electrical-maintenance': 1230,    // Elektrik Bakım
  'mechanical-maintenance': 480,     // Mekanik Bakım
  'electrical-downtime': 1,          // Elektrik Duruş
  'mechanical-downtime': 1         // Mekanik Duruş
};

// Zoom seviyeleri (100 = %100, 80 = %80)
export const excelZoomLevels = {
  'stock': 100,
  'dcs-a': 60,
  'dcs-b': 60,
  'dcs-buhar': 100,
  'electric': 100,
  'downtime': 100,
  'sales': 100,
  'shipping': 100,
  'electrical-maintenance': 80,
  'mechanical-maintenance': 100,
  'electrical-downtime': 100,
  'mechanical-downtime': 100
};
