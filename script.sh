git pull && \
cd frontend && rm -rf node_modules package-lock.json && npm install && \
cd ../backend && rm -rf node_modules && npm install && \
( npm run build 2>&1 | tee build.log ); test ${PIPESTATUS[0]} -eq 0 || { echo "❌ Build failed. Check build.log"; exit 1; } && \
cd .. && git add . && git commit -m "rebuild deps $(date '+%Y-%m-%d %H:%M')" && git push