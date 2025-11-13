# 🏢 Ecocell Portal# 🏢 Ecocell Portal# 🏢 Ecocell - İş Yönetim ve Takip Sistemi# TaskFlow - Modern Project Management System



Modern enterprise management platform built with React and Firebase. Real-time Excel synchronization, task management, and workflow automation for industrial operations.



## ✨ FeaturesModern enterprise management platform built with React and Firebase. Real-time Excel synchronization, task management, and workflow automation for industrial operations.



### 📊 Core Modules

- **Task Management** - Kanban board with drag-and-drop, list view, priority levels

- **Work Permits** - Digital approval workflow for maintenance operations## ✨ FeaturesModern, kullanıcı dostu iş takip ve proje yönetim sistemi. React + Vite ile geliştirilmiş, Firebase entegrasyonlu, Excel otomasyonu destekli kurumsal uygulama.A modern, feature-rich project management application built with React and Vite. Similar to Jira, Trello, and ClickUp, TaskFlow provides an intuitive interface for managing projects and tasks.

- **Maintenance Planning** - Daily/monthly maintenance schedules and downtime tracking

- **Announcements** - Company-wide communication system

- **Admin Panel** - User management, department organization, system configuration

### 📊 Task & Project Management

### 📈 Excel Integration

- **Auto-sync** - Monitors network Excel files and uploads to Firebase Storage- **Kanban Board** - Drag-and-drop task management with real-time updates

- **Real-time Updates** - Live data synchronization across all devices

- **Multiple Files** - Stock, sales orders, maintenance plans, downtime lists, electrical data- **Work Permits** - Digital approval workflow for maintenance operations## ✨ Özellikler## ✨ Features



### 👥 Access Control- **Maintenance Planning** - Schedule and track daily maintenance tasks

- **Firebase Authentication** - Secure login/registration

- **Role-based Permissions** - Admin and user roles- **Announcements** - Company-wide communication system

- **Department Organization** - Multi-department support with filtering



### 📱 Modern UI/UX

- **Responsive Design** - Desktop, tablet, mobile### 📈 Excel Integration & Automation### 📊 Görev Yönetimi### Core Features

- **Real-time Updates** - Live Firebase synchronization

- **Professional Interface** - Clean, minimalist design- **Auto-sync Excel Files** - Monitors network drives and syncs to Firebase Storage

- **Smooth Animations** - Polished user experience

- **Daily Stock Tracking** - Real-time inventory management- **Kanban Board** - Sürükle-bırak görev yönetimi- 📊 **Kanban Board** - Drag and drop tasks between columns

## 🚀 Quick Start

- **Sales Orders** - Order and shipment tracking

### Prerequisites

- Node.js 16+- **Downtime Planning** - Maintenance and operational downtime management- **Liste Görünümü** - Alternatif tablo görünümü- 📝 **List View** - Alternative view for task management

- Firebase project with Firestore and Storage

- Network access for Excel file monitoring (optional)- **Electric Consumption** - Energy usage monitoring



### Installation- **Hızlı Mesajlaşma** - Görevler üzerinden anlık iletişim- 🎯 **Project Management** - Create and manage multiple projects



```bash### 👥 User & Department Management

# Clone repository

git clone https://github.com/berkeparlat/ecocell.git- **Firebase Authentication** - Secure login system- **Öncelik Seviyeleri** - Düşük, Orta, Yüksek, Acil- ✅ **Task Management** - Create, edit, delete, and organize tasks

cd ecocell

- **Role-based Access** - Admin and user permissions

# Install dependencies

npm install- **Department Organization** - Multi-department support- **Durum Takibi** - Todo, In Progress, Review, Done- 🏷️ **Task Properties** - Priority levels, due dates, assignees, and tags



# Configure Firebase- **User Profiles** - Profile management with department assignments

# Create .env file with your Firebase credentials

cp .env.example .env- 🎨 **Custom Colors** - Color-code your projects



# Start development server### 📱 Modern UI/UX

npm run dev

```- **Responsive Design** - Works on desktop, tablet, and mobile### 🗂️ Proje Yönetimi- 💾 **Local Storage** - Data persists in browser



### Environment Variables- **Real-time Updates** - Live data synchronization via Firebase



Create `.env` file:- **Professional Interface** - Clean, minimalist design- Çoklu proje desteği



```env- **Smooth Animations** - Polished user experience

VITE_FIREBASE_API_KEY=your_api_key

VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain- Departman bazlı organizasyon### Modern UI/UX

VITE_FIREBASE_PROJECT_ID=your_project_id

VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket## 🚀 Quick Start

VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id

VITE_FIREBASE_APP_ID=your_app_id- Renk kodlama sistemi- 🎨 Beautiful gradient design with purple theme

```

### Prerequisites

## 📁 Project Structure

- Node.js 16+- Proje arşivleme- 📱 Fully responsive - works on desktop, tablet, and mobile

```

ecocell/- Firebase project

├── src/

│   ├── components/     # Reusable UI components- Network access for Excel file monitoring- ⚡ Smooth animations and transitions

│   ├── pages/          # Page components

│   ├── context/        # React Context (AppContext)

│   ├── services/       # Firebase service layer

│   ├── config/         # Firebase configuration### Installation### 📈 Excel Entegrasyonu- 🌟 Clean, professional interface

│   └── assets/         # Static assets

├── file-watcher/       # Excel file monitoring service

└── api/                # Serverless functions

``````bash- **Otomatik Excel Yükleme** - Network klasöründeki dosyaları otomatik Firebase'e yükler- 🎯 Intuitive navigation and interactions



## 🔧 Excel File Watcher# Install dependencies



Automated background service that monitors network Excel files and syncs to Firebase.npm install- **Stok Takibi** - Günlük stok listesi entegrasyonu



### Setup



```bash# Set up environment variables- **Sipariş Yönetimi** - Satış siparişleri entegrasyonu## 🚀 Getting Started

cd file-watcher

npm installcp .env.example .env



# Configure service account# Edit .env with your Firebase credentials- **Gerçek Zamanlı Senkronizasyon** - Dosya değişikliklerini anında algılar

# Add serviceAccountKey.json



# Start watcher (background mode)

start-background.vbs# Start development server### Prerequisites

```

npm run dev

See `file-watcher/README.md` for details.

```### 👥 Kullanıcı Yönetimi- Node.js (version 14 or higher)

## 🛠️ Tech Stack



- **Frontend** - React 18, Vite, React Router

- **Backend** - Firebase (Firestore, Storage, Auth)### Excel File Watcher Setup- Firebase Authentication- npm or yarn

- **UI Components** - Custom component library, Lucide icons

- **File Monitoring** - Chokidar, Node.js

- **Excel Processing** - Firebase Storage integration

- **Deployment** - Vercel```bash- Rol tabanlı yetkilendirme (Admin, User)



## 📝 Available Scriptscd file-watcher



```bashnpm install- Kullanıcı profil yönetimi### Installation

npm run dev          # Start development server

npm run build        # Build for production

npm run preview      # Preview production build

npm run lint         # Run ESLint# Configure network paths in .env- Departman atamaları

```

# Start monitoring (runs in background)

## 🔐 Default Admin Account

start-background.vbs1. Install dependencies:

After first deployment, create admin user via Firebase Console:

- Email: admin@company.com```

- Role: Set `isAdmin: true` in Firestore users collection

### 📱 Modern Arayüz```bash

## 📄 License

## 🔧 Configuration

Private - Karafiber Elyaf © 2025

- Responsive tasarım (Mobil, Tablet, Desktop)npm install

## 🤝 Contributing

Create `.env` file:

This is a private enterprise project. For internal contributions, contact the development team.

- Gradient temalar```

```env

VITE_FIREBASE_API_KEY=your_api_key- Smooth animasyonlar

VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain

VITE_FIREBASE_PROJECT_ID=your_project_id- Sezgisel navigasyon### Development

VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket

VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id

VITE_FIREBASE_APP_ID=your_app_id

```## 🚀 KurulumRun the development server:



## 📦 Build & Deploy```bash



```bash### Ön Gereksinimlernpm run dev

# Build for production

npm run build- Node.js 14+```



# Deploy to Vercel- npm veya yarn

vercel --prod

```- Firebase projesiThe application will be available at `http://localhost:5173`



## 🛠️ Tech Stack



- **Frontend:** React 18, Vite, React Router### 1. Ana Proje Kurulumu### Build

- **Backend:** Firebase (Auth, Firestore, Storage)

- **UI:** Lucide React Icons, Custom CSS

- **File Monitoring:** Chokidar (Node.js)

- **Excel Processing:** SheetJS```bashBuild for production:

- **Deployment:** Vercel

# Bağımlılıkları yükle```bash

## 📁 Project Structure

npm installnpm run build

```

ecocell/```

├── src/

│   ├── components/       # React components# Geliştirme sunucusunu başlat

│   ├── pages/           # Page components

│   ├── context/         # React Context (AppContext)npm run dev### Preview Production Build

│   ├── services/        # Firebase service layer

│   └── config/          # Firebase configuration

├── file-watcher/        # Excel file monitoring service

│   ├── index.js         # Main watcher script# Production build```bash

│   ├── start-background.vbs  # Background launcher

│   └── logs/            # Activity logsnpm run buildnpm run preview

└── public/              # Static assets

`````````



## 🔐 Security



- Firebase Security Rules configured### 2. Firebase Yapılandırması## 🎮 How to Use

- Role-based access control

- Secure authentication flow

- Environment variables for sensitive data

1. Firebase Console'da yeni proje oluşturun1. **Login/Signup** - Enter any email and password (demo mode)

## 📝 License

2. Authentication, Firestore, Storage servislerini aktif edin2. **Create a Project** - Click the + button in the sidebar

Private - © 2025 Karafiber Elyaf

3. `src/config/firebase.js` dosyasını kendi bilgilerinizle güncelleyin3. **Select a Project** - Click on a project to open it

## 👥 Support

4. **Add Tasks** - Use the + button in any column (Board view)

For issues or questions, contact the development team.

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
