/**
 * ============================================================
 * CONFIG.JS - MTs LANTABOER PPDB
 * Supabase Configuration & Database Operations
 * ============================================================
 * 
 * File ini berisi:
 * - Konfigurasi Supabase
 * - Fungsi CRUD untuk semua tabel
 * - Utility functions
 * - Error handling
 * - Toast notifications
 * 
 * Versi: 2.0 (Production Ready)
 * ============================================================
 */

// ========== SUPABASE CONFIGURATION ==========
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.0/+esm'

const SUPABASE_URL = 'https://jcimzcyogwxetzhbkhab.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_9gHJhn7VJcL6ZQAGdDHzkg_99jqkYLk'

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    },
  },
})

// ========== USER SESSION MANAGEMENT ==========
/**
 * Generate dan get user session ID untuk fitur edit/hapus komentar
 * Session disimpan di localStorage browser
 */
export const getSessionId = () => {
  let sessionId = localStorage.getItem('mts_user_session_id')
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    localStorage.setItem('mts_user_session_id', sessionId)
  }
  return sessionId
}
// ========== DATABASE OPERATIONS ==========
export const db = {
  // ===== COMMENTS =====
  
  /**
   * Get all approved comments
   * @param {number} limit - Max comments to fetch
   * @returns {Promise<Array>} Array of comments
   */
  async getComments(limit = 50) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(limit)
      
      if (error) {
        console.error('Error fetching comments:', error)
        throw error
      }
      
      return data || []
    } catch (error) {
      console.error('getComments error:', error)
      throw error
    }
  },
  
  /**
   * Add new comment
   * @param {Object} comment - { name, comment }
   * @returns {Promise<Object>} Created comment
   */
  async addComment(comment) {
    try {
      const sessionId = getSessionId()
      
      const { data, error } = await supabase
        .from('comments')
        .insert([{
          name: comment.name.trim(),
          comment: comment.comment.trim(),
          is_approved: true, // Auto-approve. Set false if moderation needed
          user_session_id: sessionId
        }])
        .select()
        .single()      
      if (error) {
        console.error('Error adding comment:', error)
        throw error
      }
      
      return data
    } catch (error) {
      console.error('addComment error:', error)
      throw error
    }
  },
  
  /**
   * Update comment (only by owner)
   * @param {string} id - Comment ID
   * @param {Object} comment - { comment: newText }
   * @returns {Promise<Object>} Updated comment
   */
  async updateComment(id, comment) {
    try {
      const sessionId = getSessionId()
      
      const { data, error } = await supabase
        .from('comments')
        .update({
          comment: comment.comment.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_session_id', sessionId) // Security: only owner can edit
        .select()
        .single()
      
      if (error) {
        console.error('Error updating comment:', error)
        throw error
      }
      
      return data
    } catch (error) {
      console.error('updateComment error:', error)
      throw error
    }
  },
  
  /**
   * Delete comment (only by owner)
   * @param {string} id - Comment ID
   * @returns {Promise<boolean>} Success status   */
  async deleteComment(id) {
    try {
      const sessionId = getSessionId()
      
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', id)
        .eq('user_session_id', sessionId) // Security: only owner can delete
      
      if (error) {
        console.error('Error deleting comment:', error)
        throw error
      }
      
      return true
    } catch (error) {
      console.error('deleteComment error:', error)
      throw error
    }
  },
  
  // ===== PHOTOS =====
  
  /**
   * Get all photos
   * @returns {Promise<Array>} Array of photos
   */
  async getPhotos() {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching photos:', error)
        throw error
      }
      
      return data || []
    } catch (error) {
      console.error('getPhotos error:', error)
      throw error
    }
  },
  
  /**
   * Add new photo   * @param {Object} photo - { title, description, image_url }
   * @returns {Promise<Object>} Created photo
   */
  async addPhoto(photo) {
    try {
      const { data, error } = await supabase
        .from('photos')
        .insert([{
          title: photo.title.trim(),
          description: photo.description?.trim() || '',
          image_url: photo.image_url.trim()
        }])
        .select()
        .single()
      
      if (error) {
        console.error('Error adding photo:', error)
        throw error
      }
      
      return data
    } catch (error) {
      console.error('addPhoto error:', error)
      throw error
    }
  },
  
  /**
   * Update photo
   * @param {string} id - Photo ID
   * @param {Object} photo - { title, description, image_url }
   * @returns {Promise<Object>} Updated photo
   */
  async updatePhoto(id, photo) {
    try {
      const { data, error } = await supabase
        .from('photos')
        .update({
          title: photo.title.trim(),
          description: photo.description?.trim() || '',
          image_url: photo.image_url.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        console.error('Error updating photo:', error)
        throw error      }
      
      return data
    } catch (error) {
      console.error('updatePhoto error:', error)
      throw error
    }
  },
  
  /**
   * Delete photo
   * @param {string} id - Photo ID
   * @returns {Promise<boolean>} Success status
   */
  async deletePhoto(id) {
    try {
      const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', id)
      
      if (error) {
        console.error('Error deleting photo:', error)
        throw error
      }
      
      return true
    } catch (error) {
      console.error('deletePhoto error:', error)
      throw error
    }
  },
  
  // ===== REGISTRATIONS =====
  
  /**
   * Add new registration
   * @param {Object} registration - Registration data
   * @returns {Promise<Object>} Created registration
   */
  async addRegistration(registration) {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .insert([{
          parent_name: registration.parent_name.trim(),
          student_name: registration.student_name.trim(),
          school_origin: registration.school_origin.trim(),
          nisn: registration.nisn.trim(),
          birth_date: registration.birth_date || null,          gender: registration.gender || null,
          phone: registration.phone?.trim() || null,
          address: registration.address?.trim() || null,
          status: 'pending'
        }])
        .select()
        .single()
      
      if (error) {
        console.error('Error adding registration:', error)
        throw error
      }
      
      return data
    } catch (error) {
      console.error('addRegistration error:', error)
      throw error
    }
  },
  
  /**
   * Get all registrations (admin only)
   * @returns {Promise<Array>} Array of registrations
   */
  async getRegistrations() {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching registrations:', error)
        throw error
      }
      
      return data || []
    } catch (error) {
      console.error('getRegistrations error:', error)
      throw error
    }
  },
  
  /**
   * Update registration status (admin only)
   * @param {string} id - Registration ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated registration
   */
  async updateRegistrationStatus(id, status) {    try {
      const { data, error } = await supabase
        .from('registrations')
        .update({
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        console.error('Error updating registration:', error)
        throw error
      }
      
      return data
    } catch (error) {
      console.error('updateRegistrationStatus error:', error)
      throw error
    }
  },
  
  // ===== STATS =====
  
  /**
   * Get comment statistics
   * @returns {Promise<Object>} Stats object
   */
  async getCommentStats() {
    try {
      const { data, error } = await supabase
        .from('comment_stats')
        .select('*')
        .single()
      
      if (error) {
        console.error('Error fetching comment stats:', error)
        throw error
      }
      
      return data
    } catch (error) {
      console.error('getCommentStats error:', error)
      throw error
    }
  },
  
  /**
   * Get registration statistics   * @returns {Promise<Object>} Stats object
   */
  async getRegistrationStats() {
    try {
      const { data, error } = await supabase
        .from('registration_stats')
        .select('*')
        .single()
      
      if (error) {
        console.error('Error fetching registration stats:', error)
        throw error
      }
      
      return data
    } catch (error) {
      console.error('getRegistrationStats error:', error)
      throw error
    }
  }
}

// ========== UTILITY FUNCTIONS ==========
export const utils = {
  /**
   * Escape HTML to prevent XSS attacks
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    if (!text) return ''
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  },
  
  /**
   * Format date to Indonesian locale
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date
   */
  formatDate(dateString) {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })  },
  
  /**
   * Format date to time ago (e.g., "5 menit yang lalu")
   * @param {string} dateString - ISO date string
   * @returns {string} Time ago string
   */
  timeAgo(dateString) {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now - date) / 1000)
    
    if (seconds < 60) return 'Baru saja'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} menit yang lalu`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} jam yang lalu`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days} hari yang lalu`
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    })
  },
  
  /**
   * Generate avatar initials from name
   * @param {string} name - Full name
   * @returns {string} Initials
   */
  getInitials(name) {
    if (!name) return '?'
    const parts = name.trim().split(' ')
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  },
  
  /**
   * Validate form data
   * @param {Object} formData - Form data object
   * @param {Array} requiredFields - Array of required field names
   * @returns {Array} Array of error messages
   */
  validateForm(formData, requiredFields) {
    const errors = []
    for (const field of requiredFields) {
      if (!formData[field]?.trim()) {
        errors.push(`Field "${field.replace('_', ' ')}" wajib diisi`)      }
    }
    return errors
  },
  
  /**
   * Show loading state on button
   * @param {HTMLElement} button - Button element
   * @param {boolean} show - Show or hide loading
   */
  showLoading(button, show = true) {
    if (show) {
      button.dataset.originalContent = button.innerHTML
      button.disabled = true
      button.classList.add('loading')
    } else {
      button.innerHTML = button.dataset.originalContent || button.innerHTML
      button.disabled = false
      button.classList.remove('loading')
    }
  },
  
  /**
   * Show toast notification
   * @param {string} message - Message to display
   * @param {string} type - 'success' | 'error' | 'info'
   * @param {number} duration - Duration in milliseconds
   */
  showToast(message, type = 'success', duration = 4000) {
    // Check if toast container exists
    let container = document.getElementById('toastContainer')
    if (!container) {
      container = document.createElement('div')
      container.id = 'toastContainer'
      container.className = 'toast-container'
      document.body.appendChild(container)
    }
    
    const toast = document.createElement('div')
    toast.className = `toast toast-${type}`
    toast.innerHTML = `
      <span class="toast-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
      <span class="toast-message">${this.escapeHtml(message)}</span>
    `
    
    container.appendChild(toast)
    
    // Trigger animation
    requestAnimationFrame(() => toast.classList.add('show'))
        // Auto remove
    setTimeout(() => {
      toast.classList.remove('show')
      setTimeout(() => toast.remove(), 400)
    }, duration)
  },
  
  /**
   * Format phone number to WhatsApp format
   * @param {string} phone - Phone number
   * @returns {string} Formatted phone number
   */
  formatPhoneForWhatsApp(phone) {
    if (!phone) return ''
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '')
    // Replace leading 0 with 62
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.slice(1)
    }
    // Ensure it starts with 62
    if (!cleaned.startsWith('62')) {
      cleaned = '62' + cleaned
    }
    return cleaned
  },
  
  /**
   * Create WhatsApp message URL
   * @param {string} phone - Phone number
   * @param {string} message - Message text
   * @returns {string} WhatsApp URL
   */
  createWhatsAppUrl(phone, message) {
    const formattedPhone = this.formatPhoneForWhatsApp(phone)
    const encodedMessage = encodeURIComponent(message)
    return `https://wa.me/${formattedPhone}?text=${encodedMessage}`
  },
  
  /**
   * Download data as JSON file
   * @param {Object} data - Data to download
   * @param {string} filename - Filename
   */
  downloadJSON(data, filename = 'data.json') {
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  },
  
  /**
   * Copy text to clipboard
   * @param {string} text - Text to copy
   * @returns {Promise<boolean>} Success status
   */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (error) {
      console.error('Copy error:', error)
      return false
    }
  }
}

// ========== CONNECTION TEST ==========
/**
 * Test Supabase connection
 * @returns {Promise<boolean>} Connection status
 */
export async function testConnection() {
  try {
    const { data, error } = await supabase.from('comments').select('count', { count: 'exact', head: true })
    
    if (error) {
      console.error('❌ Connection test failed:', error)
      return false
    }
    
    console.log('✅ Supabase connection successful!')
    return true
  } catch (error) {
    console.error('❌ Connection test error:', error)
    return false
  }
}

// ========== AUTO-INJECT TOAST STYLES ==========
/**
 * Inject toast styles if not already present
 */function injectToastStyles() {
  if (document.getElementById('global-toast-styles')) return
  
  const style = document.createElement('style')
  style.id = 'global-toast-styles'
  style.textContent = `
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .toast {
      background: white;
      padding: 16px 20px;
      border-radius: 16px;
      box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
      border-left: 5px solid #2563eb;
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 300px;
      transform: translateX(120%);
      transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55);
      font-family: 'Inter', sans-serif;
    }
    .toast.show {
      transform: translateX(0);
    }
    .toast-success {
      border-left-color: #22c55e;
    }
    .toast-error {
      border-left-color: #ef4444;
    }
    .toast-info {
      border-left-color: #3b82f6;
    }
    .toast-icon {
      font-size: 1.2rem;
    }
    .toast-message {
      font-size: 0.95rem;
      font-weight: 500;
      color: #1e293b;
    }
    @media (max-width: 768px) {      .toast-container {
        top: auto;
        bottom: 20px;
        right: 20px;
        left: 20px;
      }
      .toast {
        min-width: auto;
        width: 100%;
      }
    }
  `
  document.head.appendChild(style)
}

// Initialize on load
if (typeof document !== 'undefined') {
  injectToastStyles()
  
  // Test connection on page load (optional, can be removed for production)
  // testConnection()
}

// ========== EXPORT EVERYTHING ==========
export default {
  supabase,
  db,
  utils,
  getSessionId,
  testConnection
}

/**
 * ============================================================
 * CARA PENGGUNAAN DI FILE HTML
 * ============================================================
 * 
 * 1. Import di HTML:
 *    <script type="module">
 *      import { db, utils, supabase } from './config.js'
 *      
 *      // Gunakan fungsi
 *      const comments = await db.getComments()
 *      utils.showToast('Berhasil!', 'success')
 *    </script>
 * 
 * 2. Contoh lengkap ada di:
 *    - home.html
 *    - daftar.html
 *    - komentar.html *    - album.html
 *    - admin.html
 * 
 * ============================================================
 */

console.log('✅ config.js loaded successfully')
console.log('📦 Available exports: db, utils, supabase, getSessionId, testConnection')
