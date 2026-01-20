import https from 'https';
import querystring from 'querystring';

let cookieVal: string | undefined;

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 750;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function runRequest(
  options: https.RequestOptions,
  body: string,
  attempt: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let chunk = '';

      res.on('data', (data) => { chunk += data; });

      res.on('end', async () => {
        const hasSetCookie = !!res.headers['set-cookie']?.length;
        console.log('res.headers', res.headers);
        
        if (hasSetCookie) {
          // Only keep the name=value part of the cookie, discard attributes like Expires, Path, etc.
          const newCookie = res.headers['set-cookie']![0].split(';')[0];
          cookieVal = newCookie;
          if (options.headers) {
            (options.headers as Record<string, string>)['cookie'] = cookieVal;
          }
        }

        const isRateLimited =
          res.statusCode === 429 ||
          chunk.includes('Error 429') ||
          chunk.includes('Too Many Requests');
        
        const isUnauthorized = res.statusCode === 401;
          
        const isMovedPermanentlyOrRedirect = res.statusCode === 302;
        if (isMovedPermanentlyOrRedirect) {
          cookieVal = undefined;
          if (options.headers) {
            delete (options.headers as Record<string, string>)['cookie'];
          }
          if (attempt < MAX_RETRIES) {
            const retryResponse = await runRequest(options, body, attempt + 1);
            resolve(retryResponse);
            return;
          }
        }

        if (isRateLimited || isUnauthorized) {
          if (attempt < MAX_RETRIES) {
            const delay = BASE_DELAY_MS * Math.pow(2, attempt) + Math.floor(Math.random() * 250);
            await sleep(delay);
            try {
              const retryResponse = await runRequest(options, body, attempt + 1);
              resolve(retryResponse);
              return;
            } catch (err) {
              reject(err);
              return;
            }
          }
        }

        resolve(chunk);
      });
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
  },
  enableBackoff: boolean = false
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
  const response = enableBackoff
    ? await runRequest(requestOptions, bodyString, 0)
    : await runRequest(requestOptions, bodyString, MAX_RETRIES);

  return {
    text: () => Promise.resolve(response)
  };
};
