import { processWebPushConfig } from '../modules/webPushPrompt/prompt'
import { CampaignContext } from './campaignHouseKeeping/campaignContext'
import { commonCampaignUtils } from './campaignHouseKeeping/commonCampaignUtils'
import { deliveryPreferenceUtils } from './campaignRender/utilities'

const _tr = (msg, { device, session, request, logger }) => {
  const _device = device
  const _session = session
  const _request = request
  const _logger = logger
  let _wizCounter = 0
  // Campaign House keeping

  CampaignContext.update(device, session, request, logger, msg)
  deliveryPreferenceUtils.updateOccurenceForPopupAndNativeDisplay(msg, device, logger)
  deliveryPreferenceUtils.portTLC(_session, logger)

  const _callBackCalled = false
  let exitintentObj

  // Retries processing if document.body isn't ready (up to 6 attempts)
  if (!document.body) {
    if (_wizCounter < 6) {
      _wizCounter++
      setTimeout(_tr, 1000, msg, {
        device: _device,
        session: _session,
        request: _request,
        logger: _logger
      })
    }
    return
  }

  // Processes in-app notifications (e.g., footers, exit intents, native displays)
  if (msg.inapp_notifs != null) {
    commonCampaignUtils.processCampaigns(msg, _callBackCalled, exitintentObj, logger)
  }

  // Initializes and processes web inbox settings and notifications
  if (msg.webInboxSetting || msg.inbox_notifs != null) {
    /**
     * When the user visits a website for the 1st time after web inbox channel is setup,
     * we need to initialise the inbox here because the initializeWebInbox method within init will not be executed
     * as we would not have any entry related to webInboxSettings in the LS
     */

    commonCampaignUtils.handleWebInbox(msg, logger)
  }

  // Processes web push configuration
  if (msg.webPushConfig) {
    processWebPushConfig(msg.webPushConfig, logger, request)
  }

  commonCampaignUtils.handleVariables(msg)
  commonCampaignUtils.persistsEventsAndProfileData(msg, logger)
}

export default _tr
