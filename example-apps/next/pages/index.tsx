import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import CleverTap from 'clevertap-web-sdk/clevertap'

const Home: NextPage = () => {
  const [clevertapModule, setClevertapModule] = useState<CleverTap | null>(null)

  const handleEventPushClick = async () => {
    let clevertap = clevertapModule
    if (!clevertap) {
      clevertap = await initializeClevertap()
    }

    if (clevertap) {
      clevertap.event.push('Product Viewed', {
        "Product name": "Casio Chronograph Watch",
        "Category": "Mens Accessories",
        "Price": 59.99,
        "Date": new Date()
      }); // Replace Payload as per your event schema and design
    }
  }

  return (
    <div className="App">
      <h3>CleverTap Web SDK using React</h3>
      <div>
        <button onClick={handleEventPushClick}>Push Event</button>
      </div>
    </div>
  )
}

async function initializeClevertap(): Promise<CleverTap> {
  const clevertap = await import('clevertap-web-sdk')

  // clevertap.default.init(ACCOUNT_ID, TARGET_DOMAIN)
  // clevertap.privacy.push({ optOut: false })
  // clevertap.privacy.push({ useIP: false })
  // clevertap.default.setLogLevel(3)

  return clevertap.default
}


export default Home
