# DeepFocus - Pomodoro Timer

[![pt-br](https://img.shields.io/badge/lang-pt--br-green.svg)](./README.md)

<div align="center">
  <img src="public/favicon.ico" alt="DeepFocus Logo" width="120" height="120" />
  <p><em>Maximize your productivity and focus</em></p>
</div>

## 📋 About

DeepFocus is a modern Pomodoro timer application that helps you better focus on your tasks through timed work cycles and breaks. Developed with modern technologies like Next.js and Tailwind CSS, it offers a pleasant user experience with an elegant design and customizable features.

The Pomodoro Technique is a time management method that uses alternating periods of focused work and breaks to improve mental productivity and reduce fatigue.

## ✨ Features

- 🕰️ **Customizable Cycles**: Adjust focus, short break, and long break times according to your needs
- 🔄 **Automatic Transition**: Option to automatically switch between focus and break cycles
- 📱 **Focus Mode**: Minimalist interface for maximum concentration
- 🌓 **Modern Design**: Elegant dark interface with gradients and animated particles
- 🔔 **Notifications**: Configurable sound alerts at the end of each cycle
- 🌎 **Multilingual**: Full support for Portuguese and English
- ⌨️ **Keyboard Shortcuts**: Quick control through hotkeys
- 📊 **Cycle Tracking**: View your progress in work cycles
- 🔍 **Fullscreen Mode**: Eliminate distractions and focus only on the timer
- 💾 **Persistence**: Your settings are automatically saved

## ⚠️ Limitations and Future Plans

### Desktop vs Mobile Version

- **Desktop Version (Web)**: Full functionality including sound and system notifications even when the tab is in the background or the browser is minimized.

- **Mobile Version**: Due to limitations imposed by mobile browsers for battery saving and performance, it is currently **not possible to play sounds in the background** when the app is not in focus or the device is locked.

### Mobile Version Roadmap

We are working to address the mobile version limitations in future updates:

- Development of a dedicated native app for iOS and Android
- Implementation of push notifications to work around background audio restrictions
- Battery consumption optimizations while maintaining full functionality

### Compatibility

For the best experience with DeepFocus, we recommend:
- **Desktop/laptop devices**: Recent versions of Chrome, Firefox, Edge, or Safari
- **Mobile devices**: Use with the screen active, until future updates address background audio limitations

## 🛠️ Technologies

- **[React 18](https://reactjs.org/)**: JavaScript library for building interfaces
- **[Next.js 13.5](https://nextjs.org/)**: React framework for web applications
- **[Tailwind CSS](https://tailwindcss.com/)**: CSS framework for rapid and responsive design
- **[Framer Motion](https://www.framer.com/motion/)**: Library for fluid animations
- **[LocalStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)**: For user data persistence
- **[Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)**: For reliable background audio playback
- **[Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)**: For system notifications

## ⌨️ Keyboard Shortcuts

| Key      | Function                        |
|----------|----------------------------------|
| Space    | Start/Pause the timer           |
| R        | Reset the current cycle         |
| N        | Skip to the next cycle          |
| S        | Open/Close settings             |
| F        | Enter/Exit fullscreen mode      |
| M        | Activate/Deactivate focus mode  |
| H        | Open onboarding tutorial        |
| ESC      | Close open modals               |

## 🚀 Getting Started

These instructions will allow you to get a copy of the project running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (version 14.x or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/deep-focus.git
cd deep-focus

# Install dependencies
npm install
# or
yarn install

# Start the development server
npm run dev
# or
yarn dev
```

Access `http://localhost:3000` in your browser to see the application running.

### Building for production

```bash
# Generate the production build
npm run build
# or
yarn build

# Start the production server
npm start
# or
yarn start
```

## 🧪 Tests

```bash
# Run tests
npm run test
# or
yarn test
```

## 🧑‍💻 Author

**Raul Lize** - [Github](https://github.com/Raullize) - [Portfolio](https://raul-lize-portfolio.vercel.app)

## 🙏 Acknowledgements

- Thank you to everyone who uses this application to improve their productivity 