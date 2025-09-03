# Release Parity Dashboard

A comprehensive Angular application for monitoring and comparing service deployments across multiple environments. This dashboard provides real-time health checks, commit tracking, and release parity analysis for microservices.

## 🚀 Features

### 📊 **Release Parity Dashboard**
- **Multi-environment monitoring**: Track services across Staging, Production, UAT, and QA environments
- **Commit comparison**: Compare commit hashes across environments to ensure release parity
- **Baseline comparison**: Set any environment as baseline and compare others against it
- **Real-time status**: Live health monitoring with color-coded status indicators

### 🔍 **Advanced Search & Filtering**
- **Comprehensive search**: Search across service names, commit hashes, branches, and tags
- **Real-time filtering**: Instant results as you type
- **Mismatch filtering**: Show only services that differ from baseline
- **Search results counter**: See how many services match your search

### 🔄 **Service Health Monitoring**
- **Individual service components**: Admin API, Alert Service, Bulk Upload, Data Visualization, Frontend
- **Detailed health information**: Memory usage, runtime details, version information
- **Error handling**: Graceful error display with specific error types
- **Loading states**: Visual feedback during data fetching

### 🎯 **Key Capabilities**
- **Manual refresh**: Force refresh all service data with loading indicators
- **Environment switching**: Easy navigation between different environments
- **Responsive design**: Works seamlessly on desktop and mobile devices
- **Professional UI**: Clean, modern interface with dark red theme

## 🏗️ Architecture

### **Component Structure**
```
src/app/
├── components/
│   ├── admin/              # Admin API health monitoring
│   ├── alerts/             # Alert Service health monitoring
│   ├── bulk-upload/        # Bulk Upload Service health monitoring
│   ├── commits/            # Main commits table and comparison
│   ├── dashboard/          # Detailed overview dashboard
│   ├── data-visualization/ # Data Visualization Service monitoring
│   └── frontend/           # Frontend service monitoring
├── shared/
│   ├── config/             # Environment and service configurations
│   ├── models/             # TypeScript interfaces and types
│   ├── services/           # Shared services (state management)
│   └── utils/              # Utility functions
└── navbar/                 # Navigation component
```

### **Technology Stack**
- **Angular 20.2.1**: Modern Angular with standalone components
- **TypeScript**: Strict typing and modern JavaScript features
- **RxJS**: Reactive programming with observables
- **Tailwind CSS**: Utility-first CSS framework
- **SCSS**: Enhanced CSS with variables and mixins
- **Angular Signals**: Reactive state management

## 🚀 Getting Started

### **Prerequisites**
- Node.js (v18 or higher)
- npm or yarn package manager
- Angular CLI (v20.2.1 or higher)

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd health-check
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   ng serve
   ```

4. **Open your browser**
   Navigate to `http://localhost:4200/`

### **Build for Production**
```bash
ng build --configuration production
```

## 📋 Configuration

### **Environment Configuration**
Edit `src/app/shared/config/environments.ts` to add or modify environments:

```typescript
export const ENVIRONMENTS: Environment[] = [
  { title: 'Staging', url: 'https://devadminapi.mgrant.in' },
  { title: 'Production', url: 'https://portaladminapi.mgrant.in' },
  { title: 'UAT', url: 'https://uatadminapi.mgrant.in' },
  { title: 'QA', url: 'https://qaadminapi.mgrant.in' },
];
```

### **Service Configuration**
Edit `src/app/shared/config/services.ts` to add or modify services:

```typescript
export const SERVICES: ServiceConfig[] = [
  {
    name: 'admin',
    displayName: 'Admin API',
    endpoint: '/healthcheck?detailed=true',
    versionPath: 'version'
  },
  // ... other services
];
```

## 🎯 Usage Guide

### **Main Dashboard**
1. **Navigate to "Commit Table"** to see the main comparison view
2. **Set baseline environment** using the dropdown (or select "None" for no comparison)
3. **Use search** to filter services by name, commit, or branch
4. **Click refresh** to get latest data from all services

### **Detailed Overview**
1. **Navigate to "Detailed Overview"** for individual service monitoring
2. **Select environment** to view specific environment details
3. **View detailed health information** for each service component

### **Search Functionality**
- **Service names**: Type "admin" to find Admin API
- **Commit hashes**: Type "51609c7" to find services with this commit
- **Branch names**: Type "main" to find services on main branch
- **Tags**: Type "v1.0" to find services with this tag

### **Baseline Comparison**
- **Set baseline**: Choose an environment as your reference point
- **View comparisons**: See which services match or differ from baseline
- **Color coding**: Green for matches, red for differences, gray for no data

## 🔧 API Endpoints

The application monitors the following service endpoints:

### **Health Check Endpoints**
- **Admin API**: `{env}/healthcheck?detailed=true`
- **Alert Service**: `{env}/alert-service/monitoring-service/healthcheck?detailed=true`
- **Bulk Upload**: `{env}/bulk-upload-service/monitoring-service/healthcheck?detailed=true`
- **Data Visualization**: `{env}/data-visualization-service/monitoring-service/healthcheck?detailed=true`

### **Frontend Service**
- **Git Info**: `{env}/assets/git-info.json`

Where `{env}` is the environment URL (e.g., `https://devadminapi.mgrant.in`)

## 🎨 UI Components

### **Commits Table**
- **Service column**: Shows service name and baseline information
- **Environment columns**: Display commit hashes with status indicators
- **Status indicators**: Color-coded dots showing health status
- **Comparison icons**: Visual indicators for baseline comparison

### **Status Indicators**
- 🟢 **Green**: Healthy service or matches baseline
- 🟡 **Yellow**: Degraded service
- 🔴 **Red**: Unhealthy service or differs from baseline
- 🔵 **Blue**: Loading state
- ⚪ **Gray**: Unknown status or no baseline data

### **Responsive Design**
- **Desktop**: Full table view with all columns
- **Tablet**: Optimized layout with adjusted spacing
- **Mobile**: Stacked layout with touch-friendly controls

## 🛠️ Development

### **Project Structure**
```
health-check/
├── src/
│   ├── app/
│   │   ├── components/     # Feature components
│   │   ├── shared/         # Shared utilities and configs
│   │   └── navbar/         # Navigation component
│   ├── index.html          # Main HTML file
│   ├── main.ts            # Application entry point
│   └── styles.scss        # Global styles
├── angular.json           # Angular configuration
├── package.json          # Dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

### **Key Features Implementation**

#### **State Management**
- **Angular Signals**: Reactive state management
- **Shared State Service**: Environment selection and data sharing
- **Computed Properties**: Derived state calculations

#### **HTTP Resource Management**
- **httpResource**: Angular's built-in resource management
- **Direct HTTP calls**: Manual refresh functionality
- **Error handling**: Comprehensive error management
- **Retry logic**: Automatic retry for failed requests

#### **Data Processing**
- **Type-safe models**: Strict TypeScript interfaces
- **Data transformation**: Service-specific data processing
- **Fresh data storage**: Cache management for refresh functionality

### **Adding New Services**

1. **Create service model** in `src/app/shared/models/`
2. **Add service configuration** in `src/app/shared/config/services.ts`
3. **Create service component** in `src/app/components/`
4. **Update commits component** to handle new service type
5. **Add service to dashboard** if needed

### **Adding New Environments**

1. **Add environment** to `src/app/shared/config/environments.ts`
2. **Update frontend URLs** in `src/app/shared/config/services.ts` if needed
3. **Test with all services** to ensure compatibility

## 🧪 Testing

### **Run Unit Tests**
```bash
ng test
```

### **Run End-to-End Tests**
```bash
ng e2e
```

### **Code Coverage**
```bash
ng test --code-coverage
```

## 📦 Deployment

### **Build for Production**
```bash
ng build --configuration production
```

### **Deploy to Static Hosting**
The built files in `dist/` can be deployed to any static hosting service:
- **Netlify**: Drag and drop the `dist/` folder
- **Vercel**: Connect your repository for automatic deployments
- **AWS S3**: Upload files to an S3 bucket with static website hosting
- **GitHub Pages**: Use GitHub Actions for automatic deployment

### **Environment Variables**
For production deployment, ensure your environment URLs are correctly configured in the environment configuration files.

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### **Development Guidelines**
- Follow Angular style guide
- Use TypeScript strict mode
- Write unit tests for new features
- Update documentation for API changes
- Ensure responsive design compatibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- **Issues**: Create an issue in the repository
- **Documentation**: Check the inline code documentation
- **Angular Docs**: Refer to [Angular Documentation](https://angular.dev)

## 🔄 Version History

- **v1.0.0**: Initial release with basic health monitoring
- **v1.1.0**: Added commit comparison and baseline functionality
- **v1.2.0**: Enhanced search functionality and UI improvements
- **v1.3.0**: Added frontend service monitoring and refresh functionality

---

**Built with ❤️ using Angular and modern web technologies**
