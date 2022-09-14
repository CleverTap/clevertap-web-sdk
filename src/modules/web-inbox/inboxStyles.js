export const messageStyles = (backgroundColor, borderColor, titleColor, descriptionColor, buttonColor, buttonTextColor) => {
  return `
    <style>
      #messageWrapper {
        margin-bottom: 16px; 
      }
      #message {
        background-color: ${backgroundColor}; 
        border: 1px solid ${borderColor};
        border-radius: 4px; 
        overflow: hidden;
      }
      #iconTitleDescWrapper {
        display: flex; 
        padding: 16px;
      }
      #titleDescWrapper {
        display: flex; 
        flex-direction: column;
      }
      #iconImgContainer {
        display: flex; 
        margin-right: 16px;
      }
      #mainImg {
        width: 100%; 
        background: #b2b1ae;
      }
      #iconImg {
        height: 40px; 
        width: 40px;
      }
      #title {
        font-size: 14px !important; 
        line-height: 20px; 
        font-weight: 600; 
        color: ${titleColor}
      }
      #description {
        font-size: 14px !important; 
        line-height: 20px; 
        font-weight: 400; 
        color: ${descriptionColor}
      }
      [id^="button-"] {
        background-color: ${buttonColor}; 
        color: ${buttonTextColor}; 
        padding: 8px 16px; 
        font-size: 12px; 
        line-height: 16px; 
        font-weight: 600; 
        flex: 1; 
        border-radius: 0px; 
        text-transform: capitalize; 
        cursor: pointer; 
        border: none;
      }
      #buttonsContainer {
        display: flex;
      }
      #timeStamp {
        display: flex; 
        justify-content: end; 
        align-items: center; 
        margin-top: 4px; 
        font-size: 12px !important; 
        line-height: 16px; 
        color: black;
      }
      #unreadMarker {
        height: 8px; 
        width: 8px; 
        border-radius: 50%; 
        background-color: #FFBA00; 
        margin-left: 8px;
      }
      @media only screen and (min-width: 420px) {
        #mainImg {
          height: 180px;
        }
      }
    </style>
  `
}

export const inboxContainerStyles = (backgroundColor, headerTitleColor, closeIconColor, tabColor, categoriesTitleColor) => {
  return `
      <style id="webInboxStyles">
        #unviewedBadge {
          height: 16px; width: 26px; position: absolute;
        }
        #inbox {
          width: 100%;
          position: absolute; 
          background-color: #fff; 
          display: none; 
          box-shadow: 0px 2px 10px 0px #d7d7d791;
        }
  
        #emptyInboxMsg {
          display: none;
          padding: 10px;
          text-align: center;
          color: black;
        }
  
        #panel {
          height: 36px; 
          width: 100%; 
          display: flex; 
          justify-content: center; 
          align-items: center; 
          background-color: ${backgroundColor}; 
          color: ${headerTitleColor}
        }
  
        #closeInbox {
          font-size: 20px; 
          margin-right: 12px; 
          color: ${closeIconColor}; 
          cursor: pointer;
        }
  
        #panelTitle {
          font-size: 14px; 
          line-height: 20px; 
          flex-grow: 1; 
          font-weight: 700; 
          text-align: center;
        }
  
        #categoriesContainer {
          margin: 16px; 
          height: 32px; 
          display: flex;
          scroll-behavior: smooth;
          justify-content: center; 
          align-items: center; 
        }

        #categoriesWrapper {
          height: 32px; 
          overflow-x: scroll;
          display: flex;
          white-space: nowrap;
          width: -webkit-fill-available;
        }

        #categoriesWrapper::-webkit-scrollbar {
          display: none;
        }
  
        #leftBtn, #rightBtn {
          cursor: pointer;
          position: absolute;
          font-weight: bold;
          height: 32px;
          width: 40px;
          align-items: center; 
        }

        #leftBtn {
          left: 15px;
        }

        #rightBtn {
          right: 15px;
          justify-content: end; 
        }

        [id^="category-"] {
          display: flex; 
          flex: 1 1 0; 
          justify-content: center; 
          align-items: center; 
          font-size: 14px; 
          line-height: 20px; 
          background-color: ${tabColor}4d; 
          color: ${categoriesTitleColor}; 
          cursor: pointer;
          padding: 10px;
          border-radius: 15px;
          margin-right: 5px;
        }
  
        #inboxCard {
          padding: 8px 8px 0 8px;
          overflow-y: auto;
        }
  
        @media only screen and (min-width: 420px) {
          #inbox {
            width: 392px;
            height: 546px;
          }
  
          #inboxCard {
            height: 446px; 
            padding: 0 16px;
          }
  
        }
      </style>
      `
}
