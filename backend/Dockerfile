# ===== BUILD STAGE =====
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos
COPY package*.json ./
COPY backend/ ./backend/
COPY tsconfig.json ./

# Instalar dependências
RUN npm install --production

# Build TypeScript
RUN npm install -D typescript
RUN npx tsc backend/server.ts --outDir dist --skipLibCheck

# ===== PRODUCTION STAGE =====
FROM node:20-alpine

WORKDIR /app

# Instalar dumb-init para signal handling
RUN apk add --no-cache dumb-init

# Copiar node_modules
COPY --from=builder /app/node_modules ./node_modules

# Copiar código compilado
COPY --from=builder /app/dist ./dist

# Copiar package.json
COPY package.json ./

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.API_PORT || 3000) + '/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Entrypoint
ENTRYPOINT ["dumb-init", "--"]

# Start
CMD ["node", "dist/backend/server.js"]

EXPOSE 3000
