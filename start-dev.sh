#!/bin/bash
export DATABASE_URL="postgresql://farmdirect_owner:npg_Chyqc9PiG3Da@ep-frosty-flower-a492lluk-pooler.us-east-1.aws.neon.tech/farmdirect?sslmode=require"
export SESSION_SECRET="farm-produce-marketplace-secret-key-2024"
export NODE_ENV="development"
export PORT=3000

echo "🚀 Starting FarmDirect development server on port 3000..."
echo "💾 Database: Connected to Neon"
echo "🔗 URL: http://localhost:3000"
echo ""

npm run dev 