# TaskFlow - Modern Project Management System

A modern, feature-rich project management application built with React and Vite. Similar to Jira, Trello, and ClickUp, TaskFlow provides an intuitive interface for managing projects and tasks.

## ✨ Features

### Core Features
- 📊 **Kanban Board** - Drag and drop tasks between columns
- 📝 **List View** - Alternative view for task management
- 🎯 **Project Management** - Create and manage multiple projects
- ✅ **Task Management** - Create, edit, delete, and organize tasks
- 🏷️ **Task Properties** - Priority levels, due dates, assignees, and tags
- 🎨 **Custom Colors** - Color-code your projects
- 💾 **Local Storage** - Data persists in browser

### Modern UI/UX
- 🎨 Beautiful gradient design with purple theme
- 📱 Fully responsive - works on desktop, tablet, and mobile
- ⚡ Smooth animations and transitions
- 🌟 Clean, professional interface
- 🎯 Intuitive navigation and interactions

## 🚀 Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

### Development

Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

Build for production:
```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 🎮 How to Use

1. **Login/Signup** - Enter any email and password (demo mode)
2. **Create a Project** - Click the + button in the sidebar
3. **Select a Project** - Click on a project to open it
4. **Add Tasks** - Use the + button in any column (Board view)
5. **Drag & Drop** - Move tasks between columns
6. **Edit Tasks** - Click the menu button on any task card
7. **Switch Views** - Toggle between Board and List view

## 📁 Project Structure

```
ecocell/
├── public/                  # Static assets
├── src/
│   ├── components/
│   │   ├── layout/         # Sidebar, Header components
│   │   ├── projects/       # Project-related components
│   │   ├── tasks/          # Task management components
│   │   └── ui/             # Reusable UI components
│   ├── context/            # React Context for state management
│   ├── pages/              # Page components
│   │   ├── Auth/           # Login/Signup pages
│   │   └── Dashboard/      # Main dashboard
│   ├── App.jsx             # Main app with routing
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── index.html
├── vite.config.js
└── package.json
```

## 🛠️ Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Lucide React** - Modern icon library
- **Context API** - State management
- **Local Storage** - Data persistence

## 🎨 Design Features

- Modern gradient backgrounds
- Card-based layouts
- Smooth hover effects
- Responsive grid system
- Custom scrollbars
- Modal overlays with backdrop blur
- Color-coded priorities and projects

## 📱 Responsive Design

TaskFlow is fully responsive and works seamlessly on:
- 💻 Desktop (1920px and above)
- 💻 Laptop (1024px - 1919px)
- � Tablet (768px - 1023px)
- 📱 Mobile (320px - 767px)

## 🔒 Authentication

Currently uses a simple demo authentication system. Users can login with any credentials. In a production environment, this would be replaced with a real authentication system.

## 💡 Future Enhancements

- Real backend integration
- User authentication with JWT
- Real-time collaboration
- File attachments
- Comments and activity log
- Calendar view
- Team management
- Notifications
- Search and filters
- Export functionality

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 👨‍💻 Developer

Built with ❤️ using modern web technologies
