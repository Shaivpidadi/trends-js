import https from 'https';
import querystring from 'querystring';

let cookieVal: string | undefined;

function rereq(options: https.RequestOptions, body?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let chunk = '';
      res.on('data', (data) => { chunk += data; });
      res.on('end', () => resolve(chunk));
    });

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

export const request = async (
  url: string,
  options: {
    method?: string;
    qs?: Record<string, any>;
    body?: string | Record<string, any>;
    headers?: Record<string, string>;
    contentType?: 'json' | 'form';
  }
): Promise<{ text: () => Promise<string> }> => {
  const parsedUrl = new URL(url);
  const method = options.method || 'POST';

  // Prepare body
  let bodyString = '';
  const contentType = options.contentType || 'json';

  if (typeof options.body === 'string') {
    bodyString = options.body;
  } else if (contentType === 'form') {
    bodyString = querystring.stringify(options.body || {});
  } else if (options.body) {
    bodyString = JSON.stringify(options.body);
  }

  const requestOptions: https.RequestOptions = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port || 443,
    path: `${parsedUrl.pathname}${options.qs ? '?' + querystring.stringify(options.qs) : ''}`,
    method,
    headers: {
      ...(options.headers || {}),
      ...(contentType === 'form'
        ? { 'Content-Type': 'application/x-www-form-urlencoded' }
        : { 'Content-Type': 'application/json' }),
      ...(bodyString ? { 'Content-Length': Buffer.byteLength(bodyString).toString() } : {}),
      ...(cookieVal ? { cookie: cookieVal } : {})
    }
  };

  const response = await new Promise<string>((resolve, reject) => {
    const req = https.request(requestOptions, (res) => {
      let chunk = '';

      res.on('data', (data) => { chunk += data; });

      res.on('end', async () => {
        if (res.statusCode === 429 && res.headers['set-cookie']) {
          cookieVal = res.headers['set-cookie'][0].split(';')[0];
          (requestOptions.headers as Record<string, string>)['cookie'] = cookieVal;
          try {
            const retryResponse = await rereq(requestOptions, bodyString);
            resolve(retryResponse);
          } catch (err) {
            reject(err);
          }
        } else {
          resolve(chunk);
        }
      });
    });

    req.on('error', reject);
    if (bodyString) req.write(bodyString);
    req.end();
  });

  return {
    text: () => Promise.resolve(response)
  };
};
