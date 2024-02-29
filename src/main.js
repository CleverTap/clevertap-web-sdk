import Clevertap from './clevertap'
import { isIntializedInsideShopify } from './util/clevertap'

const clevertap = new Clevertap(isIntializedInsideShopify() ? {} : window.clevertap)

if (!isIntializedInsideShopify()) {
  window.clevertap = window.wizrocket = clevertap
} else {
  return (browser) => clevertap;
}

export default clevertap
