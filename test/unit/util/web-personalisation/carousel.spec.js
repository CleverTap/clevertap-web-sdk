import { CTWebPersonalisationCarousel } from '../../../../src/util/web-personalisation/carousel'
import { CampaignContext } from '../../../../src/util/campaignHouseKeeping/campaignContext'

if (customElements.get('ct-web-personalisation-carousel') === undefined) {
  customElements.define('ct-web-personalisation-carousel', CTWebPersonalisationCarousel)
}

const buildTarget = () => ({
  wzrk_id: 'campaign_1',
  wzrk_pivot: 'pivot_1',
  display: {
    details: [
      { desktopImageURL: 'slide-1.jpg', mobileImageURL: 'slide-1-m.jpg', onClick: '' },
      { desktopImageURL: 'slide-2.jpg', mobileImageURL: 'slide-2-m.jpg', onClick: '' },
      { desktopImageURL: 'slide-3.jpg', mobileImageURL: 'slide-3-m.jpg', onClick: '' }
    ],
    showNavBtns: false,
    showNavArrows: false,
    navBtnsCss: '',
    navArrowsCss: '',
    sliderTime: 30
  }
})

const slideViewedCalls = () => {
  return window.clevertap.renderNotificationViewed.mock.calls
    .map((call) => call[0])
    .filter((payload) => payload && payload.wzrk_slideNo)
}

const campaignViewedCalls = () => {
  return window.clevertap.renderNotificationViewed.mock.calls
    .map((call) => call[0])
    .filter((payload) => payload && payload.msgId && !payload.wzrk_slideNo)
}

const mountCarousel = () => {
  const carousel = document.createElement('ct-web-personalisation-carousel')
  carousel.target = buildTarget()
  return carousel
}

describe('web native display carousel notification viewed', function () {
  beforeEach(() => {
    jest.useFakeTimers()
    sessionStorage.clear()
    CampaignContext._session = { sessionId: 'session-1' }
    window.clevertap = {
      renderNotificationViewed: jest.fn(),
      renderNotificationClicked: jest.fn()
    }
  })

  afterEach(() => {
    jest.clearAllTimers()
    jest.useRealTimers()
    sessionStorage.clear()
    CampaignContext._session = null
  })

  test('raises campaign viewed and first slide viewed on render', () => {
    mountCarousel()

    expect(campaignViewedCalls()).toEqual([
      { msgId: 'campaign_1', pivotId: 'pivot_1' }
    ])
    expect(slideViewedCalls()).toEqual([
      { msgId: 'campaign_1', pivotId: 'pivot_1', wzrk_slideNo: 1 }
    ])
  })

  test('raises viewed for a newly shown slide with that slide number', () => {
    const carousel = mountCarousel()
    window.clevertap.renderNotificationViewed.mockClear()

    carousel.goToNext()

    expect(slideViewedCalls()).toEqual([
      { msgId: 'campaign_1', pivotId: 'pivot_1', wzrk_slideNo: 2 }
    ])
    expect(campaignViewedCalls()).toEqual([])
  })

  test('does not raise viewed again for a slide already seen in the same session', () => {
    const carousel = mountCarousel()
    carousel.goToNext()
    window.clevertap.renderNotificationViewed.mockClear()

    carousel.goToPrev()
    carousel.goToNext()

    expect(slideViewedCalls()).toEqual([])
  })

  test('does not raise slide viewed again when carousel is rendered again in the same session', () => {
    mountCarousel()
    window.clevertap.renderNotificationViewed.mockClear()

    mountCarousel()

    expect(slideViewedCalls()).toEqual([])
    expect(campaignViewedCalls()).toEqual([
      { msgId: 'campaign_1', pivotId: 'pivot_1' }
    ])
  })

  test('raises slide viewed again for a new session', () => {
    mountCarousel()
    CampaignContext._session = { sessionId: 'session-2' }
    window.clevertap.renderNotificationViewed.mockClear()

    mountCarousel()

    expect(slideViewedCalls()).toEqual([
      { msgId: 'campaign_1', pivotId: 'pivot_1', wzrk_slideNo: 1 }
    ])
  })
})
