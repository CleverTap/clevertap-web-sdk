import {
  readFragmentValue,
  readEditorHandle,
  readPreviewBlob,
  readEventId,
  readRecommendations,
  stripFragment,
  sanitizeEditorSiteUrl
} from '../../../../src/modules/visualBuilder/serverSession/fragment'
import { encodeSdkVersion } from '../../../../src/modules/visualBuilder/serverSession/sdkVersion'
import { createEditorApi, EditorApiError } from '../../../../src/modules/visualBuilder/serverSession/api'
import {
  getEditorApiBase,
  buildPersonalisation,
  buildEvtMasterFromMeta
} from '../../../../src/modules/visualBuilder/serverSession'
import { decompressFromBase64 } from '../../../../src/modules/visualBuilder/serverSession/lzsDecompress'
import Account from '../../../../src/modules/account'

describe('visualBuilder/serverSession', () => {
  describe('encodeSdkVersion', () => {
    test('encodes semver to comparable int', () => {
      expect(encodeSdkVersion('3.0.0')).toBe(30000)
      expect(encodeSdkVersion('1.13.1')).toBe(11301)
      expect(encodeSdkVersion('2.5.2')).toBe(20502)
    })

    test('returns 0 for invalid input', () => {
      expect(encodeSdkVersion('')).toBe(0)
      expect(encodeSdkVersion(null)).toBe(0)
      expect(encodeSdkVersion('abc')).toBe(0)
    })
  })

  describe('fragment helpers', () => {
    afterEach(() => {
      window.history.replaceState({}, '', '/?')
    })

    test('readFragmentValue decodes ctEditor handle', () => {
      window.history.replaceState({}, '', '/page#ctEditor=' + encodeURIComponent('v1.abc.sig'))
      expect(readEditorHandle()).toBe('v1.abc.sig')
      expect(readFragmentValue('ctEditor')).toBe('v1.abc.sig')
    })

    test('readPreviewBlob reads ctPreview', () => {
      window.history.replaceState({}, '', '/page#ctPreview=' + encodeURIComponent('preview-blob'))
      expect(readPreviewBlob()).toBe('preview-blob')
    })

    test('readEventId parses positive ctEvent', () => {
      window.history.replaceState({}, '', '/page#ctEditor=h&ctEvent=42')
      expect(readEventId()).toBe(42)
      window.history.replaceState({}, '', '/page#ctEditor=h&ctEvent=0')
      expect(readEventId()).toBeNull()
      window.history.replaceState({}, '', '/page#ctEditor=h')
      expect(readEventId()).toBeNull()
    })

    test('readRecommendations decompresses ctRecs LZS payload from dashboard', () => {
      // compressToBase64(JSON.stringify({ r1: { id: 1, name: 'Top' } })) via dashboard util/lzs
      const compressed = 'N4IgTgjCBcoJYBMYQDQgHYEMC2BTGIAKgPYAOIAvhUA='
      expect(JSON.parse(decompressFromBase64(compressed))).toEqual({ r1: { id: 1, name: 'Top' } })
      window.history.replaceState(
        {},
        '',
        '/page#ctEditor=h&ctRecs=' + encodeURIComponent(compressed)
      )
      expect(readRecommendations()).toEqual({ r1: { id: 1, name: 'Top' } })
    })

    test('readRecommendations returns {} when missing or invalid', () => {
      window.history.replaceState({}, '', '/page#ctEditor=h')
      expect(readRecommendations()).toEqual({})
      window.history.replaceState({}, '', '/page#ctRecs=not-valid-lzs!!!')
      expect(readRecommendations()).toEqual({})
    })

    test('stripFragment clears the hash', () => {
      window.history.replaceState({}, '', '/page?ctActionMode=ctBuilderV2#ctEditor=handle')
      stripFragment()
      expect(window.location.hash).toBe('')
      expect(window.location.search).toContain('ctActionMode=ctBuilderV2')
    })

    test('returns null when fragment key is missing', () => {
      window.history.replaceState({}, '', '/page')
      expect(readEditorHandle()).toBeNull()
      expect(readPreviewBlob()).toBeNull()
    })

    test('sanitizeEditorSiteUrl strips ctActionMode and editor fragment keys', () => {
      const dirty =
        'https://shop.example.com/page?ctActionMode=ctBuilderV2&x=1#ctEditor=h&ctEvent=7&ctRecs=abc&section=hero'
      const clean = sanitizeEditorSiteUrl(dirty)
      const parsed = new URL(clean)
      expect(parsed.searchParams.get('ctActionMode')).toBeNull()
      expect(parsed.searchParams.get('x')).toBe('1')
      expect(parsed.hash).toBe('#section=hero')
    })

    test('sanitizeEditorSiteUrl leaves a clean customer url unchanged', () => {
      expect(sanitizeEditorSiteUrl('https://shop.example.com/page?q=1#top'))
        .toBe('https://shop.example.com/page?q=1#top')
    })
  })

  describe('buildPersonalisation', () => {
    test('profile from meta; event and recommendations from dashboard bootstrap', () => {
      expect(buildPersonalisation({
        meta: { profileProps: { 1: 'Email', 2: 'Name' }, eventProps: { 5: 'Amount' } },
        eventId: 42,
        recommendations: { r1: { id: 1 } }
      })).toEqual({
        profile: ['Email', 'Name'],
        event: 42,
        recommendations: { r1: { id: 1 } }
      })
    })

    test('defaults safely when bootstrap pieces are missing', () => {
      expect(buildPersonalisation({
        meta: null,
        eventId: null,
        recommendations: {}
      })).toEqual({
        profile: [],
        event: 0,
        recommendations: {}
      })
    })
  })

  describe('buildEvtMasterFromMeta', () => {
    test('maps LC eventProps id→name into evtMaster shape for the widget', () => {
      expect(buildEvtMasterFromMeta(
        { eventProps: { 5: 'Amount', 9: 'Currency' }, profileProps: { 1: 'Email' } },
        42
      )).toEqual({
        42: {
          id: 42,
          name: '',
          drp: 0,
          props: [
            { id: 5, name: 'Amount' },
            { id: 9, name: 'Currency' }
          ]
        }
      })
    })

    test('returns empty object when eventId is missing or invalid', () => {
      expect(buildEvtMasterFromMeta({ eventProps: { 5: 'Amount' } }, null)).toEqual({})
      expect(buildEvtMasterFromMeta({ eventProps: { 5: 'Amount' } }, 0)).toEqual({})
    })

    test('returns event entry with empty props when meta has no eventProps', () => {
      expect(buildEvtMasterFromMeta({ profileProps: { 1: 'Email' } }, 7)).toEqual({
        7: { id: 7, name: '', drp: 0, props: [] }
      })
    })
  })

  describe('getEditorApiBase', () => {
    test('uses editorApiURL override when set', () => {
      const account = new Account({ id: 'WWW-WWW-WWRZ' }, 'eu1')
      account.editorApiURL = 'https://eu1.wizrocketedit.net/'
      expect(getEditorApiBase(account)).toBe('https://eu1.wizrocketedit.net')
    })

    test('falls back to dataPostURL host', () => {
      const account = new Account({ id: 'WWW-WWW-WWRZ' }, 'in1')
      expect(getEditorApiBase(account)).toBe('https://in1.clevertap-prod.com')
    })
  })

  describe('createEditorApi', () => {
    const originalFetch = global.fetch

    afterEach(() => {
      global.fetch = originalFetch
    })

    test('auth posts handle and sdkVersion with account header', () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ sessionId: 's1', details: [] })
      })
      const api = createEditorApi({
        accountId: 'WWW-WWW-WWRZ',
        apiBase: 'https://eu1.clevertap-prod.com',
        logger: { debug: jest.fn() }
      })
      return api.auth('the-handle', 30000).then((result) => {
        expect(result.sessionId).toBe('s1')
        expect(global.fetch).toHaveBeenCalledWith(
          'https://eu1.clevertap-prod.com/editor/auth',
          expect.objectContaining({
            method: 'POST',
            mode: 'cors',
            credentials: 'omit',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
              'X-CleverTap-Account-Id': 'WWW-WWW-WWRZ'
            }),
            body: JSON.stringify({ handle: 'the-handle', sdkVersion: 30000 })
          })
        )
      })
    })

    test('meta includes eventId when provided', () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ profileProps: {}, eventProps: {} })
      })
      const api = createEditorApi({
        accountId: 'acc',
        apiBase: 'https://eu1.clevertap-prod.com'
      })
      return api.meta('h', 42).then(() => {
        expect(JSON.parse(global.fetch.mock.calls[0][1].body)).toEqual({
          handle: 'h',
          eventId: 42
        })
      })
    })

    test('saveContent posts details', () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ saved: true })
      })
      const api = createEditorApi({
        accountId: 'acc',
        apiBase: 'https://eu1.clevertap-prod.com'
      })
      return api.saveContent('h', [{ url: 'https://x.com', selectorData: [] }]).then(() => {
        expect(JSON.parse(global.fetch.mock.calls[0][1].body)).toEqual({
          handle: 'h',
          details: [{ url: 'https://x.com', selectorData: [] }]
        })
      })
    })

    test('preview posts blob', () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ details: [{ url: 'https://x.com', selectorData: [] }] })
      })
      const api = createEditorApi({
        accountId: 'acc',
        apiBase: 'https://eu1.clevertap-prod.com'
      })
      return api.preview('sealed').then((res) => {
        expect(res.details).toHaveLength(1)
        expect(JSON.parse(global.fetch.mock.calls[0][1].body)).toEqual({ blob: 'sealed' })
      })
    })

    test('throws EditorApiError on non-OK response', () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.resolve({ error: 'Invalid editor session.' })
      })
      const api = createEditorApi({
        accountId: 'acc',
        apiBase: 'https://eu1.clevertap-prod.com',
        logger: { debug: jest.fn() }
      })
      return api.auth('bad', 1).then(
        () => {
          throw new Error('expected auth to reject')
        },
        (err) => {
          expect(err).toBeInstanceOf(EditorApiError)
          expect(err.status).toBe(401)
          expect(err.message).toBe('Invalid editor session.')
        }
      )
    })
  })
})
