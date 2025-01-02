# PPAI Desktop 🔥

A batteries-included Electron boilerplate with React, TypeScript, and more. Based on the [Electron React Boilerplate](https://github.com/electron-react-boilerplate/electron-react-boilerplate), this project includes a demo app showcasing basic functionality and inter-process communication between the main and renderer processes.

<div align="center">

[![Build Status][github-actions-status]][github-actions-url]
[![Github Tag][github-tag-image]][github-tag-url]

</div>

## ✨ Features

- 🚀 React for the UI
- 🖥️ Electron for cross-platform desktop app development
- 📘 TypeScript for type-safe code
- 🎨 TailwindCSS for styling
- 🔌 Inter-process communication (IPC) between main and renderer processes
- 🌍 Global context for state management
- 🖼️ Multi-window support (main window and child window)
- 🔔 App and System-wide Notifications
- 🔄 Auto Updater
- 💾 Built-in Store with electron-store
- 🖱️ Context Menu
- 🌙 Dark Mode
- ❌ Error Handler
- ⌨️ Keyboard Shortcut Manager
- 📝 Logging
- 🀱 Menu Bar for macOS, Windows, and Linux
- 📂 Multi-Window
- 🖥️ System Tray
- 🎨 UI components from [Shadcn](https://ui.shadcn.com/)

## 🚀 Getting Started

1. Clone this repository

   ```bash
   git clone https://github.com/passa-petro-ai/ppai-desktop.git
   ```

2. Go into the repository

   ```bash
   cd ppai-desktop
   ```

3. Install dependencies

   ```bash
   npm install
   ```

4. Start the development server

   ```bash
   npm run start
   ```

## 📁 Project Structure

- `src/main`: Contains the main process code
- `src/renderer`: Contains the renderer process code (React components)
- `src/config`: Contains configuration files
- `src/utils`: Contains utility functions

## 📜 Available Scripts

- `npm run start`: Start the app in development mode
- `npm run package`: Build the app for production
- `npm run lint`: Run the linter
- `npm run test`: Run tests

## Production

### Auto Update

After publishing your first version, you can enable auto-update by uncommenting the `update` function contents in `src/main/auto-update.ts`.

## Built With

- [Electron](https://electronjs.org/)
- [React](https://reactjs.org/)
- [React Router](https://reacttraining.com/react-router/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn](https://ui.shadcn.com/)
- [TypeScript](https://www.typescriptlang.org/)

## Development

### Tailwind CSS

We use Tailwind CSS for styling. See the [Tailwind CSS docs](https://tailwindcss.com/docs) for more information.

Some Tailwind plugins have been added for convenience:

- [Tailwind Animate](https://github.com/jamiebuilds/tailwindcss-animate) - `tailwindcss-animate`
- [Tailwind Container Queries](https://github.com/tailwindlabs/tailwindcss-container-queries) - `@tailwindcss/container-queries`
- Child selectors to target immediate children like `child:w-xl`
- Don't forget group selectors too: `group` (Parent) `group-hover:bg-gray-100` (Child)

### Shadcn

Shadcn is a UI component library for React. See the [Shadcn docs](https://ui.shadcn.com/) for more information.
Use `npx shadcn@latest add button ...` to add a component to your project.

_Current installation command (to update all ui components):_

```sh
npx shadcn@latest add button checkbox dropdown-menu form input menubar radio-group scroll-area select separator sonner switch textarea
```

_To list components with updates: `npx shadcn@latest diff`_

Based on the [Electron React Boilerplate](https://github.com/electron-react-boilerplate/electron-react-boilerplate), this boilerplate adds UI components from [Shadcn](https://ui.shadcn.com/), styling with [Tailwind CSS](https://tailwindcss.com/), persistance with [electron-store](https://github.com/sindresorhus/electron-store), and a structured [React](https://react.dev/) context that promotes a data flow from the top down: Main process -> Renderer process.

<br>

<div align="center">

[![Build Status][github-actions-status]][github-actions-url]
[![Github Tag][github-tag-image]][github-tag-url]

</div>

## Features

- 💬 App and System-wide Notifications
- 🏃‍♂️ Auto Updater
- 📦 Built-in Store
- 🖱️ Context Menu
- 🌙 Dark Mode
- ❌ Error Handler
- ⌨️ Keyboard Shortcut Manager
- 📝 Logging
- 🀱 Menu Bar for macOS, Windows, and Linux
- 📂 Multi-Window
- 🖥️ System Tray

## Getting Started

```bash

# Clone this repository
git clone https://github.com/passa-petro-ai/ppai-desktop.git

# Go into the repository
cd ppai-desktop

# Install dependencies
yarn

# Run the app
yarn start
```

## Production

### Auto Update

After publishing your first version, you can enable auto-update by uncommenting the `update` function contents in `src/main/auto-update.ts`.

## BuiltWith

- [Electron](https://electronjs.org/)
- [React](https://reactjs.org/)
- [React Router](https://reacttraining.com/react-router/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn](https://ui.shadcn.com/)
- [TypeScript](https://www.typescriptlang.org/)

## Development

### Tailwind CSS

We use Tailwind CSS for styling. See the [Tailwind CSS docs](https://tailwindcss.com/docs) for more information.

Some Tailwind plugins have been added for convenience:

- [Tailwind Animate](https://github.com/jamiebuilds/tailwindcss-animate) - `tailwindcss-animate`
- [Tailwind Container Queries](https://github.com/tailwindlabs/tailwindcss-container-queries) - `@tailwindcss/container-queries`
- Child selectors to target immediate children like `child:w-xl`
- Don't forget group selectors too: `group` (Parent) `group-hover:bg-gray-100` (Child)

### Shadcn

Shadcn is a UI component library for React. See the [Shadcn docs](https://ui.shadcn.com/) for more information.
Use `npx shadcn-ui@latest add accordion ...` to add a component to your project.

_Current installation command (to update all ui components):_

```sh
npx shadcn-ui@latest add button checkbox dropdown-menu form input menubar radio-group scroll-area select separator sonner switch textarea
```

_To list components with updates: `npx shadcn-ui@latest diff`_

### Build for production

```sh
npm run package
```

#### Important Notes

- The `src/main/auto-update.ts` file is where the auto-updater is configured. Uncomment the `update` function to enable auto-update after publishing your first version.
- The app icon will **ALWAYS** be the default Electron icon in development. You will need to build the app with `npm run package` to get a new icon.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Electron-React-Boilerplate

See the Electron React Boilerplate [docs and guides here](https://electron-react-boilerplate.js.org/docs/installation)

#### Tutorials

- Creating multiple windows: <https://github.com/electron-react-boilerplate/electron-react-boilerplate/issues/623#issuecomment-1382717291>

## 📄 License

This project is licensed under the CC-BY-NC-SA-4.0 License.

[github-actions-status]: https://github.com/passa-petro-ai/electron-shadcn-boilerplate/workflows/Build/badge.svg
[github-actions-url]: https://github.com/passa-petro-ai/electron-shadcn-boilerplate/actions
[github-tag-image]: https://img.shields.io/github/tag/electron-react-boilerplate/electron-react-boilerplate.svg?label=version
[github-tag-url]: https://github.com/passa-petro-ai/electron-shadcn-boilerplate/releases/latest
