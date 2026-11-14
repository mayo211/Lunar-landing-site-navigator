# Online version: one container serves the website and the API on port 7860.
# Stage 1: build the website
FROM node:22-slim AS web
WORKDIR /web
COPY frontend/package.json ./
RUN npm install --no-audit --no-fund
COPY frontend/ ./
RUN npm run build

# Stage 2: Python backend + built website + NASA terrain maps
FROM python:3.13-slim
RUN useradd -m -u 1000 user
WORKDIR /app
COPY backend/requirements.txt backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt
COPY --chown=user backend/ backend/
COPY --chown=user --from=web /web/dist frontend/dist
# NASA LOLA south pole elevation maps (downloaded from NASA while building)
ARG WITH_DEM=1
RUN if [ "$WITH_DEM" = "1" ]; then \
      python -c "import urllib.request as u; \
[u.urlretrieve('https://pgda.gsfc.nasa.gov/data/LOLA_20mpp/'+f, 'backend/data/dem/'+f) for f in ('LDEM_80S_80MPP_ADJ.TIF','LDEM_60S_240MPP_ADJ.TIF')]" \
      && chown user backend/data/dem/*.TIF; fi
USER user
WORKDIR /app/backend
EXPOSE 7860
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
