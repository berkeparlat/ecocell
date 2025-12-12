// Excel dosyalarının başlangıç satır değerleri
// Her dosya tipi için istediğiniz satır numarasını buradan değiştirebilirsiniz

export const excelStartRows = {
  'stock': 1,                        // Günlük Stok Listesi
  'dcs-a': 1,                        // DCS Haftalık Rapor A Hattı
  'dcs-b': 1,                        // DCS Haftalık Rapor B Hattı
  'dcs-buhar': 1,                    // DCS Haftalık Rapor Buhar
  'dcs-a012': 1,                     // DCS Haftalık Rapor A Hattı - A012 Bölgesi
  'dcs-a021': 1,                     // DCS Haftalık Rapor A Hattı - A021 Bölgesi
  'dcs-b012': 1,                     // DCS Haftalık Rapor B Hattı - B012 Bölgesi
  'dcs-b021': 1,                     // DCS Haftalık Rapor B Hattı - B021 Bölgesi
  'electric': 1,                     // Elektrik Tüketimi
  'hydraulic': 1,                    // Hidrolik
  'downtime': 1,                     // Duruş İşleri
  'sales': 1,                        // Satış Siparişleri
  'shipping': 2300,                  // Yüklemeler
  'electrical-maintenance': 1400,    // Elektrik Bakım
  'mechanical-maintenance': 1,     // Mekanik Bakım
  'electrical-downtime': 1,          // Elektrik Duruş
  'mechanical-downtime': 1,          // Mekanik Duruş
  'operations-downtime': 1           // İşletme Duruş Raporu
};

// Zoom seviyeleri (100 = %100, 80 = %80)
export const excelZoomLevels = {
  'stock': 50,
  'dcs-a': 50,
  'dcs-b': 50,
  'dcs-buhar': 50,
  'dcs-a012': 50,
  'dcs-a021': 50,
  'dcs-b012': 50,
  'dcs-b021': 50,
  'electric': 90,
  'hydraulic': 80,
  'downtime': 50,
  'sales': 50,
  'shipping': 50,
  'electrical-maintenance': 80,
  'mechanical-maintenance': 80,
  'electrical-downtime': 80,
  'mechanical-downtime': 80,
  'operations-downtime': 80
};
