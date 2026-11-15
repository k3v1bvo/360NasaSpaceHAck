# FireLock // NASA Microgravity Combustion Safety Console
# Multi-stage Zero-Reinstall Docker Image

FROM node:20-alpine AS runner
WORKDIR /app

# Install lightweight static server
RUN npm install -g serve

# Copy pre-built production assets directly
COPY frontend/dist ./dist

EXPOSE 3000

# Start instant production server (zero-reinstall, zero-build)
CMD ["serve", "-s", "dist", "-l", "3000"]
