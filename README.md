# 🎫 TicketSystem

A modern, full-featured help desk and ticket management system built with Next.js 14, TypeScript, and Tailwind CSS.

![TicketSystem Dashboard](./screenshot.png)

## ✨ Features

### Ticket Management
- 📝 Create, view, update, and resolve tickets
- 🏷️ Tagging and categorization system
- 📊 Priority levels (Low, Medium, High, Urgent)
- 📌 Multiple ticket statuses (Open, Pending, On Hold, Solved, Closed)
- 💬 Public replies and internal notes
- 📎 File attachments support

### Team Collaboration
- 👥 Team management and agent assignments
- 🔔 Real-time notifications
- 📧 Email integration
- 👀 Ticket watchers
- 📝 Internal notes for team communication

### Customer Management
- 🧑‍💼 Customer profiles and history
- 🏢 Organization/company grouping
- 📈 Customer satisfaction tracking
- 📊 Interaction history

### Analytics & Reporting
- 📊 Dashboard with key metrics
- 📈 Ticket volume trends
- ⏱️ Response time analytics
- 😊 Customer satisfaction scores
- 📉 Team performance metrics

### Knowledge Base
- 📚 Article management
- 📁 Category organization
- 🔍 Full-text search
- 📈 Article analytics

### Additional Features
- 🔐 Role-based access control (Customer, Agent, Supervisor, Admin, Owner)
- ⚡ SLA management and tracking
- 🤖 Automation rules
- 🌐 Multi-channel support (Email, Web, Chat, Phone, API)
- 🎨 Beautiful, modern UI with dark theme
- 📱 Fully responsive design

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/clearq.git
   cd clearq
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database credentials and other settings.

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Seed the database (optional)**
   ```bash
   npx prisma db seed
   ```

6. **Run the development server**
```bash
npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma](https://www.prisma.io/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Charts**: [Recharts](https://recharts.org/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (app)/             # Authenticated app routes
│   │   ├── dashboard/     # Dashboard page
│   │   ├── tickets/       # Ticket management
│   │   ├── customers/     # Customer management
│   │   ├── conversations/ # Live chat/conversations
│   │   ├── knowledge/     # Knowledge base
│   │   ├── reports/       # Analytics & reports
│   │   ├── teams/         # Team management
│   │   └── settings/      # Settings pages
│   └── (auth)/            # Authentication pages
├── components/            # React components
│   ├── branding/         # Logo and brand assets
│   ├── dashboard/        # Dashboard components
│   ├── layout/           # Layout components
│   ├── tickets/          # Ticket components
│   └── ui/               # Reusable UI components
├── lib/                  # Utility functions and configs
├── store/                # Zustand store
├── types/                # TypeScript type definitions
└── prisma/               # Database schema
```

## 🎨 Design System

TicketSystem uses a carefully crafted design system featuring:

- **Color Palette**: Teal/Cyan accent colors on a dark zinc background
- **Typography**: Outfit font family for modern, clean text
- **Components**: Consistent, accessible UI components
- **Animations**: Subtle, purposeful motion design

## 📝 API Routes

The app includes API routes for:

- `/api/tickets` - Ticket CRUD operations
- `/api/users` - User management
- `/api/teams` - Team management
- `/api/comments` - Ticket comments
- `/api/notifications` - Notification management
- `/api/analytics` - Dashboard analytics

## 🔐 Authentication

TicketSystem supports multiple authentication methods:

- Email/Password
- OAuth (Google, GitHub)
- Magic links

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a pull request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by Zendesk, Freshdesk, and other help desk solutions
- Built with amazing open-source technologies

---

**Made with ❤️ by Your Team**
