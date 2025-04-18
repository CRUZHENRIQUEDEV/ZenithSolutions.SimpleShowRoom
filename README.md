# 3D/2D Architectural Visualization Tool

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.x-61DAFB.svg)
![Three.js](https://img.shields.io/badge/Three.js-Latest-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-4.x-3178C6.svg)

A powerful cross-platform visualization tool that bridges the gap between 2D drawing and 3D modeling for architectural and construction projects.

## 🚀 Features

- **Multi-view Interface**: Seamlessly switch between 2D drawing, 3D visualization, and project views
- **Interactive Grid System**: Customizable grid settings with adjustable count, spacing, and length
- **IFC Import Support**: Import and visualize Industry Foundation Classes (IFC) files for BIM integration
- **SVG Export**: Export your 2D drawings as scalable vector graphics
- **Responsive Design**: Fully responsive interface that adapts to different screen sizes

## 📸 Screenshots

*[Add screenshots of your application here]*

## 🛠️ Technology Stack

- **Frontend**: React with TypeScript
- **3D Rendering**: Three.js
- **BIM Integration**: Open Building Components (@thatopen/components)
- **UI Components**: Custom React components with TypeScript interfaces

## 🏗️ Architecture

The application is built with a component-based architecture featuring:

- `MainLayout`: The primary container managing the overall application layout
- `DrawingView`: Handles 2D drawing functionality
- `ThreeDScene`: Manages basic 3D visualization
- `Hybrid3DScene`: Advanced 3D scene with customizable grid layout and dimensions

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/arch-viz-tool.git

# Navigate to the project directory
cd arch-viz-tool

# Install dependencies
npm install

# Start the development server
npm start
```

## 🧩 How It Works

The application provides a unified environment for architectural visualization:

1. **2D Mode**: Create and edit floor plans with precision grid controls
2. **3D Mode**: Visualize your models in a 3D environment
3. **Project Mode**: Combine 2D drawings with 3D models using the Hybrid3DScene

Key features include:
- Customizable grid system with adjustable parameters
- Real-time dimension display between grid lines
- Grid labeling for clear reference points
- Interactive camera controls for 3D navigation

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

