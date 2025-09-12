/**
 * Momence Booking Popup - Vanilla JavaScript
 * A reusable booking popup that can be integrated into any website
 */

class MomenceBookingPopup {
  constructor(options = {}) {
    // Default configuration
    this.config = {
      hostId: "89357", // Replace with your Momence host ID
      fontFamily: "Helvetica, Arial, sans-serif",
      primaryColor: "#6b7280",
      backgroundColor: "#ffffff",
      overlayColor: "rgba(0, 0, 0, 0.5)",
      closeButtonText: "← Back",
      popupTitle: "Book Appointment",
      animationDuration: 300,
      iframeUrl: null, // Will be constructed from hostId
      ...options,
    }

    // Construct iframe URL if not provided
    if (!this.config.iframeUrl) {
      this.config.iframeUrl = `https://momence.com/appointments/${this.config.hostId}`
    }

    // State
    this.isOpen = false
    this.popup = null
    this.iframe = null

    // Bind methods
    this.open = this.open.bind(this)
    this.close = this.close.bind(this)
    this.handleEscapeKey = this.handleEscapeKey.bind(this)
    this.handleOverlayClick = this.handleOverlayClick.bind(this)
    this.handleIframeMessage = this.handleIframeMessage.bind(this)

    // Initialize
    this.init()
  }

  init() {
    // Create popup HTML
    this.createPopup()

    // Add Momence CSS variables to document
    this.addMomenceStyles()

    // Setup event listeners
    this.setupEventListeners()
  }

  createPopup() {
    // Create overlay
    this.popup = document.createElement("div")
    this.popup.className = "momence-popup-overlay"
    this.popup.innerHTML = `
            <div class="momence-popup-container">
                <div class="momence-popup-header">
                    <h3 class="momence-popup-title">${this.config.popupTitle}</h3>
                    <button class="momence-popup-close" type="button">
                        ${this.config.closeButtonText}
                    </button>
                </div>
                <div class="momence-popup-content">
                    <div class="momence-iframe-container">
                        <div class="momence-loading">
                            <div class="momence-loading-spinner"></div>
                            Loading booking calendar...
                        </div>
                    </div>
                </div>
            </div>
        `

    // Apply custom styles
    this.applyCustomStyles()

    // Append to body
    document.body.appendChild(this.popup)
  }

  applyCustomStyles() {
    const container = this.popup.querySelector(".momence-popup-container")
    const header = this.popup.querySelector(".momence-popup-header")
    const closeBtn = this.popup.querySelector(".momence-popup-close")
    const title = this.popup.querySelector(".momence-popup-title")

    // Apply font family
    if (this.config.fontFamily) {
      this.popup.style.fontFamily = this.config.fontFamily
    }

    // Apply overlay color
    if (this.config.overlayColor) {
      this.popup.style.backgroundColor = this.config.overlayColor
    }

    // Apply container background
    if (this.config.backgroundColor) {
      container.style.backgroundColor = this.config.backgroundColor
    }

    // Apply primary color to interactive elements
    if (this.config.primaryColor) {
      closeBtn.style.color = this.config.primaryColor
      title.style.color = this.config.primaryColor
    }
  }

  addMomenceStyles() {
    // Add Momence CSS variables if they don't exist
    if (!document.querySelector("#momence-css-vars")) {
      const style = document.createElement("style")
      style.id = "momence-css-vars"
      style.textContent = `
                :root {
                    --momenceColorBackground: ${this.config.backgroundColor};
                    --momenceColorPrimary: ${this.hexToRgb(this.config.primaryColor)};
                    --momenceColorBlack: 3, 1, 13;
                }
            `
      document.head.appendChild(style)
    }
  }

  hexToRgb(hex) {
    // Convert hex color to RGB values for Momence CSS variables
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (result) {
      return `${Number.parseInt(result[1], 16)}, ${Number.parseInt(result[2], 16)}, ${Number.parseInt(result[3], 16)}`
    }
    return "107, 114, 128" // Default gray-500
  }

  setupEventListeners() {
    // Close button
    const closeBtn = this.popup.querySelector(".momence-popup-close")
    closeBtn.addEventListener("click", this.close)

    // Overlay click (close when clicking outside)
    this.popup.addEventListener("click", this.handleOverlayClick)

    // Prevent closing when clicking inside the container
    const container = this.popup.querySelector(".momence-popup-container")
    container.addEventListener("click", (e) => {
      e.stopPropagation()
    })

    // Listen for iframe messages (for dynamic resizing)
    window.addEventListener("message", this.handleIframeMessage)
  }

  handleOverlayClick(e) {
    if (e.target === this.popup) {
      this.close()
    }
  }

  handleEscapeKey(e) {
    if (e.key === "Escape" && this.isOpen) {
      this.close()
    }
  }

  handleIframeMessage(e) {
    if (!this.iframe || !this.isOpen) return

    const height = +e.data?.height
    const type = e.data?.type

    if (!type || !type.match(`iframe_appointments_${this.config.hostId}_resize`) || isNaN(height)) {
      return
    }

    // Update iframe height
    this.iframe.style.height = height + "px"
  }

  createIframe() {
    const container = this.popup.querySelector(".momence-iframe-container")
    const loading = container.querySelector(".momence-loading")

    // Create iframe
    this.iframe = document.createElement("iframe")
    this.iframe.id = `iframe_appointments_${this.config.hostId}`
    this.iframe.className = "momence-booking-iframe"
    this.iframe.src = this.config.iframeUrl
    this.iframe.style.width = "100%"
    this.iframe.style.border = "0px"
    this.iframe.style.minHeight = "600px"
    this.iframe.allowFullscreen = true
    this.iframe.scrolling = "no"

    // Hide loading when iframe loads
    this.iframe.onload = () => {
      if (loading) {
        loading.style.display = "none"
      }
    }

    // Add iframe to container
    container.appendChild(this.iframe)
  }

  open() {
    if (this.isOpen) return

    this.isOpen = true

    // Create iframe if it doesn't exist
    if (!this.iframe) {
      this.createIframe()
    }

    // Show popup
    this.popup.classList.add("active")

    // Prevent body scroll
    document.body.style.overflow = "hidden"

    // Add escape key listener
    document.addEventListener("keydown", this.handleEscapeKey)

    // Focus management for accessibility
    const closeBtn = this.popup.querySelector(".momence-popup-close")
    setTimeout(() => {
      closeBtn.focus()
    }, this.config.animationDuration)
  }

  close() {
    if (!this.isOpen) return

    this.isOpen = false

    // Hide popup
    this.popup.classList.remove("active")

    // Restore body scroll
    document.body.style.overflow = ""

    // Remove escape key listener
    document.removeEventListener("keydown", this.handleEscapeKey)
  }

  destroy() {
    // Clean up event listeners
    window.removeEventListener("message", this.handleIframeMessage)
    document.removeEventListener("keydown", this.handleEscapeKey)

    // Remove popup from DOM
    if (this.popup && this.popup.parentNode) {
      this.popup.parentNode.removeChild(this.popup)
    }

    // Reset state
    this.isOpen = false
    this.popup = null
    this.iframe = null
  }

  // Public API methods
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig }
    this.applyCustomStyles()
    this.addMomenceStyles()
  }

  isPopupOpen() {
    return this.isOpen
  }
}

// Make it available globally
window.MomenceBookingPopup = MomenceBookingPopup
