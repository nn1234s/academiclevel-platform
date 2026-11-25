import http from 'node:http';
import { Socket } from 'node:net';

/**
 * Invokes an Express 5 `app` in-process using genuine Node `IncomingMessage` & `ServerResponse`
 * objects with a dummy socket — zero TCP port binding or network syscalls required.
 */
export function invokeApp(app, { method = 'GET', url = '/', headers = {}, body = undefined } = {}) {
  return new Promise((resolve, reject) => {
    const dummySocket = new Socket();
    Object.defineProperty(dummySocket, 'remoteAddress', { value: '127.0.0.1', configurable: true });
    dummySocket.writable = true;
    dummySocket.readable = true;
    dummySocket.write = () => true;
    dummySocket.destroy = () => dummySocket;

    const req = new http.IncomingMessage(dummySocket);
    req.method = method.toUpperCase();
    req.url = url;
    req.originalUrl = url;
    req.headers = {};
    for (const [k, v] of Object.entries(headers)) {
      if (v !== undefined && v !== null) req.headers[k.toLowerCase()] = String(v);
    }
    const bodyBuf = body === undefined
      ? null
      : Buffer.isBuffer(body)
        ? body
        : Buffer.from(typeof body === 'string' ? body : JSON.stringify(body), 'utf8');
    if (bodyBuf) {
      if (!req.headers['content-type']) req.headers['content-type'] = 'application/json';
      req.headers['content-length'] = String(bodyBuf.length);
    }

    const res = new http.ServerResponse(req);
    res.assignSocket(dummySocket);

    const chunks = [];
    let settled = false;

    const origWrite = res.write.bind(res);
    res.write = (chunk, encoding, cb) => {
      if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, typeof encoding === 'string' ? encoding : 'utf8'));
      return true;
    };
    const origEnd = res.end.bind(res);
    res.end = (chunk, encoding, cb) => {
      if (chunk && typeof chunk !== 'function') {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, typeof encoding === 'string' ? encoding : 'utf8'));
      }
      if (!settled) {
        settled = true;
        const raw = Buffer.concat(chunks).toString('utf8');
        let jsonData = null;
        try { jsonData = JSON.parse(raw); } catch {}
        resolve({
          status: res.statusCode,
          headers: res.getHeaders(),
          text: raw,
          json: async () => jsonData ?? JSON.parse(raw)
        });
      }
      if (typeof chunk === 'function') chunk();
      else if (typeof encoding === 'function') encoding();
      else if (typeof cb === 'function') cb();
      return res;
    };

    try {
      app(req, res, (err) => {
        if (err) {
          if (!settled) { settled = true; reject(err); }
          return;
        }
        if (!settled) {
          res.statusCode = res.statusCode || 404;
          res.end('');
        }
      });
      queueMicrotask(() => {
        if (bodyBuf) req.push(bodyBuf);
        req.push(null);
      });
    } catch (e) {
      if (!settled) { settled = true; reject(e); }
    }
  });
}
