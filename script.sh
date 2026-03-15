git pull && \
cd backend && rm -rf node_modules && npm install && \ 
cd ../frontend && rm -rf node_modules package-lock.json && npm install && \
( npm run build 2>&1 | tee build.log ); \
if ! [ ${PIPESTATUS[0]} -ne 0 ]; then
  echo "❌ Build failed. Full error log saved to build.log"
  exit 1
else
  echo "✅ Build completed successfully"
fi && \
cd .. && git add . && git commit -m "rebuild deps $(date '+%Y-%m-%d %H:%M')" && git push