#!/usr/bin/env sh

# Função para repassar o sinal ao Java
term_handler() {
  echo "Recebido SIGTERM, repassando para PID $SPRING_PID"
  kill -TERM "$SPRING_PID" 2>/dev/null
  wait "$SPRING_PID"
  exit 0
}

# Captura SIGTERM e SIGINT
trap 'term_handler' SIGTERM SIGINT

# 1) inicia Spring em background
java -jar /app/app.jar --server.port=5000 &
SPRING_PID=$!

# 2) gera nginx.conf substituindo variáveis do template e o coloca como o arquivo principal
envsubst '${PORT} ${API_PORT}' \
  < /etc/nginx/templates/default.conf.template \
  > /etc/nginx/nginx.conf # Sobrescreve o nginx.conf principal

# 3) Nginx em foreground (vira PID 1)
# O -c /etc/nginx/nginx.conf é implícito, mas pode ser explicitado se necessário
exec nginx -g "daemon off;" # -c /etc/nginx/nginx.conf