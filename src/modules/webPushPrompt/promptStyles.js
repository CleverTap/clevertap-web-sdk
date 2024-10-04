export const getBoxPromptStyles = (style) => {
  return `
    #pnWrapper {
    }

    #pnOverlay {
      background-color: ${style.overlay.color || 'rgba(0, 0, 0, .15)'};
      position: fixed;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      z-index: 10000
    }

    #pnCard {
      background-color: ${style.card.color};
      border-radius: ${style.card.borderRadius}px;
      padding: 16px;
      width: 360px;
      position: fixed;
      z-index: 999999;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      ${style.card.borderEnabled ? `
        border-width: ${style.card.border.borderWidth}px;
        border-color: ${style.card.border.borderColor};
        border-style: solid;
      ` : ''}
    }

    #iconTitleDescWrapper {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
      gap: 4px;
    }

    #iconContainer {
      margin-right: 16px;
    }

    #imgElement {
      width: 64px;
      height: 64px;
    }

    #titleDescWrapper {
      flex-grow: 1;
    }

    #title {
      font-size: 18px;
      font-weight: bold;
      color: ${style.text.titleColor};
      margin-bottom: 4px;
    }

    #description {
      font-size: 14px;
      color: ${style.text.descriptionColor};
    }

    #buttonsContainer {
      display: flex;
      justify-content: space-between;
      height: 32px;
      gap: 8px;
    }

    #primaryButton, #secondaryButton {
      padding: 16px;
      flex: 1;
      cursor: pointer;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    #primaryButton {
      background-color: ${style.buttons.primaryButton.buttonColor};
      color: ${style.buttons.primaryButton.textColor};
      border-radius: ${style.buttons.primaryButton.borderRadius}px;
      ${style.buttons.primaryButton.borderEnabled ? `
        border-width: ${style.buttons.primaryButton.border.borderWidth}px;
        border-color: ${style.buttons.primaryButton.border.borderColor};
        border-style: solid;
      ` : ''}
    }

    #secondaryButton {
      background-color: ${style.buttons.secondaryButton.buttonColor};
      color: ${style.buttons.secondaryButton.textColor};
      border-radius: ${style.buttons.secondaryButton.borderRadius}px;
      ${style.buttons.secondaryButton.borderEnabled ? `
        border-width: ${style.buttons.secondaryButton.border.borderWidth}px;
        border-color: ${style.buttons.secondaryButton.border.borderColor};
        border-style: solid;
      ` : ''}
    }

    #primaryButton:hover, #secondaryButton:hover {
      opacity: 0.9;
    }
  `
}

export const getBellIconStyles = (style) => {
  return `
    #bell_wrapper {
      position: fixed;
      cursor: pointer;
      background-color: ${style.card.backgroundColor};
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      gap: 8px;
      z-index: 999999;
    }

    #bell_icon {
      display: block;
      width: 48px;
      height: 48px;
    }

    #bell_wrapper:hover {
      transform: scale(1.05);
      transition: transform 0.2s ease-in-out;
    }

    #bell_tooltip {
      display: none;
      background-color: rgba(43, 46, 62, .9);
      color: #fff;
      border-radius: 4px;
      padding: 4px;
      white-space: nowrap;
      pointer-events: none;
      font-size: 14px;
      line-height: 1.4;
    }

    #gif_modal {
      display: none;
      background-color: #ffffff;
      padding: 4px;
      width: 400px;
      height: 256px;
      border-radius: 4px;
      position: relative;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      cursor: default;
    }

    #gif_image {
      object-fit: contain;
      width: 100%;
      height: 100%;
    }

    #close_modal {
      position: absolute;
      width: 24px;
      height: 24px;
      top: 8px;
      right: 8px;
      background: #9999992F;
      text-align: center;
      line-height: 20px;
      border-radius: 4px;
      color: #000000;
      font-size: 22px;
      cursor: pointer;
    }
  `
}
