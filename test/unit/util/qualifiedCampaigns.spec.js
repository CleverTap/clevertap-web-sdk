import { addCampaignToLocalStorage } from '../../../src/util/campaignRender/utilities'
import { isQualifiedCampaignsDebugEnabled } from '../../../src/util/campaignStorage'
import { CampaignContext } from '../../../src/util/campaignHouseKeeping/campaignContext'
import { QUALIFIED_CAMPAIGNS, QUALIFIED_CAMPAIGNS_DEBUG } from '../../../src/util/constants'

describe('qualified campaigns (WZRK_QC) debug recording', () => {
  let store, storage

  const stored = () => JSON.parse(decodeURIComponent(store[QUALIFIED_CAMPAIGNS]))
  const campaign = (wzrkId, display = {}) => ({ wzrk_id: wzrkId, display: { wtarget_type: 0, ...display } })

  beforeEach(() => {
    sessionStorage.clear()
    store = {}
    storage = {
      readFromLSorCookie: jest.fn((key) => store[key]),
      saveToLSorCookie: jest.fn((key, value) => { store[key] = value })
    }
    CampaignContext.update(null, null, null, null, null, 'eu1', { storage }, null)
  })

  describe('isQualifiedCampaignsDebugEnabled', () => {
    test('is false when the marker is not set', () => {
      expect(isQualifiedCampaignsDebugEnabled()).toBe(false)
    })

    test('is true when the marker is set', () => {
      sessionStorage.setItem(QUALIFIED_CAMPAIGNS_DEBUG, '')
      expect(isQualifiedCampaignsDebugEnabled()).toBe(true)
    })

    test('is false when sessionStorage throws', () => {
      const spy = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked') })
      expect(isQualifiedCampaignsDebugEnabled()).toBe(false)
      spy.mockRestore()
    })
  })

  describe('addCampaignToLocalStorage', () => {
    test('does not record when debugging is off', () => {
      addCampaignToLocalStorage(campaign('123_20261118'), 'eu1', 'ACC')
      expect(storage.saveToLSorCookie).not.toHaveBeenCalled()
    })

    test('records the full campaign with its dashboard url when debugging is on', () => {
      sessionStorage.setItem(QUALIFIED_CAMPAIGNS_DEBUG, '')
      addCampaignToLocalStorage(campaign('123_20261118', { html: '<div></div>' }), 'eu1', 'ACC')
      expect(stored()).toEqual([{
        ...campaign('123_20261118', { html: '<div></div>' }),
        url: 'https://eu1.dashboard.clevertap.com/ACC/campaigns/campaign/123/report/stats'
      }])
    })

    test('skips preview campaigns even when debugging is on', () => {
      sessionStorage.setItem(QUALIFIED_CAMPAIGNS_DEBUG, '')
      addCampaignToLocalStorage(campaign('123_20261118', { preview: true }), 'eu1', 'ACC')
      expect(storage.saveToLSorCookie).not.toHaveBeenCalled()
    })

    test('skips a campaign already recorded with the same wzrk_id', () => {
      sessionStorage.setItem(QUALIFIED_CAMPAIGNS_DEBUG, '')
      addCampaignToLocalStorage(campaign('123_20261118'), 'eu1', 'ACC')
      addCampaignToLocalStorage(campaign('123_20261118'), 'eu1', 'ACC')
      addCampaignToLocalStorage(campaign('456_20261118'), 'eu1', 'ACC')
      expect(stored().map(c => c.wzrk_id)).toEqual(['123_20261118', '456_20261118'])
    })
  })
})
