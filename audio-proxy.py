import os
import subprocess
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent

class Handler(BaseHTTPRequestHandler):
    def do_HEAD(self):
        self.do_GET(head=True)

    def do_GET(self, head=False):
        if self.path in ('/', '/health'):
            self.send_response(200)
            self.send_header('Content-Type', 'text/plain; charset=utf-8')
            self.end_headers()
            self.wfile.write(b'OK')
            return

        rel = self.path.lstrip('/')
        if rel.startswith('audio/'):
            rel = rel[len('audio/'):]
        target = (ROOT / rel).resolve()

        try:
            target.relative_to(ROOT)
        except ValueError:
            self.send_error(403, 'Forbidden')
            return

        if not target.exists() or not target.is_file():
            self.send_error(404, 'Not Found')
            return

        if target.suffix.lower() == '.mp3':
            mime = 'audio/mpeg'
        elif target.suffix.lower() == '.wav':
            mime = 'audio/wav'
        else:
            mime = 'application/octet-stream'

        self.send_response(200)
        self.send_header('Content-Type', mime)
        self.send_header('Cache-Control', 'public, max-age=31536000')
        self.send_header('Content-Length', str(target.stat().st_size))
        self.end_headers()
        if head:
            return
        with target.open('rb') as fh:
            while True:
                chunk = fh.read(1024 * 64)
                if not chunk:
                    break
                self.wfile.write(chunk)

    def log_message(self, format, *args):
        return

if __name__ == '__main__':
    port = int(os.environ.get('PORT', '8001'))
    HTTPServer(('0.0.0.0', port), Handler).serve_forever()
