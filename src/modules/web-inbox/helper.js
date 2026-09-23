import { StorageManager, $ct } from '../../util/storage'
import { Inbox } from './WebInbox'
import { Message } from './Message'
import { WEBINBOX_CONFIG } from '../../util/constants'
import { CampaignContext } from '../../util/campaignHouseKeeping/campaignContext'
import {
  getInboxPosition,
  determineTimeStampText,
  arrowSvg,
  greenTickSvg,
  getInboxMessages,
  saveInboxMessages
} from './inboxUtils'

export {
  getInboxPosition,
  determineTimeStampText,
  arrowSvg,
  greenTickSvg,
  getInboxMessages,
  saveInboxMessages
}

export const processWebInboxSettings = (webInboxSetting, isPreview = false) => {
  const storage = CampaignContext.instanceManager ? CampaignContext.instanceManager.storage : StorageManager
  const inbox = CampaignContext.instanceManager ? CampaignContext.instanceManager.state.inbox : $ct.inbox
  const _settings = storage.readFromLSorCookie(WEBINBOX_CONFIG) || {}
  if (isPreview) {
    if (inbox) {
      inbox.inboxConfigForPreview = webInboxSetting
      inbox.isPreview = true
      inbox.init()
    }
  } else if (JSON.stringify(_settings) !== JSON.stringify(webInboxSetting)) {
    storage.saveToLSorCookie(WEBINBOX_CONFIG, webInboxSetting)
    inbox && inbox.init()
  }
}

export const processInboxNotifs = (msg) => {
  const inbox = CampaignContext.instanceManager ? CampaignContext.instanceManager.state.inbox : $ct.inbox
  if (msg.inbox_preview) {
    inbox.incomingMessagesForPreview = msg.inbox_notifs
  } else {
    inbox.incomingMessages = msg
  }
}

export const processWebInboxResponse = (msg) => {
  if (msg.webInboxSetting) {
    processWebInboxSettings(msg.webInboxSetting, msg.inbox_preview)
  }
  if (msg.inbox_notifs != null) {
    processInboxNotifs(msg)
  }
}

export const addWebInbox = (logger, instanceManager) => {
  checkAndRegisterWebInboxElements()
  const inboxState = instanceManager ? instanceManager.state : $ct
  const inbox = new Inbox({ logger })
  inbox.instanceManager = instanceManager || null
  inboxState.inbox = inbox
  document.body.appendChild(inbox)
}

export const initializeWebInbox = (logger, instanceManager) => {
  return new Promise((resolve, reject) => {
    const _storage = instanceManager ? instanceManager.storage : StorageManager
    const inboxState = instanceManager ? instanceManager.state : $ct

    const retryUntil = (condition, interval = 500, maxRetries = 20) => {
      return new Promise((resolve, reject) => {
        let attempts = 0
        const retry = setInterval(() => {
          logger.debug(`Retry attempt: ${attempts + 1}`)
          if (condition()) {
            clearInterval(retry)
            resolve() // Success
          } else if (inboxState.inbox !== null) {
            clearInterval(retry)
            resolve() // Inbox already initialized
          } else if (attempts >= maxRetries) {
            clearInterval(retry)
            reject(new Error('Condition not met within max retries'))
          }
          attempts++
        }, interval)
      })
    }

    const addInboxSafely = () => {
      if (inboxState.inbox === null) {
        addWebInbox(logger, instanceManager)
      }
    }

    const checkElementCondition = () => {
      const config = _storage.readFromLSorCookie(WEBINBOX_CONFIG) || {}
      return document.getElementById(config.inboxSelector) && inboxState.inbox === null
    }

    const onFailure = () => {
      logger.debug('Failed to add inbox')
    }

    let retryStarted = false // Guard flag
    const startRetry = () => {
      const config = _storage.readFromLSorCookie(WEBINBOX_CONFIG) || {}
      if (!config.inboxSelector) {
        logger.debug('Web Inbox Retry Skipped, Inbox selector is not configured')
        return false
      }

      if (!retryStarted) {
        retryStarted = true
        retryUntil(checkElementCondition, 500, 20)
          .then(() => {
            addInboxSafely()
            resolve()
          })
          .catch(onFailure)
      }
    }

    const setupEventListeners = () => {
      if (document.readyState === 'complete') {
        startRetry()
      } else {
        window.addEventListener('load', startRetry)
        document.addEventListener(
          'readystatechange',
          () => {
            if (document.readyState === 'complete') {
              startRetry()
            }
          }
        )
      }
    }

    setupEventListeners()
  })
}

export const checkAndRegisterWebInboxElements = () => {
  if (customElements.get('ct-web-inbox') === undefined) {
    customElements.define('ct-web-inbox', Inbox)
    customElements.define('ct-inbox-message', Message)
  }
}

export const hasWebInboxSettingsInLS = (instanceManager) => {
  const storage = instanceManager ? instanceManager.storage : StorageManager
  return Object.keys(storage.readFromLSorCookie(WEBINBOX_CONFIG) || {}).length > 0
}
