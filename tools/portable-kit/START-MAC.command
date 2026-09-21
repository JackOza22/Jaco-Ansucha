#!/bin/bash
cd "$(dirname "$0")"
echo
echo "Starting Jaco & Anuscha portfolio..."
echo "Keep this window open while you show the site."
echo
echo "Do not double-click index.html."
echo

for port in 8000 8765 5500 9000 18000; do
  python3 -m http.server "$port" --bind 127.0.0.1 >/tmp/jaco-portfolio-server.log 2>&1 &
  pid=$!
  sleep 0.5
  if kill -0 "$pid" 2>/dev/null; then
    url="http://127.0.0.1:${port}/"
    echo "  $url"
    open "$url" 2>/dev/null || xdg-open "$url" 2>/dev/null
    wait "$pid"
    exit $?
  fi
done

echo "Could not start a local server. Close other copies of this site and try again."
read -r _
exit 1
