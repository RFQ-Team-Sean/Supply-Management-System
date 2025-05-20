# AMS Quanbyy - Asset Management System

A modern asset management system built with Angular 18 and PrimeNG, featuring real-time notifications, comprehensive dashboards, and workflow management.

## Features

- **Real-time Notifications**
  - Status updates for requests
  - Approval notifications
  - System-wide announcements
  - User-specific alerts

- **Multi-Role Dashboards**
  - Admin Dashboard
  - BAC Dashboard
  - End User Dashboard
  - Supply Unit Dashboard
  - Inspection Dashboard
  - Accounting Dashboard
  - Supplier Dashboard

- **Core Functionalities**
  - Purchase Request Management
  - Request for Quotations (RFQ)
  - Inventory Management
  - Asset Tracking
  - Budget Allocation
  - Department Management
  - User Management

## Tech Stack

- **Frontend**: 
  - Angular 18
  - PrimeNG 18
  - Material UI
  - TailwindCSS
  - NgApexCharts

- **Backend**:
  - Express.js
  - Prisma ORM
  - WebSocket

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Angular CLI (v18)

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd ams_quanbyy
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Initialize database:
```bash
npm run push
```

5. Start the development server:
```bash
# For local development with mock data
npm run local

# For development with backend server
npm run express
```

## Available Scripts

- `npm start` - Starts Angular development server
- `npm run build` - Builds the production application
- `npm run local` - Runs app with local configuration
- `npm run express` - Runs both frontend and backend servers
- `npm run schema` - Generates Prisma schema and mappings
- `npm run push` - Updates database schema
- `npm run pull` - Pulls database schema changes

## Project Structure

```
ams_quanbyy/
├── src/
│   ├── app/
│   │   ├── components/      # Reusable components
│   │   ├── layouts/         # Layout components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── schema/         # Data models
│   ├── assets/            # Static assets
│   └── environments/      # Environment configurations
├── prisma/               # Database configuration
└── package.json
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- PrimeNG for their excellent UI components
- Angular team for the framework
- All contributors who participate in this project

## Support

For support, please create an issue in the repository or contact the development team.