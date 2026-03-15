git pull && \
cd backend && rm -rf node_modules && npm install && \ 
cd ../frontend && rm -rf node_modules package-lock.json && npm install && \
npm run build && \
cd .. && git add . && git commit -m "rebuild deps $(date '+%Y-%m-%d %H:%M')" && git push