# Pastebin Lite

A lightweight, production-ready pastebin application built with Node.js, Express, and MongoDB. Share text instantly with optional expiry via TTL (time-to-live) or view-count limits.

## Features

✨ **Core Functionality**
- Create pastes with arbitrary text content
- Generate shareable URLs for each paste
- View pastes with automatic HTML escaping for security
- Optional expiry via TTL (seconds) or view-count limits
- If both TTL and view limit are set, paste expires when either triggers

📊 **Expiry System**
- **TTL-based**: Pastes auto-delete after specified seconds
- **View-count based**: Pastes auto-delete after N successful views
- **Atomic updates**: Safe concurrent access with Mongoose findOneAndUpdate
- **Deterministic testing**: x-test-now-ms header support for reproducible tests

🔒 **Security**
- HTML content escaping to prevent XSS attacks
- Input validation on all endpoints
- MongoDB persistence (no in-memory storage)
- Proper error handling and status codes

🎯 **API Endpoints**
- `GET /api/healthz` - Health check with MongoDB connectivity
- `POST /api/pastes` - Create a new paste
- `GET /api/pastes/:id` - Fetch paste content (API view)
- `GET /p/:id` - View paste as HTML page
- `POST /create` - Create paste from web form
- `GET /` - Homepage with creation form

## Tech Stack

- **Runtime**: Node.js (v16+)
- **Framework**: Express.js 4.18+
- **Database**: MongoDB with Mongoose ODM
- **Templating**: EJS for server-side rendering
- **Language**: JavaScript (ES6+)

## Local Setup

### Prerequisites

- Node.js v16 or higher
- MongoDB (local or remote instance)

### Installation

1. **Clone or extract the project**
   ```bash
   cd pastebin-lite
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create .env file** in the project root
   ```
   MONGO_URI=mongodb://localhost:27017/pastebin-lite
   PORT=3000
   DOMAIN=http://localhost:3000
   ```

4. **Start MongoDB** (if running locally)
   ```bash
   # On Windows (assuming MongoDB is installed)
   mongod
   
   # Or use MongoDB Atlas cloud service
   ```

5. **Start the application**
   ```bash
   npm start
   ```

   The server will start at `http://localhost:3000`

## Usage

### Web Interface

1. Visit `http://localhost:3000`
2. Enter your paste content
3. Optionally set:
   - **TTL (seconds)**: Auto-delete after N seconds
   - **Max Views**: Auto-delete after N views
4. Click "Create Paste"
5. Share the generated URL with others

### API Usage

**Create a paste:**
```bash
curl -X POST http://localhost:3000/api/pastes \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello, World!",
    "ttl_seconds": 3600,
    "max_views": 5
  }'
```

Response:
```json
{
  "id": "abc123xyz",
  "url": "http://localhost:3000/p/abc123xyz"
}
```

**Fetch a paste:**
```bash
curl http://localhost:3000/api/pastes/abc123xyz
```

Response:
```json
{
  "content": "Hello, World!",
  "remaining_views": 4,
  "expires_at": "2026-01-27T12:00:00.000Z"
}
```

**Health check:**
```bash
curl http://localhost:3000/api/healthz
```

Response:
```json
{
  "ok": true
}
```

## Environment Variables

Create a `.env` file in the project root:

```
# MongoDB connection string
MONGO_URI=mongodb://localhost:27017/pastebin-lite

# Server port (default: 3000)
PORT=3000

# Domain for shareable URLs (important for production)
DOMAIN=http://localhost:3000

# Enable test mode for deterministic expiry testing
# TEST_MODE=1
```

### MONGO_URI Examples

**Local MongoDB:**
```
MONGO_URI=mongodb://localhost:27017/pastebin-lite
```

**MongoDB Atlas Cloud:**
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/pastebin-lite?retryWrites=true&w=majority
```

## Database Schema

**Collection: `pastes`**

```javascript
{
  _id: String,           // Short unique paste ID
  content: String,       // Paste content (required)
  created_at: Number,    // Creation timestamp (ms)
  expires_at: Number,    // TTL expiry timestamp (ms, null if no TTL)
  remaining_views: Number // Remaining views (null if unlimited)
}
```

### MongoDB Persistence Choice

We use MongoDB instead of in-memory storage because:

1. **Data Durability**: Pastes persist across application restarts
2. **Production Readiness**: MongoDB is widely used and reliable
3. **Scalability**: Can grow beyond single-instance limitations
4. **Concurrent Access**: Atomic operations (findOneAndUpdate) prevent race conditions
5. **Flexible Schema**: Easy to add fields without migrations
6. **Operational Tools**: Rich monitoring and backup ecosystem

## Project Structure

```
pastebin-lite/
├── server.js                 # Main application entry point
├── package.json              # Dependencies and scripts
├── .env                      # Environment variables (not in repo)
├── README.md                 # This file
│
├── models/
│   └── Paste.js             # Mongoose schema and model
│
├── routes/
│   ├── api.js               # API endpoints (/api/*)
│   └── pages.js             # HTML rendering routes (/*, /p/:id)
│
├── utils/
│   └── helpers.js           # Utility functions (ID generation, validation, etc.)
│
├── views/
│   ├── index.ejs            # Homepage with creation form
│   ├── paste.ejs            # Paste view page
│   └── error.ejs            # Error page
│
└── public/                  # Static files (CSS, JS, images)
```

## API Response Codes

| Endpoint | Method | Success | Not Found | Error |
|----------|--------|---------|-----------|-------|
| /api/healthz | GET | 200 | - | 503 |
| /api/pastes | POST | 201 | - | 400, 500 |
| /api/pastes/:id | GET | 200 | 404 | 500 |
| /p/:id | GET | 200 | 404 | 500 |

## Expiry Testing

When `TEST_MODE=1` and `x-test-now-ms` header is provided, the application treats it as the current timestamp for expiry logic:

```bash
# Create a paste with 10-second TTL
curl -X POST http://localhost:3000/api/pastes \
  -H "Content-Type: application/json" \
  -H "x-test-now-ms: 1000000" \
  -d '{"content": "test", "ttl_seconds": 10}'

# View it immediately (should work)
curl http://localhost:3000/api/pastes/abc123xyz \
  -H "x-test-now-ms: 1000000"

# View it after expiry (should fail)
curl http://localhost:3000/api/pastes/abc123xyz \
  -H "x-test-now-ms: 1011000"
```

## Development

**Start in development mode with logging:**
```bash
npm run dev
```

**Run in test mode:**
```bash
npm run test
```

## Error Handling

The application handles:

- **Validation errors** (400): Invalid request body
- **Not found errors** (404): Missing or expired pastes
- **Server errors** (500): Unexpected failures
- **Service unavailable** (503): MongoDB connection issues

All errors return JSON with descriptive messages.

## Security Considerations

1. ✓ **XSS Prevention**: HTML is escaped in template rendering
2. ✓ **Input Validation**: All inputs are validated before processing
3. ✓ **MongoDB Injection**: Using Mongoose ORM prevents injection attacks
4. ✓ **No Secrets in Code**: Sensitive data via environment variables
5. ✓ **Rate Limiting**: Can be added with express-rate-limit middleware
6. ⚠️ **HTTPS**: Use reverse proxy (nginx) or load balancer for TLS in production

## Performance Notes

- Paste IDs are 10 characters (base36 encoded)
- TTL and view count checks use atomic MongoDB operations
- Each API view atomically decrements remaining_views
- HTML content is pre-escaped during rendering

## Future Enhancements

- Rate limiting per IP
- Syntax highlighting support
- Paste download as file
- User authentication
- Paste editing within TTL
- Analytics dashboard
- Custom expiry messages

## License

MIT

**Author**: Dhana Ganesh Nalli
**Created**: January 2026
