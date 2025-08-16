# 🚀 shadcnui

<div align="center">

![Logo](/public/logo.png)

[![GitHub stars](https://img.shields.io/github/stars/rironib/shadcnui?style=for-the-badge)](https://github.com/rironib/shadcnui/stargazers)

[![GitHub forks](https://img.shields.io/github/forks/rironib/shadcnui?style=for-the-badge)](https://github.com/rironib/shadcnui/network)

[![GitHub issues](https://img.shields.io/github/issues/rironib/shadcnui?style=for-the-badge)](https://github.com/rironib/shadcnui/issues)

[![GitHub license](https://img.shields.io/github/license/rironib/shadcnui?style=for-the-badge)](LICENSE)

**A Next.js application showcasing components from shadcn.**

[Live Demo](https://slshadcnui.vercel.app/)
[Documentation](https://slshadcnui.vercel.app/)

</div>

## 📖 Overview

This project serves as a demonstration of UI components from the shadcn library, built using Next.js. It's intended for
developers who want to quickly see how these components work within a real-world application context and learn about
their usage and integration. The project is designed to be easily navigable and understandable, making it a valuable
resource for anyone working with shadcn components in their Next.js projects.

## ✨ Features

- **Implementation of multiple shadcn components:**  The app utilizes several components from the shadcn library,
  showcasing their functionality and styling. Specific components are listed in `components.json`.
- **Next.js framework:** Built with Next.js for optimized performance and server-side rendering capabilities.
- **Clean and organized structure:** The codebase is structured for maintainability and ease of understanding.
- **Configuration options:**  Environment variables are used to manage configuration settings (see below).

## 🖥️ Screenshots

![Screenshot 1](/public/screenshots/login.jpg)

![Screenshot 2](/public/screenshots/register.jpg)

## 🛠️ Tech Stack

**Frontend:**

[![Next.js](https://img.shields.io/badge/Next.js-black?logo=next.js&logoColor=white)](https://nextjs.org/)

[![React](https://img.shields.io/badge/React-blue?logo=react&logoColor=white)](https://reactjs.org/)

[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**DevOps:**

[![pnpm](https://img.shields.io/badge/pnpm-purple?logo=pnpm&logoColor=white)](https://pnpm.io/)

## 🚀 Quick Start

### Prerequisites

- Node.js (version specified in `package.json`)
- pnpm

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/rironib/shadcnui.git
   cd shadcnui
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Environment setup:**
   ```bash
   cp .env.example .env
   # Configure your environment variables (see Configuration section)
   ```

4. **Start development server:**
   ```bash
   pnpm run dev
   ```

5. **Open your browser:**
   Visit `http://localhost:3000`

## 📁 Project Structure

```
shadcnui/
├── app/                 # Next.js app directory
│   └── ...              # Pages and components
├── components/          # Custom components (if any)
├── config/              # Configuration files (if any)
├── hooks/               # Custom React hooks (if any)
├── middleware.js       # Next.js middleware
├── next.config.mjs      # Next.js configuration
├── package.json         # Project dependencies
├── pnpm-lock.yaml      # pnpm lockfile
├── postcss.config.mjs   # PostCSS configuration
├── public/              # Static assets
├── jsconfig.json        # TypeScript configuration
├── components.json      # List of implemented shadcn components
└── ...                  # Other files
```

## ⚙️ Configuration

### Environment Variables

The `.env.example` file provides examples of environment variables that can be customized. These are not strictly
required for the application to function but may be used to alter behavior. Copy `.env.example` to `.env` and adjust
values as needed.

## 🔧 Development

### Available Scripts

| Command | Description |

|---------------|-----------------------------|

| `pnpm run dev` | Starts the development server |

| `pnpm run build`| Creates a production build |

| `pnpm run lint` | Runs ESLint |

## 🧪 Testing

<!-- TODO: Add testing information if applicable -->

## 🚀 Deployment

<!-- TODO: Add deployment information -->

## 🤝 Contributing

<!-- TODO: Add contributing guidelines -->

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ by [RONiB]

</div>