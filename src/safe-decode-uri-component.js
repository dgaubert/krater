export default function safeDecodeURIComponent (text) {
  try {
    return decodeURIComponent(text)
  } catch (e) {
    return text
  }
}
