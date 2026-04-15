import { afterEach, describe, expect, mock, test } from 'bun:test'

import { MENU_NO } from './constants'
import { AuthenticationError } from './errors'
import { SomaHttp } from './http'

const originalFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = originalFetch
  mock.restore()
})

describe('SomaHttp', () => {
  test('get sends query params and stores cookies', async () => {
    const fetchMock = mock(async (input: RequestInfo | URL, init?: RequestInit) => {
      expect(String(input)).toBe(`https://www.swmaestro.ai/sw/member/user/forLogin.do?menuNo=${MENU_NO.LOGIN}`)
      expect(init?.headers).toEqual({
        'Accept-Language': 'ko,en-US;q=0.9,en;q=0.8',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
      })
      return createResponse('<html></html>', ['JSESSIONID=session-1; Path=/', 'XSRF-TOKEN=csrf-1; Path=/'])
    })
    globalThis.fetch = fetchMock as typeof fetch

    const http = new SomaHttp()
    const html = await http.get('/member/user/forLogin.do', { menuNo: MENU_NO.LOGIN })

    expect(html).toBe('<html></html>')
    expect(http.getCookies()).toEqual({ JSESSIONID: 'session-1', 'XSRF-TOKEN': 'csrf-1' })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  test('post encodes body and injects csrf token', async () => {
    const fetchMock = mock(async (_input: RequestInfo | URL, init?: RequestInit) => {
      expect(init?.method).toBe('POST')
      expect(init?.headers).toEqual({
        'Accept-Language': 'ko,en-US;q=0.9,en;q=0.8',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
        cookie: 'JSESSIONID=session-1',
        'Content-Type': 'application/x-www-form-urlencoded',
      })
      expect(init?.body).toBe('title=%ED%85%8C%EC%8A%A4%ED%8A%B8&csrfToken=csrf-1')
      return createResponse('<html>ok</html>')
    })
    globalThis.fetch = fetchMock as typeof fetch

    const http = new SomaHttp({ sessionCookie: 'session-1', csrfToken: 'csrf-1' })
    const html = await http.post('/mypage/mentoLec/insert.do', { title: '테스트' })

    expect(html).toBe('<html>ok</html>')
  })

  test('post surfaces alert errors from script tags with attributes', async () => {
    const fetchMock = mock(async () =>
      createResponse(
        `<html><head><title>빈페이지</title></head><body><script type='text/javascript'>alert('아이디 혹은 비밀번호가 일치 하지 않습니다.');location.href='/login';</script></body></html>`,
      ),
    )
    globalThis.fetch = fetchMock as typeof fetch

    const http = new SomaHttp({ sessionCookie: 'session-1', csrfToken: 'csrf-1' })

    await expect(http.post('/member/user/toLogin.do', { username: 'neo@example.com' })).rejects.toThrow(
      '아이디 혹은 비밀번호가 일치 하지 않습니다.',
    )
  })

  test('post surfaces alert errors followed by history.back()', async () => {
    const fetchMock = mock(async () =>
      createResponse(
        `<html><head></head><body><script language='JavaScript'>\nalert('잘못된 접근입니다.');\nhistory.back();\n</script></body></html>`,
      ),
    )
    globalThis.fetch = fetchMock as typeof fetch

    const http = new SomaHttp({ sessionCookie: 'session-1', csrfToken: 'csrf-1' })

    await expect(http.post('/mypage/test.do', {})).rejects.toThrow('잘못된 접근입니다.')
  })

  test('post ignores alert() inside function bodies (form validation scripts)', async () => {
    const pageWithValidationScript = `<html><head><title>AI·SW마에스트로 서울</title></head><body>
      <ul class="bbs-reserve"><li class="item">room data</li></ul>
      <script>
      function fn_search() {
        var searchWrd = document.getElementById('searchWrd');
        if (searchWrd.value == '') {
          alert('검색어를 입력하세요.');
          return;
        }
        document.forms[0].submit();
      }
      </script>
    </body></html>`

    const fetchMock = mock(async () => createResponse(pageWithValidationScript))
    globalThis.fetch = fetchMock as typeof fetch

    const http = new SomaHttp({ sessionCookie: 'session-1', csrfToken: 'csrf-1' })

    const html = await http.post('/mypage/officeMng/list.do', { menuNo: '200058' })
    expect(html).toContain('room data')
  })

  describe('postMultipart', () => {
    test('passes FormData to fetch', async () => {
      const fetchMock = mock(async (_input: RequestInfo | URL, init?: RequestInit) => {
        expect(init?.body).toBeInstanceOf(FormData)
        return createResponse('<html>ok</html>')
      })
      globalThis.fetch = fetchMock as typeof fetch

      const http = new SomaHttp({ sessionCookie: 'session-1', csrfToken: 'csrf-1' })

      await expect(http.postMultipart('/test', new FormData())).resolves.toBe('<html>ok</html>')
    })

    test('does not set Content-Type manually', async () => {
      const fetchMock = mock(async (_input: RequestInfo | URL, init?: RequestInit) => {
        expect(init?.headers).toEqual({
          'Accept-Language': 'ko,en-US;q=0.9,en;q=0.8',
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
          cookie: 'JSESSIONID=session-1',
          Referer: 'https://www.swmaestro.ai/sw/test',
        })
        const headers = init?.headers as Record<string, string> | undefined
        expect(headers?.['Content-Type']).toBeUndefined()
        expect(headers?.['content-type']).toBeUndefined()
        return createResponse('<html>ok</html>')
      })
      globalThis.fetch = fetchMock as typeof fetch

      const http = new SomaHttp({ sessionCookie: 'session-1', csrfToken: 'csrf-1' })

      await http.postMultipart('/test', new FormData())
    })

    test('appends csrf token to FormData', async () => {
      const fetchMock = mock(async (_input: RequestInfo | URL, init?: RequestInit) => {
        const body = init?.body
        expect(body).toBeInstanceOf(FormData)
        expect((body as FormData).get('csrfToken')).toBe('csrf-known')
        return createResponse('<html>ok</html>')
      })
      globalThis.fetch = fetchMock as typeof fetch

      const http = new SomaHttp({ csrfToken: 'csrf-known' })

      await http.postMultipart('/test', new FormData())
    })

    test('follows redirects manually', async () => {
      const fetchMock = mock(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input)

        if (url === 'https://www.swmaestro.ai/sw/test') {
          expect(init).toMatchObject({
            method: 'POST',
            redirect: 'manual',
          })
          return createResponse('', [], 'text/html', {
            status: 302,
            headers: { Location: '/mypage/mentoLec/result.do' },
          })
        }

        expect(url).toBe('https://www.swmaestro.ai/mypage/mentoLec/result.do')
        expect(init).toEqual({
          method: 'GET',
          redirect: 'manual',
          headers: {
            'Accept-Language': 'ko,en-US;q=0.9,en;q=0.8',
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
            cookie: 'JSESSIONID=session-1',
          },
        })
        return createResponse('<html>redirected</html>')
      })
      globalThis.fetch = fetchMock as typeof fetch

      const http = new SomaHttp({ sessionCookie: 'session-1', csrfToken: 'csrf-1' })

      await expect(http.postMultipart('/test', new FormData())).resolves.toBe('<html>redirected</html>')
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    test('keeps existing post() behavior unchanged', async () => {
      const fetchMock = mock(async (_input: RequestInfo | URL, init?: RequestInit) => {
        expect(init?.method).toBe('POST')
        expect(init?.headers).toEqual({
          'Accept-Language': 'ko,en-US;q=0.9,en;q=0.8',
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
          cookie: 'JSESSIONID=session-1',
          'Content-Type': 'application/x-www-form-urlencoded',
        })
        expect(init?.body).toBe('title=%ED%85%8C%EC%8A%A4%ED%8A%B8&csrfToken=csrf-1')
        return createResponse('<html>ok</html>')
      })
      globalThis.fetch = fetchMock as typeof fetch

      const http = new SomaHttp({ sessionCookie: 'session-1', csrfToken: 'csrf-1' })

      await expect(http.post('/mypage/mentoLec/insert.do', { title: '테스트' })).resolves.toBe('<html>ok</html>')
    })
  })

  describe('postForm', () => {
    test('converts Record to FormData and delegates to postMultipart', async () => {
      const fetchMock = mock(async (_input: RequestInfo | URL, init?: RequestInit) => {
        const body = init?.body
        expect(body).toBeInstanceOf(FormData)
        const fd = body as FormData
        expect(fd.get('title')).toBe('테스트')
        expect(fd.get('qestnarCn')).toBe('<p>멘토링 내용</p>')
        expect(fd.get('csrfToken')).toBe('csrf-1')
        return createResponse('<html>ok</html>')
      })
      globalThis.fetch = fetchMock as typeof fetch

      const http = new SomaHttp({ sessionCookie: 'session-1', csrfToken: 'csrf-1' })

      await expect(
        http.postForm('/mypage/mentoLec/insert.do', { title: '테스트', qestnarCn: '<p>멘토링 내용</p>' }),
      ).resolves.toBe('<html>ok</html>')
    })

    test('does not set Content-Type header (lets FormData set multipart boundary)', async () => {
      const fetchMock = mock(async (_input: RequestInfo | URL, init?: RequestInit) => {
        const headers = init?.headers as Record<string, string> | undefined
        expect(headers?.['Content-Type']).toBeUndefined()
        expect(headers?.['content-type']).toBeUndefined()
        return createResponse('<html>ok</html>')
      })
      globalThis.fetch = fetchMock as typeof fetch

      const http = new SomaHttp({ sessionCookie: 'session-1', csrfToken: 'csrf-1' })

      await http.postForm('/test', { key: 'value' })
    })
  })

  test('postJson returns parsed json', async () => {
    const fetchMock = mock(async (_input: RequestInfo | URL, init?: RequestInit) => {
      expect(init?.headers).toEqual({
        'Accept-Language': 'ko,en-US;q=0.9,en;q=0.8',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
        cookie: 'JSESSIONID=session-1',
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      })
      return createResponse(JSON.stringify({ resultCode: 'SUCCESS' }), [], 'application/json')
    })
    globalThis.fetch = fetchMock as typeof fetch

    const http = new SomaHttp({ sessionCookie: 'session-1', csrfToken: 'csrf-1' })
    const json = await http.postJson<{ resultCode: string }>('/mypage/officeMng/rentTime.do', {
      itemId: '17',
    })

    expect(json).toEqual({ resultCode: 'SUCCESS' })
  })

  test('login fetches csrf token then posts credentials', async () => {
    const fetchMock = mock(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)

      if (url.includes('/forLogin.do')) {
        expect(init?.method).toBe('GET')
        expect(init?.headers).toEqual({
          'Accept-Language': 'ko,en-US;q=0.9,en;q=0.8',
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
        })
        return createResponse('<form><input type="hidden" name="csrfToken" value="csrf-login"></form>', [
          'JSESSIONID=session-2; Path=/',
        ])
      }

      expect(url).toBe('https://www.swmaestro.ai/sw/member/user/toLogin.do')
      expect(init?.method).toBe('POST')
      expect(init?.headers).toEqual({
        'Accept-Language': 'ko,en-US;q=0.9,en;q=0.8',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
        cookie: 'JSESSIONID=session-2',
        'Content-Type': 'application/x-www-form-urlencoded',
      })

      const body = new URLSearchParams(String(init?.body))
      expect(body.get('username')).toBe('neo@example.com')
      expect(body.get('password')).toBe('secret')
      expect(body.get('csrfToken')).toBe('csrf-login')
      expect(body.get('menuNo')).toBe(MENU_NO.LOGIN)
      return createResponse('<html>logged-in</html>', ['JSESSIONID=session-3; Path=/'])
    })
    globalThis.fetch = fetchMock as typeof fetch

    const http = new SomaHttp()
    await http.login('neo@example.com', 'secret')

    expect(http.getSessionCookie()).toBe('session-3')
    expect(http.getCsrfToken()).toBe('csrf-login')
  })

  test('checkLogin returns user identity when logged in, null otherwise', async () => {
    const loggedInMock = mock(async (_input: RequestInfo | URL, _init?: RequestInit) =>
      createResponse(
        JSON.stringify({
          resultCode: 'fail',
          userVO: { userId: 'user@example.com', userNm: 'Test' },
        }),
        [],
        'application/json',
      ),
    )
    globalThis.fetch = loggedInMock as typeof fetch

    await expect(new SomaHttp().checkLogin()).resolves.toEqual({
      userId: 'user@example.com',
      userNm: 'Test',
    })
    expect(loggedInMock).toHaveBeenCalledWith('https://www.swmaestro.ai/sw/member/user/checkLogin.json', {
      method: 'GET',
      redirect: 'manual',
      headers: {
        'Accept-Language': 'ko,en-US;q=0.9,en;q=0.8',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
        Accept: 'application/json',
      },
    })

    const notLoggedInMock = mock(async () =>
      createResponse(JSON.stringify({ resultCode: 'fail', userVO: { userId: '', userSn: 0 } }), [], 'application/json'),
    )
    globalThis.fetch = notLoggedInMock as typeof fetch

    await expect(new SomaHttp().checkLogin()).resolves.toBeNull()
  })

  test('checkLogin returns null when the server redirects to login', async () => {
    const fetchMock = mock(async () =>
      createResponse('', [], 'text/html', {
        status: 302,
        headers: { Location: 'http://www.swmaestro.ai/sw/member/user/loginForward.do' },
      }),
    )
    globalThis.fetch = fetchMock as typeof fetch

    await expect(new SomaHttp({ sessionCookie: 'session-1' }).checkLogin()).resolves.toBeNull()
  })

  test('checkLogin returns null when the server serves login html instead of json', async () => {
    const fetchMock = mock(async () =>
      createResponse(
        '<html><head><title>AI·SW마에스트로</title></head><body><form><input name="username"><input name="password"></form></body></html>',
      ),
    )
    globalThis.fetch = fetchMock as typeof fetch

    await expect(new SomaHttp({ sessionCookie: 'session-1' }).checkLogin()).resolves.toBeNull()
  })

  test('logout calls logout endpoint', async () => {
    const fetchMock = mock(async (input: RequestInfo | URL) => {
      expect(String(input)).toBe('https://www.swmaestro.ai/sw/member/user/logout.do')
      return createResponse('<html>bye</html>')
    })
    globalThis.fetch = fetchMock as typeof fetch

    await new SomaHttp({ sessionCookie: 'session-1' }).logout()

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  test('extractCsrfToken reads hidden input', async () => {
    const fetchMock = mock(async () => createResponse('<input type="hidden" name="csrfToken" value="csrf-token">'))
    globalThis.fetch = fetchMock as typeof fetch

    const http = new SomaHttp()

    await expect(http.extractCsrfToken()).resolves.toBe('csrf-token')
    expect(http.getCsrfToken()).toBe('csrf-token')
  })

  describe('session-expired alert errors', () => {
    function sessionExpiredAlert(message: string): string {
      return `<html><head></head><body><script language='JavaScript'>\nalert('${message}');\nhistory.back();\n</script></body></html>`
    }

    const expiredMessage = '잘못된 접근입니다. 해당 세션을 전체 초기화 하였습니다.'

    test('post throws AuthenticationError for session-expired alert', async () => {
      const fetchMock = mock(async () => createResponse(sessionExpiredAlert(expiredMessage)))
      globalThis.fetch = fetchMock as typeof fetch

      const http = new SomaHttp({ sessionCookie: 'session-1', csrfToken: 'csrf-1' })

      await expect(http.post('/mypage/officeMng/list.do', { menuNo: '200058' })).rejects.toThrow(AuthenticationError)
    })

    test('get throws AuthenticationError for session-expired alert', async () => {
      const fetchMock = mock(async () => createResponse(sessionExpiredAlert(expiredMessage)))
      globalThis.fetch = fetchMock as typeof fetch

      const http = new SomaHttp({ sessionCookie: 'session-1' })

      await expect(http.get('/mypage/officeMng/list.do')).rejects.toThrow(AuthenticationError)
    })

    test('postMultipart throws AuthenticationError for session-expired alert', async () => {
      const fetchMock = mock(async () => createResponse(sessionExpiredAlert(expiredMessage)))
      globalThis.fetch = fetchMock as typeof fetch

      const http = new SomaHttp({ sessionCookie: 'session-1', csrfToken: 'csrf-1' })

      await expect(http.postMultipart('/mypage/test.do', new FormData())).rejects.toThrow(AuthenticationError)
    })

    test('alert with 세션 + invalidation keyword variants are treated as auth error', async () => {
      const variants = ['세션이 만료되었습니다.', '해당 세션을 초기화하였습니다.', '세션 정보가 유효하지 않습니다.']

      for (const message of variants) {
        const fetchMock = mock(async () => createResponse(sessionExpiredAlert(message)))
        globalThis.fetch = fetchMock as typeof fetch

        const http = new SomaHttp({ sessionCookie: 'session-1', csrfToken: 'csrf-1' })
        await expect(http.post('/test', {})).rejects.toThrow(AuthenticationError)
      }
    })

    test('alert containing 세션 without invalidation keyword is not treated as auth error', async () => {
      const fetchMock = mock(async () => createResponse(sessionExpiredAlert('멘토링 세션이 이미 마감되었습니다.')))
      globalThis.fetch = fetchMock as typeof fetch

      const http = new SomaHttp({ sessionCookie: 'session-1', csrfToken: 'csrf-1' })

      await expect(http.post('/mypage/test.do', {})).rejects.toThrow('멘토링 세션이 이미 마감되었습니다.')
    })

    test('non-session alert still throws regular Error', async () => {
      const fetchMock = mock(async () => createResponse(sessionExpiredAlert('잘못된 접근입니다.')))
      globalThis.fetch = fetchMock as typeof fetch

      const http = new SomaHttp({ sessionCookie: 'session-1', csrfToken: 'csrf-1' })

      await expect(http.post('/mypage/test.do', {})).rejects.toThrow('잘못된 접근입니다.')
    })

    test('get throws regular Error for non-session alert', async () => {
      const fetchMock = mock(async () => createResponse(sessionExpiredAlert('잘못된 접근입니다.')))
      globalThis.fetch = fetchMock as typeof fetch

      const http = new SomaHttp({ sessionCookie: 'session-1' })

      await expect(http.get('/mypage/test.do')).rejects.toThrow('잘못된 접근입니다.')
    })

    test('session-expired alert with double quotes is detected', async () => {
      const doubleQuoteAlert = `<html><body><script language='JavaScript'>\nalert("${expiredMessage}");\nhistory.back();\n</script></body></html>`
      const fetchMock = mock(async () => createResponse(doubleQuoteAlert))
      globalThis.fetch = fetchMock as typeof fetch

      const http = new SomaHttp({ sessionCookie: 'session-1', csrfToken: 'csrf-1' })

      await expect(http.post('/mypage/test.do', {})).rejects.toThrow(AuthenticationError)
    })
  })

  describe('JSON error responses', () => {
    const sessionExpiredJson = JSON.stringify({
      error: '잘못된 접근입니다. 해당 세션을 전체 초기화 하였습니다.',
    })
    const genericErrorJson = JSON.stringify({ error: '처리 중 오류가 발생했습니다.' })

    test('post throws AuthenticationError for session-expired JSON', async () => {
      const fetchMock = mock(async () => createResponse(sessionExpiredJson, [], 'application/json'))
      globalThis.fetch = fetchMock as typeof fetch

      const http = new SomaHttp({ sessionCookie: 'session-1', csrfToken: 'csrf-1' })

      await expect(http.post('/mypage/officeMng/list.do', { menuNo: '200058' })).rejects.toThrow(AuthenticationError)
    })

    test('post throws Error for non-session JSON error', async () => {
      const fetchMock = mock(async () => createResponse(genericErrorJson, [], 'application/json'))
      globalThis.fetch = fetchMock as typeof fetch

      const http = new SomaHttp({ sessionCookie: 'session-1', csrfToken: 'csrf-1' })

      await expect(http.post('/mypage/test.do', {})).rejects.toThrow('처리 중 오류가 발생했습니다.')
    })

    test('postJson throws AuthenticationError for session-expired JSON', async () => {
      const fetchMock = mock(async () => createResponse(sessionExpiredJson, [], 'application/json'))
      globalThis.fetch = fetchMock as typeof fetch

      const http = new SomaHttp({ sessionCookie: 'session-1', csrfToken: 'csrf-1' })

      await expect(http.postJson('/mypage/officeMng/rentTime.do', { itemId: '17' })).rejects.toThrow(
        AuthenticationError,
      )
    })

    test('postJson throws Error for non-session JSON error', async () => {
      const fetchMock = mock(async () => createResponse(genericErrorJson, [], 'application/json'))
      globalThis.fetch = fetchMock as typeof fetch

      const http = new SomaHttp({ sessionCookie: 'session-1', csrfToken: 'csrf-1' })

      await expect(http.postJson('/mypage/test.do', {})).rejects.toThrow('처리 중 오류가 발생했습니다.')
    })

    test('postJson still parses valid JSON when no error field', async () => {
      const fetchMock = mock(async () =>
        createResponse(JSON.stringify({ resultCode: 'SUCCESS' }), [], 'application/json'),
      )
      globalThis.fetch = fetchMock as typeof fetch

      const http = new SomaHttp({ sessionCookie: 'session-1', csrfToken: 'csrf-1' })

      await expect(http.postJson('/mypage/test.do', {})).resolves.toEqual({ resultCode: 'SUCCESS' })
    })

    test('non-JSON body starting with { does not false-positive', async () => {
      const fetchMock = mock(async () => createResponse('{malformed json', [], 'text/html'))
      globalThis.fetch = fetchMock as typeof fetch

      const http = new SomaHttp({ sessionCookie: 'session-1' })

      await expect(http.get('/test')).resolves.toBe('{malformed json')
    })

    test('JSON error with leading whitespace is still detected', async () => {
      const paddedJson = `  \n  ${sessionExpiredJson}`
      const fetchMock = mock(async () => createResponse(paddedJson, [], 'application/json'))
      globalThis.fetch = fetchMock as typeof fetch

      const http = new SomaHttp({ sessionCookie: 'session-1', csrfToken: 'csrf-1' })

      await expect(http.post('/mypage/test.do', {})).rejects.toThrow(AuthenticationError)
    })

    test('get throws Error for non-session JSON error', async () => {
      const fetchMock = mock(async () => createResponse(genericErrorJson, [], 'application/json'))
      globalThis.fetch = fetchMock as typeof fetch

      const http = new SomaHttp({ sessionCookie: 'session-1' })

      await expect(http.get('/mypage/test.do')).rejects.toThrow('처리 중 오류가 발생했습니다.')
    })

    test('postJson throws AuthenticationError for HTML login page response', async () => {
      const loginPageHtml =
        '<html><head><title>AI·SW마에스트로</title></head><body><form><input name="username"><input name="password"></form></body></html>'
      const fetchMock = mock(async () => createResponse(loginPageHtml))
      globalThis.fetch = fetchMock as typeof fetch

      const http = new SomaHttp({ sessionCookie: 'session-1', csrfToken: 'csrf-1' })

      await expect(http.postJson('/mypage/officeMng/rentTime.do', {})).rejects.toThrow(AuthenticationError)
    })
  })
})

function createResponse(
  body: string,
  cookies: string[] = [],
  contentType = 'text/html',
  options: { status?: number; headers?: Record<string, string> } = {},
): Response {
  const headers = new Headers({ 'Content-Type': contentType, ...options.headers })
  const response = new Response(body, { headers, status: options.status })
  const cookieHeaders = cookies

  Object.defineProperty(response.headers, 'getSetCookie', {
    value: () => cookieHeaders,
    configurable: true,
  })

  return response
}
