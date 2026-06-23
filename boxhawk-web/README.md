# Boxhawk Web Application - Project Handover Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [Environment Configuration](#environment-configuration)
6. [Supabase Integration](#supabase-integration)
7. [User Roles & Permissions](#user-roles--permissions)
8. [Core Features](#core-features)
9. [API Routes](#api-routes)
10. [Database Schema](#database-schema)
11. [Component Reference](#component-reference)
12. [Status Flow & Workflow](#status-flow--workflow)
13. [Image Management](#image-management)
14. [Mobile Support](#mobile-support)
15. [Error Handling Patterns](#error-handling-patterns)
16. [Database Setup & Migrations](#database-setup--migrations)
17. [Creating First Admin User](#creating-first-admin-user)
18. [Development Best Practices](#development-best-practices)
19. [Testing Checklist](#testing-checklist)
20. [Deployment](#deployment)
21. [Troubleshooting](#troubleshooting)
22. [Support & Maintenance](#support--maintenance)

---

## Project Overview

**Boxhawk** is a medical device inventory management web application built with Next.js and Supabase. The system enables healthcare facilities to manage medical device submissions through a photo-based workflow, with expert review capabilities.

### Key Workflows
1. **Photo User Workflow**: Users upload photos of medical devices, which are submitted for expert review
2. **Expert Review Workflow**: Experts review submissions, verify details, and mark items as complete or rejected
3. **Admin Management**: Administrators manage users, roles, and system settings

---

## Technology Stack

### Frontend
- **Next.js 15.5.4** - React framework with App Router
- **React 19.1.0** - UI library
- **Geist Font** - Typography

### Backend & Database
- **Supabase** - Backend-as-a-Service (PostgreSQL database, Authentication, Storage)
- **Node.js** - Server runtime

### Key Libraries
- `@supabase/supabase-js` (v2.74.0) - Supabase client
- `@supabase/auth-ui-react` (v0.4.7) - Authentication UI components
- `nodemailer` (v7.0.9) - Email sending for invitations

---

## Project Structure

```
boxhawk-web/
├── app/                          # Next.js App Router pages
│   ├── page.jsx                  # Home/Dashboard (role-based)
│   ├── layout.js                 # Root layout with navigation
│   ├── login/                    # Authentication page
│   ├── landing/                  # Landing page
│   ├── photo/
│   │   └── upload/               # Photo upload page (photouser)
│   ├── items/                    # Expert review pages
│   │   ├── page.jsx              # Review Queue
│   │   ├── [id]/                 # Item detail page
│   │   │   ├── page.jsx          # Review form
│   │   │   └── review/           # Double-check page
│   │   ├── pending/              # Pending items list
│   │   ├── completed/            # Completed items list
│   │   ├── rejected/             # Rejected items list
│   │   └── review/success/       # Success page after review
│   ├── success/                  # Photo upload success page
│   ├── admin/                    # Admin management pages
│   └── api/                      # API routes
│       ├── admin/                # Admin API endpoints
│       └── photo-submissions/    # Submission management APIs
├── components/                    # Reusable React components
│   ├── Logo.jsx                  # Logo component
│   ├── ItemCard.jsx              # Item card display
│   ├── StatusItemsPage.jsx       # Status-filtered items page
│   └── RoleGuard.jsx             # Role-based access control
├── lib/                          # Utility libraries
│   ├── supabaseClient.js         # Supabase client (client-side)
│   ├── itemsService.js           # Item fetching utilities
│   └── rbac.js                   # Role-based access control logic
├── constants/                    # Constants and configurations
│   └── symbolOptions.js          # Medical device symbols definitions
├── hooks/                        # Custom React hooks
│   └── useRole.js                # User role hook
├── public/                       # Static assets
│   └── images/                   # Image assets
│       ├── medishelf.png         # Logo
│       ├── general symbols/      # Medical device symbols
│       └── recycling symbols/    # Recycling codes
├── database/                      # Database migration scripts
├── scripts/                      # Utility scripts
└── package.json                  # Dependencies

```

---

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Supabase account and project
- Git (for version control)

### Installation Steps

1. **Clone the repository** (if applicable)
   ```bash
   git clone <repository-url>
   cd boxhawk-web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (see [Environment Configuration](#environment-configuration))

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

---

## Environment Configuration

Create a `.env.local` file in the root directory with the following variables:

```bash
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Email Configuration (Optional - for invitations)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@boxhawk.com
```

### How to Get Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep this secret!)

### Important Security Notes

- **Never commit** `.env.local` to version control
- The `SUPABASE_SERVICE_ROLE_KEY` should **only** be used in server-side API routes
- The service role key bypasses Row Level Security (RLS) - use with caution

---

## Supabase Integration

### Client-Side Supabase Client

**File**: `lib/supabaseClient.js`

This is the standard Supabase client used in client components. It uses the `anon` key and respects RLS policies.

```javascript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)
```

**Usage**: Import in client components for queries, authentication, and storage operations.

### Server-Side Admin Client

**Location**: API routes (e.g., `app/api/photo-submissions/reject/route.js`)

For server-side operations that require elevated permissions, create an admin client:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
```

**When to use**:
- Updating user roles
- Rejecting submissions (bypassing RLS)
- Admin operations that need to bypass security policies

### Authentication Flow

1. **User Login**: Uses Supabase Auth UI on `/login` page
2. **Session Management**: Handled automatically by Supabase client
3. **Role Storage**: User roles are stored in `app_metadata.role` in Supabase Auth
4. **Session Persistence**: Sessions are stored in browser cookies

### Database Queries

#### Common Query Patterns

**Fetching items with images**:
```javascript
// Using itemsService utility
import { fetchItemsWithImages } from '@/lib/itemsService'

const { items, count, error } = await fetchItemsWithImages({
  includeStatuses: ['in_review'],
  limit: 12,
  offset: 0,
  searchTerm: 'search query'
})
```

**Filtering by status**:
```javascript
const { data, error } = await supabase
  .from('photo_submissions')
  .select('*')
  .eq('status', 'in_review')
  .order('created_at', { ascending: false })
```

**Counting records**:
```javascript
const { count, error } = await supabase
  .from('photo_submissions')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'complete')
```

### Storage Operations

**Uploading images**:
```javascript
const { data, error } = await supabase.storage
  .from('mp-images')
  .upload(`submissions/${submissionId}/${fileName}`, file)
```

**Getting public URLs**:
```javascript
const { data } = supabase.storage
  .from('mp-images')
  .getPublicUrl(storagePath)
const publicUrl = data.publicUrl
```

---

## User Roles & Permissions

### Role Hierarchy

The system uses a role-based access control (RBAC) system with four roles:

1. **photouser** (Level 1) - Basic user
2. **expert** (Level 2) - Can review submissions
3. **admin** (Level 3) - Can manage users
4. **superadmin** (Level 4) - Full system access

### Role Definitions

#### Photouser
- **Default role** for new sign-ups
- Can upload photos and create submissions
- Access: `/photo/upload`, `/success`

#### Expert
- Can review photo submissions
- Can mark items as complete or rejected
- Access: `/items/*`, Dashboard with review statistics

#### Admin
- All Expert permissions
- Can manage users (create, update roles, delete)
- Can send invitations
- Access: `/admin/*`

#### Superadmin
- All Admin permissions
- Can create other superadmins
- Full system access

### Permission Implementation

**File**: `lib/rbac.js`

Key functions:
- `getCurrentUserRole()` - Get current user's role
- `hasPageAccess(pagePath, userRole)` - Check page access
- `hasMinimumRole(userRole, requiredRole)` - Check role hierarchy
- `canPerformAction(action, userRole)` - Check action permissions

**Usage in components**:
```javascript
import { useRole } from '@/hooks/useRole'

const { userRole, loading, isAuthenticated } = useRole()

if (userRole === 'expert' || userRole === 'admin') {
  // Show expert features
}
```

### Default Redirects

After login, users are redirected based on role:
- `photouser` → `/photo/upload`
- `expert`, `admin`, `superadmin` → `/items`

---

## Core Features

### 1. Photo Upload (Photouser)

**Page**: `/photo/upload`

**Features**:
- Upload 4-10 photos per submission
- Real-time image preview
- Image deletion before submission
- Form validation
- AI-assisted label extraction after image upload
- Tips for better photos

**Workflow**:
1. User selects 4-10 photos (validation enforced)
2. Photos are uploaded to Supabase Storage (`mp-images/submissions/{submission_id}/`)
3. Submission record created in `photo_submissions` table with `status = 'uploaded'`
4. Image records created in `photo_submission_images` table with `status = 'active'`
5. Audit logs created in `photo_submission_image_logs` table
6. Redirect to success page (`/success`)

**Image Upload Process**:
- Files are validated (image types only)
- UUID generated for each file name
- Upload progress tracked
- Images can be deleted before submission
- Mobile-friendly drag-and-drop support

**AI Image Analysis**:
- Uses `POST /api/photo-submissions/ai-image-analysis`
- Sends uploaded submission images to Gemini 3.1 Flash Lite Preview through OpenRouter
- Maps extracted values into `photo_submissions`, including manufacture date, expiration, manufacture address, and manufacture site

### 2. Expert Review Queue

**Page**: `/items`

**Features**:
- View pending, completed, and rejected items
- Search functionality
- Status badges
- Quick access to item details
- "View all" links for each status category

**Status Categories**:
- **Awaiting Review**: Items with `status = 'in_review'` or `status = 'uploaded'`
- **Completed**: Items with `status = 'complete'`
- **Rejected**: Items with `status = 'rejected'`

### 3. Item Review (Expert)

**Page**: `/items/[id]`

**Features**:
- View all uploaded photos (click to enlarge in modal)
- Fill in product details form:
  - Product Name* (required)
  - Manufacturer* (required)
  - Barcodes/GTIN
  - Dates (Manufacture, Expiration)
  - LOT/REF numbers
  - Size, Quantity
  - Manufacture Address, Site, Sponsor
  - Notes
- Mark as Complete or Reject
- Back to Review Queue button
- Image modal for full-size viewing

**Status Flow**:
- Items start with `status = 'uploaded'` or `status = 'in_review'`
- When expert opens review page, status can be updated to `in_review`
- On "Mark as Complete": `status = 'complete'`, `reviewed = true`
- On "Reject": `status = 'rejected'`, `reviewed = true` (via API route)

**Data Persistence**:
- Form data is saved to `photo_submissions` table
- `updated_at` timestamp is automatically updated

### 4. Review Confirmation

**Page**: `/items/[id]/review`

**Features**:
- Double-check all entered information
- Confirm or Cancel actions
- On confirm, updates submission status and redirects to success page

### 5. Success Pages

**After Review**: `/items/review/success`
- Shows success message
- Options: Back to Dashboard, Back to Queue, Continue Next Review

**After Upload**: `/success`
- Shows upload success
- Options: Back to Home, Continue Scanning

### 6. Dashboard (Expert)

**Page**: `/` (for expert role)

**Features**:
- Statistics cards:
  - Pending items count
  - Completed items count
  - Rejected items count
- "Up Next in Queue" section (next 2 pending items)
- "Recently Processed Items" section (last 10 completed/rejected items)

### 7. Admin User Management

**Page**: `/admin/users`

**Features**:
- List all users with pagination
- Search users by email
- Create new users
- Update user roles
- Send invitations
- Delete users (admin+ only)

---

## API Routes

### Admin APIs

#### `POST /api/admin/users/create`
Create a new user account.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "role": "expert"
}
```

**Response**:
```json
{
  "success": true,
  "user": { ... }
}
```

#### `POST /api/admin/update-role`
Update a user's role.

**Request Body**:
```json
{
  "userId": "user-uuid",
  "role": "admin"
}
```

#### `GET /api/admin/users`
List all users with pagination.

**Query Parameters**:
- `page` - Page number (default: 1)
- `perPage` - Items per page (default: 12)
- `search` - Search term (email)

#### `POST /api/admin/invitations`
Send invitation email to a user.

**Request Body**:
```json
{
  "email": "user@example.com",
  "role": "expert"
}
```

### Photo Submission APIs

#### `POST /api/photo-submissions/reject`
Reject a photo submission.

**Request Body**:
```json
{
  "submissionId": 123
}
```

**Note**: Uses admin client to bypass RLS.

#### `POST /api/photo-submissions/images/delete`
Delete an image from a submission.

**Request Body**:
```json
{
  "imageId": "image-uuid"
}
```

#### `POST /api/photo-submissions/[submissionId]/images/upload`
Upload images for a submission.

**Request Body**:
```json
{
  "files": [
    {
      "path": "submissions/123/image.jpg",
      "size": 1024000,
      "mime": "image/jpeg",
      "width": 1920,
      "height": 1080
    }
  ]
}
```

**Response**:
```json
{
  "images": [
    {
      "id": "uuid",
      "submission_id": 123,
      "storage_path": "submissions/123/image.jpg",
      ...
    }
  ]
}
```

**Note**: Creates image records and audit logs. Images must be uploaded to storage first.

#### `POST /api/photo-submissions/ai-image-analysis`
Run AI extraction for a photo submission and update extracted product fields.

**Request Body**:
```json
{
  "submission_id": 123,
  "model": "google/gemini-3.1-flash-lite-preview"
}
```

**Response**:
```json
{
  "id": 123,
  "result": {
    "name": "Product Name",
    "manufacturer": "Manufacturer Name",
    "barcode": "0123456789012",
    "size": "10 mL",
    "date_of_manufacture": "2025-01",
    "expiration": "2027-01",
    "lot": "LOT123",
    "ref": "REF123",
    "quantity": "10",
    "manufacture_address": "Manufacturer address",
    "manufacture_site": "Manufacturing site",
    "sponsor": "Sponsor or distributor",
    "notes": "Additional extracted notes"
  }
}
```

**Note**:
- Uses OpenRouter with Gemini 3.1 Flash Lite Preview by default.
- Reads images from `photo_submission_images` for the supplied submission.
- Updates `photo_submissions` with normalized extracted fields.
- Handles common AI response aliases such as `manufacturing_date`, `expiry_date`, `manufacturer_address`, and `manufacturer_site`.

#### `POST /api/photo-submissions/images/delete`
Delete images (soft or hard delete).

**Request Body**:
```json
{
  "imageIds": ["uuid1", "uuid2"],
  "hardDelete": false
}
```

**Response**:
```json
{
  "softDeleted": 2
}
// or
{
  "hardDeleted": 2
}
```

**Note**: 
- `hardDelete: false` - Sets status to 'deleted' (soft delete)
- `hardDelete: true` - Removes from storage and deletes database records

#### `POST /api/photo-submissions/reassign/existing`
Reassign images to an existing submission.

**Request Body**:
```json
{
  "targetSubmissionId": 456,
  "imageIds": ["uuid1", "uuid2"]
}
```

**Response**:
```json
{
  "movedCount": 2
}
```

#### `POST /api/photo-submissions/reassign/new`
Reassign images to a new submission (creates new submission).

**Request Body**:
```json
{
  "imageIds": ["uuid1", "uuid2"],
  "name": "New Product",
  "manufacturer": "Manufacturer Name"
}
```

---

## Database Schema

### Key Tables

#### `photo_submissions`
Main table for photo submissions.

**Key Columns**:
- `id` (integer, primary key)
- `name` (text) - Product name
- `manufacturer` (text) - Manufacturer name
- `status` (enum) - `uploaded`, `in_review`, `complete`, `rejected`
- `reviewed` (boolean) - Whether item has been reviewed
- `labels` (text) - Comma-separated general symbols
- `recycling_symbol` (text) - Comma-separated recycling symbols
- `created_at` (timestamp)
- `updated_at` (timestamp)
- ... (many other product detail fields)

**Status Enum Values**:
- `uploaded` - Newly uploaded, awaiting review
- `in_review` - Currently being reviewed
- `complete` - Review completed successfully
- `rejected` - Review rejected

#### `photo_submission_images`
Images associated with submissions.

**Key Columns**:
- `id` (uuid, primary key)
- `submission_id` (integer, foreign key) - References `photo_submissions.id`
- `storage_path` (text) - Path in Supabase Storage bucket
- `status` (text) - `active` or `deleted` (soft delete)
- `width` (integer) - Image width in pixels
- `height` (integer) - Image height in pixels
- `size_bytes` (bigint) - File size in bytes
- `mime_type` (text) - MIME type (e.g., "image/jpeg")
- `created_by` (uuid) - User who uploaded (references auth.users)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

**Indexes**: Should have index on `submission_id` and `status` for performance.

#### `photo_submission_image_logs`
Audit log for image operations.

**Key Columns**:
- `id` (uuid, primary key)
- `image_id` (uuid, foreign key) - References `photo_submission_images.id`
- `action` (text) - `upload`, `reassign`, `delete_soft`, `delete_hard`
- `from_submission_id` (uuid) - Source submission (for reassign)
- `to_submission_id` (uuid) - Target submission (for reassign/upload)
- `operator_id` (uuid) - User who performed action
- `reason` (text) - Optional reason for action
- `created_at` (timestamptz)

**Purpose**: Track all image operations for audit and debugging.

#### `users` (Supabase Auth)
Managed by Supabase Auth system.

**Key Metadata**:
- `app_metadata.role` - User role (photouser, expert, admin, superadmin)

### Storage Buckets

#### `mp-images`
Storage bucket for uploaded photos.

**Structure**:
```
mp-images/
  submissions/
    {submission_id}/
      {filename}
```

**Permissions**:
- Insert: All authenticated users (photouser, expert, admin, superadmin)
- Update: Owner only
- Read: Public (for displaying images)
- Delete: Admin operations only (via service role)

**RLS Policies**: See `sql/rls-policies.sql` for storage bucket policies.

### Database Views

#### `photo_submissions_with_images`
Helper view that aggregates active image paths into an array.

**Columns**: All columns from `photo_submissions` plus:
- `images` (text[]) - Array of storage paths for active images

**Usage**: Can be used for quick queries that need image paths without joins.

---

## Deployment

### Build for Production

```bash
npm run build
```

### Environment Variables in Production

Ensure all environment variables are set in your hosting platform:
- Vercel: Project Settings → Environment Variables
- Other platforms: Follow their environment variable configuration

### Supabase RLS Policies

Ensure Row Level Security (RLS) policies are properly configured in Supabase. The system uses a custom function `jwt_role()` to extract user role from JWT tokens.

**Key Policies**:

1. **Photo Submissions**:
   - `ps: insert own` - Photousers can only create their own submissions
   - `ps: select own` - Photousers can only see their own submissions
   - `ps: reviewers read all` - Experts/Admins can read all submissions
   - `ps: reviewers update all` - Experts/Admins can update all submissions

2. **Storage (mp-images bucket)**:
   - `mp-images: insert by role` - All authenticated users can upload
   - `mp-images: update own` - Users can only update their own uploads

**Implementation**: See `sql/rls-policies.sql` for complete policy definitions.

**Important**: The `jwt_role()` function reads from `auth.jwt() -> 'app_metadata' ->> 'role'`, so user roles must be set in `app_metadata.role` when creating/updating users.

---

## Troubleshooting

### Common Issues

#### 1. "Hydration failed" Error
**Cause**: Server-rendered HTML doesn't match client-rendered HTML.

**Solution**: 
- Check for `suppressHydrationWarning` on `<body>` tag in `layout.js`
- Ensure no client-only code runs during SSR
- Check for conditional rendering based on `window` or browser APIs

#### 2. Supabase Query Returns Empty Results
**Cause**: RLS policies blocking access or incorrect filters.

**Solution**:
- Check RLS policies in Supabase dashboard
- Verify user role and permissions
- Use admin client for operations that need to bypass RLS

#### 3. Images Not Loading
**Cause**: Storage bucket permissions or incorrect paths.

**Solution**:
- Verify `mp-images` bucket exists and is public
- Check storage paths in database
- Verify Supabase Storage policies

#### 4. Role Not Updating
**Cause**: `app_metadata` not properly updated.

**Solution**:
- Use admin API (`supabaseAdmin.auth.admin.updateUserById`)
- Ensure service role key is correctly configured
- Check user ID is correct

#### 5. Build Errors
**Cause**: Syntax errors, missing imports, or environment variables.

**Solution**:
- Run `npm run lint` to find syntax issues
- Check all imports are correct
- Verify all required environment variables are set

---

## Component Reference

### Reusable Components

#### `Logo` Component
**Location**: `components/Logo.jsx`

**Props**:
- `size` - `'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge' | 'nav'`
- `showText` - `boolean` (default: `true`)
- `href` - `string | null` (default: `'/'`)
- `style` - `object` (optional custom styles)

**Usage**:
```jsx
<Logo size="nav" href="/" showText={false} />
```

#### `ItemCard` Component
**Location**: `components/ItemCard.jsx`

**Props**:
- `item` - Item object with `id`, `name`, `manufacturer`, `status`, `images`, `created_at`, `updated_at`
- `variant` - `'pending' | 'completed' | 'rejected'` (affects badge styling)

**Usage**:
```jsx
<ItemCard item={item} variant="pending" />
```

#### `StatusItemsPage` Component
**Location**: `components/StatusItemsPage.jsx`

**Props**:
- `title` - Page title string
- `emoji` - Emoji icon string
- `variant` - Badge variant (`'pending' | 'completed' | 'rejected'`)
- `includeStatuses` - Array of statuses to include
- `excludeStatuses` - Array of statuses to exclude
- `backHref` - Back button link (default: `'/items'`)

**Features**:
- Pagination (12 items per page)
- Search functionality
- Loading and error states
- Empty state display

**Usage**:
```jsx
<StatusItemsPage
  title="Pending Items"
  emoji="⏳"
  variant="pending"
  includeStatuses={['in_review', 'uploaded']}
  backHref="/items"
/>
```

#### `RoleGuard` Component
**Location**: `components/RoleGuard.jsx`

**Purpose**: Protect routes/components based on user role.

**Variants**:
- `<ExpertGuard>` - Requires expert, admin, or superadmin
- `<AdminGuard>` - Requires admin or superadmin

**Usage**:
```jsx
<ExpertGuard>
  <YourComponent />
</ExpertGuard>
```

### Custom Hooks

#### `useRole` Hook
**Location**: `hooks/useRole.js`

**Returns**:
```javascript
{
  userRole: string | null,
  loading: boolean,
  isAuthenticated: boolean,
  hasAccess: (pagePath: string) => boolean,
  canPerform: (action: string) => boolean,
  isPhotoUser: boolean,
  isExpert: boolean,
  isAdmin: boolean,
  isSuperAdmin: boolean,
  isExpertOrAbove: boolean,
  isAdminOrAbove: boolean,
  refresh: () => void
}
```

**Usage**:
```jsx
const { userRole, loading, isExpert } = useRole()

if (loading) return <Loading />
if (isExpert) {
  // Show expert features
}
```

---

## Status Flow & Workflow

### Submission Status Lifecycle

```
uploaded → in_review → complete
                    ↘ rejected
```

1. **uploaded**: Initial state when photouser submits photos
2. **in_review**: Expert opens item for review (can be set automatically or manually)
3. **complete**: Expert marks item as complete after filling all details
4. **rejected**: Expert rejects item (via reject button or API)

### Complete Workflow Example

1. **Photouser Upload**:
   - User uploads 4-10 photos
   - Creates submission with `status = 'uploaded'`
   - Images stored in `mp-images` bucket
   - Image records created in `photo_submission_images`

2. **Expert Review**:
   - Expert sees item in Review Queue (`/items`)
   - Opens item detail page (`/items/[id]`)
   - Views photos and fills in product details
   - Selects symbols (General & Recycling)
   - Clicks "Mark as Complete" or "Reject"

3. **Review Confirmation**:
   - Redirects to double-check page (`/items/[id]/review`)
   - Shows all entered data and selected symbols
   - Expert confirms or cancels

4. **Completion**:
   - Status updated to `complete` or `rejected`
   - `reviewed = true`
   - `updated_at` timestamp updated
   - Redirects to success page

5. **Success Page**:
   - Shows success message
   - Option to continue with next item
   - Option to return to dashboard/queue

---

## Image Management

### Image Upload Flow

1. **Client-side** (`app/photo/upload/page.jsx`):
   - User selects files
   - Files validated (type, count)
   - Preview generated
   - On submit, files uploaded to Supabase Storage

2. **Storage Upload**:
   - Path: `submissions/{submission_id}/{uuid}.{ext}`
   - Files uploaded directly from client to storage

3. **Database Registration** (`/api/photo-submissions/[submissionId]/images/upload`):
   - Creates records in `photo_submission_images`
   - Creates audit logs in `photo_submission_image_logs`
   - Returns image records with IDs

### Image Deletion

**Soft Delete** (default):
- Sets `status = 'deleted'` in `photo_submission_images`
- Image remains in storage
- Creates audit log with `action = 'delete_soft'`

**Hard Delete**:
- Removes file from Supabase Storage
- Deletes record from `photo_submission_images`
- Creates audit log with `action = 'delete_hard'`

### Image Reassignment

**To Existing Submission**:
- Updates `submission_id` in `photo_submission_images`
- Creates audit log with `action = 'reassign'`

**To New Submission**:
- Creates new `photo_submissions` record
- Updates `submission_id` for selected images
- Creates audit logs

---

## Mobile Support

The application is designed to be mobile-responsive:

- **Photo Upload**: Drag-and-drop works on mobile devices
- **Image Selection**: Touch-friendly image cards
- **Forms**: Responsive form layouts
- **Navigation**: Mobile-optimized navigation bar
- **Image Viewing**: Full-screen modal for image viewing

**Mobile Detection**: Uses user agent detection in upload page for mobile-specific optimizations.

---

## Error Handling Patterns

### Client-Side Error Handling

**Pattern**: Try-catch blocks with user-friendly error messages

```javascript
try {
  const { data, error } = await supabase.from('table').select()
  if (error) throw error
  // Handle success
} catch (error) {
  console.error('Error:', error)
  setError('User-friendly message')
}
```

### API Route Error Handling

**Pattern**: Consistent JSON error responses

```javascript
try {
  // Operation
  return Response.json({ success: true, data })
} catch (error) {
  console.error('Error:', error)
  return Response.json({ error: error.message }, { status: 500 })
}
```

### Supabase Query Error Handling

**Common Issues**:
- Empty error objects `{}` - Check with `hasMeaningfulError` helper
- RLS policy violations - Use admin client for privileged operations
- Type mismatches - Convert IDs to correct types (string vs number)

---

## Next Steps for Handover

1. **Review Database Schema**: Ensure all tables and columns match production needs
2. **Test All User Flows**: 
   - Photouser upload → Expert review → Complete/Reject
   - Admin user management
3. **Verify Environment Variables**: All required variables are set
4. **Check Supabase Configuration**: RLS policies, storage buckets, auth settings
5. **Review API Routes**: Test all endpoints with proper authentication
6. **Document Custom Business Logic**: Any domain-specific rules or workflows

---

## Database Setup & Migrations

### Initial Database Setup

The project includes SQL scripts for setting up database tables:

1. **`database/create_photo_submission_images.sql`**:
   - Creates `photo_submission_images` table
   - Creates `photo_submission_image_logs` table
   - Creates `photo_submissions_with_images` view

2. **`database/create_invitations_table.sql`**:
   - Creates invitations table for user invitations (if used)

### Running Migrations

1. Open Supabase Dashboard → SQL Editor
2. Copy and paste the SQL from migration files
3. Execute the SQL
4. Verify tables are created in Table Editor

### RLS Policies Setup

1. Run `sql/rls-policies.sql` in Supabase SQL Editor
2. This creates:
   - `jwt_role()` helper function
   - Storage bucket policies for `mp-images`
   - Row Level Security policies for `photo_submissions`

**Important**: Enable RLS on tables:
- Go to Table Editor → Select table → Settings → Enable RLS

---

## Creating First Admin User

### Using Script

**File**: `scripts/create-admin-user.js`

1. Ensure `.env.local` has `SUPABASE_SERVICE_ROLE_KEY`
2. Update email and password in script
3. Run:
   ```bash
   node scripts/create-admin-user.js
   ```

### Manual Creation via Supabase Dashboard

1. Go to Authentication → Users
2. Click "Add User" → "Create new user"
3. Enter email and password
4. After creation, go to user details
5. Edit `app_metadata`:
   ```json
   {
     "role": "admin"
   }
   ```

### Using API Route

```bash
curl -X POST http://localhost:3000/api/admin/users/create \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePassword123!",
    "role": "admin"
  }'
```

---

## Creating Superadmin Users

**Note**: Superadmin creation functionality is **partially implemented** in the UI but requires an existing superadmin user to access.

### Current Implementation Status

- ✅ **UI Level**: The admin user management page (`/admin/users`) shows "Super Admin" option only when logged in as a superadmin
- ✅ **Permission Check**: The system defines that only superadmin can create other superadmins (see `lib/rbac.js`)
- ⚠️ **API Level**: API routes do not currently validate permissions (security consideration)

### Creating the First Superadmin

Since the UI only allows superadmin users to create other superadmins, you need to create the first superadmin manually:

#### Method 1: Via Supabase Dashboard (Recommended)

1. Go to Supabase Dashboard → Authentication → Users
2. Find the admin user you want to promote
3. Click on the user to open details
4. Scroll to `app_metadata` section
5. Edit the JSON:
   ```json
   {
     "role": "superadmin"
   }
   ```
6. Save changes

#### Method 2: Using Script (Modify create-admin-user.js)

1. Edit `scripts/create-admin-user.js`
2. Change the role assignment from `'admin'` to `'superadmin'`:
   ```javascript
   app_metadata: { role: 'superadmin' }
   ```
3. Run the script:
   ```bash
   node scripts/create-admin-user.js
   ```

#### Method 3: Direct Database Update (Advanced)

If you have direct database access, you can update the user's metadata directly.

### Creating Additional Superadmins

Once you have at least one superadmin user:

1. Log in as superadmin
2. Go to `/admin/users`
3. Click "Add User" or "Invite User"
4. You will now see "Super Admin" option in the role dropdown
5. Select "Super Admin" and create the user

**Important**: Only superadmin users can see and select the "Super Admin" role option in the UI.

---

## Development Best Practices

### Code Organization

1. **Client Components**: Use `'use client'` directive at top
2. **Server Components**: Default in Next.js App Router
3. **API Routes**: Always use admin client for privileged operations
4. **Error Handling**: Always handle Supabase errors gracefully

### State Management

- Use React `useState` for local component state
- Use `useEffect` for data fetching and side effects
- Use Supabase real-time subscriptions for live updates (if needed)

### Performance Optimization

1. **Image Loading**: 
   - Use Next.js `Image` component for optimized images
   - Lazy load images in lists
   - Use appropriate image sizes

2. **Database Queries**:
   - Use `select('id')` for count queries (more efficient)
   - Add indexes on frequently queried columns
   - Use pagination for large datasets

3. **Code Splitting**:
   - Next.js automatically code-splits by route
   - Use dynamic imports for heavy components

### Security Considerations

1. **Never expose service role key**:
   - Only use in server-side API routes
   - Never include in client-side code
   - Never commit to version control

2. **RLS Policies**:
   - Always enable RLS on sensitive tables
   - Test policies with different user roles
   - Use admin client only when necessary

3. **Input Validation**:
   - Validate all user inputs
   - Sanitize data before database operations
   - Use TypeScript or PropTypes for type checking (if added)

---

## Testing Checklist

Before deploying or handing over, test:

### Authentication
- [ ] User can sign up (photouser)
- [ ] User can log in
- [ ] User can log out
- [ ] Session persists across page refreshes
- [ ] Unauthorized users are redirected

### Photo Upload Flow
- [ ] Can upload 4-10 images
- [ ] Images display correctly
- [ ] Can delete images before submission
- [ ] Submission creates database records
- [ ] Success page displays correctly

### Expert Review Flow
- [ ] Can view pending items
- [ ] Can open item detail page
- [ ] Can fill in all form fields
- [ ] Symbol selection works
- [ ] Can mark as complete
- [ ] Can reject items
- [ ] Review confirmation page works
- [ ] Success page shows correct message

### Admin Functions
- [ ] Can view user list
- [ ] Can create users
- [ ] Can update user roles
- [ ] Can send invitations
- [ ] Can delete users (if implemented)

### Edge Cases
- [ ] Empty states display correctly
- [ ] Error messages are user-friendly
- [ ] Loading states work properly
- [ ] Mobile responsiveness
- [ ] Large datasets (pagination)

---

## Additional Resources

- **Supabase Documentation**: https://supabase.com/docs
- **Next.js Documentation**: https://nextjs.org/docs
- **Next.js App Router**: https://nextjs.org/docs/app
- **React Documentation**: https://react.dev
- **Email Setup Guide**: See `EMAIL_SETUP.md`
- **Logo Setup Guide**: See `LOGO_SETUP.md`
- **User Management Guide**: See `docs/user-management.md`

---

## Support & Maintenance

### Common Maintenance Tasks

1. **Database Backups**: Set up regular backups in Supabase dashboard
2. **Storage Cleanup**: Periodically remove soft-deleted images
3. **Log Review**: Check `photo_submission_image_logs` for audit trails
4. **Performance Monitoring**: Monitor Supabase dashboard for query performance

### Updating Dependencies

```bash
# Check for outdated packages
npm outdated

# Update packages
npm update

# Update to latest versions (careful!)
npm install package@latest
```

### Debugging Tips

1. **Check Browser Console**: Client-side errors appear here
2. **Check Server Logs**: API route errors in terminal
3. **Supabase Logs**: Check Supabase dashboard → Logs
4. **Network Tab**: Inspect API requests/responses
5. **React DevTools**: Inspect component state and props

---

*Last Updated: 24/11/2025*
*Project Version: 0.1.0*
*Next.js Version: 15.5.4*
*React Version: 19.1.0*
