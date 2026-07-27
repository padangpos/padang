# PaDaeng POS — Environment Variables Configuration

Create a local `.env.local` file based on the template below:

```env
# ==========================================
# Application Basics
# ==========================================
NEXT_PUBLIC_APP_NAME="PaDaeng POS"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# ==========================================
# Supabase Configuration
# ==========================================
NEXT_PUBLIC_SUPABASE_URL="https://your-supabase-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# ==========================================
# LINE OA & LIFF Configuration
# ==========================================
LINE_CHANNEL_ID="your-line-channel-id"
LINE_CHANNEL_SECRET="your-line-channel-secret"
LINE_CHANNEL_ACCESS_TOKEN="your-line-channel-access-token"
NEXT_PUBLIC_LIFF_ID="2010866348-GESmtoGd"

# ==========================================
# AI Provider Adapter Configuration
# (Supports Provider Switching: gemini | openai | anthropic)
# ==========================================
AI_PROVIDER="gemini"
GEMINI_API_KEY="your-gemini-api-key"
OPENAI_API_KEY="your-openai-api-key"

# ==========================================
# System Security & Encryption
# ==========================================
JWT_SECRET="your-jwt-secret-key-at-least-32-chars"
```
