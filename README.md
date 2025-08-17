# AI-Powered Meeting Notes Summarizer

A full-stack web application that transforms meeting transcripts and notes into structured, actionable summaries using AI. Built with Next.js, Prisma, and Groq AI.

## 🚀 Features

- **Secure Authentication**: User registration and login with NextAuth.js
- **Transcript Management**: Upload text files or paste content directly
- **AI-Powered Summarization**: Generate structured summaries using Groq's Llama models
- **Custom Prompts**: Use predefined templates or create custom instructions
- **Editable Summaries**: Real-time editing with change tracking
- **Email Sharing**: Share summaries with multiple recipients
- **Dashboard Analytics**: Track usage statistics and summary history

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Modern UI component library
- **Lucide React** - Icon library

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma ORM** - Database toolkit and query builder
- **NextAuth.js** - Authentication solution
- **bcryptjs** - Password hashing

### Database
- **SQLite** (development) / **NeonDB** (production)
- **Prisma** for schema management and migrations

### AI & External Services
- **Groq AI** - Fast AI inference with Llama models
- **Vercel AI SDK** - AI integration toolkit
- **Nodemailer** - Email sending service

## 🏗️ Architecture & Design Decisions

### Database Design
The application uses a relational database with four main entities:

```prisma
User -> Transcript -> Summary -> EmailShare
```

- **Users**: Authentication and profile management
- **Transcripts**: Store uploaded content with metadata
- **Summaries**: AI-generated summaries with custom prompts
- **EmailShares**: Track sharing history and recipients

### Authentication Strategy
- **NextAuth.js** with credentials provider for email/password authentication
- **JWT tokens** for session management
- **Middleware protection** for authenticated routes
- **bcrypt hashing** for secure password storage

### AI Integration Approach
- **Groq AI** chosen for fast inference and cost-effectiveness
- **Llama 3.1 70B** model for high-quality summarization
- **Streaming responses** for better user experience
- **Custom prompt engineering** with predefined templates

### File Upload Strategy
- **Dual input methods**: File upload and direct text input
- **Client-side validation** for file types and sizes
- **Text extraction** from uploaded files
- **Preview functionality** before processing

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Database (SQLite for development, NeonDB for production)

### Environment Variables
Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://..." # NeonDB for production

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Groq AI
GROQ_API_KEY="your-groq-api-key"

# Email (Optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

### Installation Steps

1. **Clone and install dependencies**:
```bash
git clone https://github.com/varshasahu64043/AI-Summary-Tool.git
cd ai-summary-tool
npm install
```

2. **Set up the database**:
```bash
npx prisma generate
npx prisma migrate dev
```

3. **Run the development server**:
```bash
npm run dev
```

4. **Access the application**:
Open [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Schema

### Users Table
- `id`: Unique identifier
- `email`: User email (unique)
- `password`: Hashed password
- `name`: User display name
- `createdAt`: Account creation timestamp

### Transcripts Table
- `id`: Unique identifier
- `title`: Transcript title
- `content`: Full transcript text
- `userId`: Foreign key to Users
- `createdAt`: Upload timestamp

### Summaries Table
- `id`: Unique identifier
- `content`: Generated summary
- `prompt`: Custom instruction used
- `transcriptId`: Foreign key to Transcripts
- `userId`: Foreign key to Users
- `isEdited`: Edit status flag
- `createdAt`: Generation timestamp
- `updatedAt`: Last edit timestamp

### EmailShares Table
- `id`: Unique identifier
- `summaryId`: Foreign key to Summaries
- `recipients`: JSON array of email addresses
- `subject`: Email subject line
- `message`: Personal message
- `sentAt`: Send timestamp

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout

### Transcripts
- `GET /api/transcripts` - List user transcripts
- `POST /api/transcripts` - Create new transcript
- `GET /api/transcripts/[id]` - Get specific transcript
- `PUT /api/transcripts/[id]` - Update transcript
- `DELETE /api/transcripts/[id]` - Delete transcript

### Summaries
- `GET /api/summaries` - List user summaries
- `POST /api/summaries/generate` - Generate AI summary
- `GET /api/summaries/[id]` - Get specific summary
- `PUT /api/summaries/[id]` - Update summary
- `DELETE /api/summaries/[id]` - Delete summary
- `POST /api/summaries/[id]/share` - Share via email

### Dashboard
- `GET /api/dashboard/stats` - Get usage statistics

## 🎯 Usage Guide

### 1. Account Setup
- Register with email and password
- Login to access the dashboard

### 2. Upload Transcripts
- Use the "Upload" tab to add new content
- Choose between file upload or direct text input
- Supported formats: .txt files or plain text

### 3. Generate Summaries
- Select a transcript from the list
- Choose a predefined prompt or create custom instructions
- Click "Generate Summary" to process with AI

### 4. Edit Summaries
- Use the built-in editor to refine AI-generated content
- Changes are tracked and saved automatically
- Reset to original version if needed

### 5. Share Results
- Click the share button on any summary
- Add recipient email addresses
- Customize subject and personal message
- Send professional HTML-formatted emails

## 🚀 Deployment

### Vercel Deployment (Recommended)
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Database Migration for Production
```bash
# Switch to NeonDB
DATABASE_URL="postgresql://your-neon-connection-string"
npx prisma db push
```

## 🔒 Security Features

- **Password hashing** with bcrypt
- **JWT token** authentication
- **Route protection** middleware
- **Input validation** and sanitization
- **CORS protection** for API routes
- **Environment variable** security

## 🎨 UI/UX Design Principles

- **Mobile-first** responsive design
- **Clean typography** with system fonts
- **Consistent color palette** (3-5 colors max)
- **Intuitive navigation** with clear visual hierarchy
- **Loading states** and error handling
- **Accessibility** compliance (WCAG guidelines)

## 📈 Performance Optimizations

- **Server-side rendering** with Next.js
- **API route optimization** with proper HTTP methods
- **Database indexing** on frequently queried fields
- **Streaming AI responses** for better UX
- **Component lazy loading** where appropriate

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Check the GitHub Issues page
- Review the documentation
- Contact support at [varshasahu64043@gmail.com](mailto:varshasahu64043@gmail.com)

---
