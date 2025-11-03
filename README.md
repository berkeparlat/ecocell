# 🏢 Ecocell - İş Yönetim ve Takip Sistemi# TaskFlow - Modern Project Management System



Modern, kullanıcı dostu iş takip ve proje yönetim sistemi. React + Vite ile geliştirilmiş, Firebase entegrasyonlu, Excel otomasyonu destekli kurumsal uygulama.A modern, feature-rich project management application built with React and Vite. Similar to Jira, Trello, and ClickUp, TaskFlow provides an intuitive interface for managing projects and tasks.



## ✨ Özellikler## ✨ Features



### 📊 Görev Yönetimi### Core Features

- **Kanban Board** - Sürükle-bırak görev yönetimi- 📊 **Kanban Board** - Drag and drop tasks between columns

- **Liste Görünümü** - Alternatif tablo görünümü- 📝 **List View** - Alternative view for task management

- **Hızlı Mesajlaşma** - Görevler üzerinden anlık iletişim- 🎯 **Project Management** - Create and manage multiple projects

- **Öncelik Seviyeleri** - Düşük, Orta, Yüksek, Acil- ✅ **Task Management** - Create, edit, delete, and organize tasks

- **Durum Takibi** - Todo, In Progress, Review, Done- 🏷️ **Task Properties** - Priority levels, due dates, assignees, and tags

- 🎨 **Custom Colors** - Color-code your projects

### 🗂️ Proje Yönetimi- 💾 **Local Storage** - Data persists in browser

- Çoklu proje desteği

- Departman bazlı organizasyon### Modern UI/UX

- Renk kodlama sistemi- 🎨 Beautiful gradient design with purple theme

- Proje arşivleme- 📱 Fully responsive - works on desktop, tablet, and mobile

- ⚡ Smooth animations and transitions

### 📈 Excel Entegrasyonu- 🌟 Clean, professional interface

- **Otomatik Excel Yükleme** - Network klasöründeki dosyaları otomatik Firebase'e yükler- 🎯 Intuitive navigation and interactions

- **Stok Takibi** - Günlük stok listesi entegrasyonu

- **Sipariş Yönetimi** - Satış siparişleri entegrasyonu## 🚀 Getting Started

- **Gerçek Zamanlı Senkronizasyon** - Dosya değişikliklerini anında algılar

### Prerequisites

### 👥 Kullanıcı Yönetimi- Node.js (version 14 or higher)

- Firebase Authentication- npm or yarn

- Rol tabanlı yetkilendirme (Admin, User)

- Kullanıcı profil yönetimi### Installation

- Departman atamaları

1. Install dependencies:

### 📱 Modern Arayüz```bash

- Responsive tasarım (Mobil, Tablet, Desktop)npm install

- Gradient temalar```

- Smooth animasyonlar

- Sezgisel navigasyon### Development



## 🚀 KurulumRun the development server:

```bash

### Ön Gereksinimlernpm run dev

- Node.js 14+```

- npm veya yarn

- Firebase projesiThe application will be available at `http://localhost:5173`



### 1. Ana Proje Kurulumu### Build



```bashBuild for production:

# Bağımlılıkları yükle```bash

npm installnpm run build

```

# Geliştirme sunucusunu başlat

npm run dev### Preview Production Build



# Production build```bash

npm run buildnpm run preview

``````



### 2. Firebase Yapılandırması## 🎮 How to Use



1. Firebase Console'da yeni proje oluşturun1. **Login/Signup** - Enter any email and password (demo mode)

2. Authentication, Firestore, Storage servislerini aktif edin2. **Create a Project** - Click the + button in the sidebar

3. `src/config/firebase.js` dosyasını kendi bilgilerinizle güncelleyin3. **Select a Project** - Click on a project to open it

4. **Add Tasks** - Use the + button in any column (Board view)

### 3. File Watcher Kurulumu (Opsiyonel)5. **Drag & Drop** - Move tasks between columns

6. **Edit Tasks** - Click the menu button on any task card

Excel dosyalarını otomatik yüklemek için:7. **Switch Views** - Toggle between Board and List view



```bash## 📁 Project Structure

cd file-watcher

npm install```

```ecocell/

├── public/                  # Static assets

Detaylı kurulum için: [file-watcher/README.md](file-watcher/README.md)├── src/

│   ├── components/

## 📁 Proje Yapısı│   │   ├── layout/         # Sidebar, Header components

│   │   ├── projects/       # Project-related components

```│   │   ├── tasks/          # Task management components

ecocell/│   │   └── ui/             # Reusable UI components

├── src/│   ├── context/            # React Context for state management

│   ├── components/          # React bileşenleri│   ├── pages/              # Page components

│   │   ├── excel/          # Excel önizleme│   │   ├── Auth/           # Login/Signup pages

│   │   ├── layout/         # Sidebar, Header│   │   └── Dashboard/      # Main dashboard

│   │   ├── profile/        # Profil modalleri│   ├── App.jsx             # Main app with routing

│   │   ├── projects/       # Proje yönetimi│   ├── main.jsx            # Entry point

│   │   ├── tasks/          # Görev bileşenleri│   └── index.css           # Global styles

│   │   └── ui/             # Genel UI bileşenleri├── index.html

│   ├── context/            # React Context (State)├── vite.config.js

│   ├── pages/              # Sayfa bileşenleri└── package.json

│   │   ├── AdminPanel/     # Admin paneli```

│   │   ├── Auth/           # Login/Register

│   │   ├── Dashboard/      # Ana gösterge paneli## 🛠️ Tech Stack

│   │   ├── DailyStock/     # Günlük stok

│   │   ├── MainMenu/       # Ana menü- **React 18** - UI library

│   │   ├── Messages/       # Mesajlaşma- **Vite** - Build tool and dev server

│   │   └── SalesOrder/     # Satış siparişleri- **React Router** - Client-side routing

│   ├── services/           # Firebase servis katmanı- **Lucide React** - Modern icon library

│   └── config/             # Yapılandırma dosyaları- **Context API** - State management

├── file-watcher/           # Excel otomasyonu- **Local Storage** - Data persistence

│   ├── index.js            # Ana dosya izleyici

│   ├── start-hidden.vbs    # Gizli başlatma scripti## 🎨 Design Features

│   ├── install-task.ps1    # Windows Task Scheduler

│   └── README.md           # File watcher dökümantasyonu- Modern gradient backgrounds

├── api/                    # Vercel serverless functions- Card-based layouts

└── public/                 # Statik dosyalar- Smooth hover effects

```- Responsive grid system

- Custom scrollbars

## 🛠️ Teknoloji Stack- Modal overlays with backdrop blur

- Color-coded priorities and projects

### Frontend

- **React 18** - UI kütüphanesi## 📱 Responsive Design

- **Vite** - Build tool

- **React Router** - RoutingTaskFlow is fully responsive and works seamlessly on:

- **Lucide React** - İkonlar- 💻 Desktop (1920px and above)

- **XLSX** - Excel işlemleri- 💻 Laptop (1024px - 1919px)

- � Tablet (768px - 1023px)

### Backend & Services- 📱 Mobile (320px - 767px)

- **Firebase Authentication** - Kullanıcı yönetimi

- **Cloud Firestore** - Veritabanı## 🔒 Authentication

- **Firebase Storage** - Dosya depolama

- **Vercel** - Hosting & ServerlessCurrently uses a simple demo authentication system. Users can login with any credentials. In a production environment, this would be replaced with a real authentication system.



### Automation## 💡 Future Enhancements

- **Chokidar** - Dosya izleme

- **Firebase Admin SDK** - Server-side işlemler- Real backend integration

- **Windows Task Scheduler** - Otomatik başlatma- User authentication with JWT

- Real-time collaboration

## 📋 Kullanım- File attachments

- Comments and activity log

### Giriş Yapma- Calendar view

1. Uygulamayı açın: `http://localhost:5173`- Team management

2. Email ve şifre ile giriş yapın- Notifications

3. İlk kullanıcı otomatik admin olur- Search and filters

- Export functionality

### Görev Oluşturma

1. Proje seçin veya yeni proje oluşturun## 📄 License

2. Kanban board'da "+" butonuna tıklayın

3. Görev detaylarını doldurunThis project is open source and available under the MIT License.

4. Sürükle-bırak ile durumları değiştirin

## 🤝 Contributing

### Excel Yükleme

1. File watcher'ı başlatın (otomatik başlatma kuruluysa gerek yok)Contributions, issues, and feature requests are welcome!

2. Network klasöründeki Excel dosyalarını açın

3. Değişiklik yapın ve kaydedin## 👨‍💻 Developer

4. Otomatik olarak Firebase'e yüklenecek

Built with ❤️ using modern web technologies

### Admin İşlemleri
1. Admin hesabıyla giriş yapın
2. Ayarlar → Admin Panel
3. Kullanıcıları yönetin
4. Departmanları düzenleyin

## 🔒 Güvenlik

- `.env` dosyaları Git'e dahil edilmez
- `serviceAccountKey.json` asla paylaşılmaz
- Firebase güvenlik kuralları aktif
- CORS politikaları yapılandırılmış

## 📊 File Watcher

Network klasöründeki Excel dosyalarını otomatik olarak Firebase Storage'a yükler.

### Özellikler
- ✅ Dosya değişikliklerini gerçek zamanlı izler
- ✅ Otomatik Firebase'e yükler
- ✅ Windows başlangıcında otomatik çalışır
- ✅ Gizli modda (hiçbir pencere açılmaz)
- ✅ Log kaydı tutar

### Kurulum
Detaylı kurulum: [file-watcher/README.md](file-watcher/README.md)

```bash
cd file-watcher
npm install
```

## 🔄 Deployment

### Vercel Deployment

```bash
# Vercel CLI ile
npm i -g vercel
vercel

# Veya GitHub entegrasyonu ile otomatik deploy
```

### Firebase Deployment

```bash
npm install -g firebase-tools
firebase login
firebase deploy
```

## 📝 Lisans

Bu proje özel kullanım içindir.

## 👨‍💻 Geliştirici

Ecocell İş Yönetim Sistemi

---

## 🆘 Destek

Sorun yaşarsanız:
1. `logs/watcher.log` dosyasını kontrol edin
2. Firebase Console'da hataları inceleyin
3. Browser console'u kontrol edin

## 🔮 Gelecek Özellikler

- [ ] Gerçek zamanlı bildirimler
- [ ] Mobil uygulama
- [ ] Takvim görünümü
- [ ] Gantt chart
- [ ] PDF raporlama
- [ ] Email bildirimleri

---

**Not:** Projeyi ilk kez kullanıyorsanız, `EXCEL_SISTEM_OZET.md` ve `KULLANIM_KILAVUZU.md` dosyalarını okuyun.
