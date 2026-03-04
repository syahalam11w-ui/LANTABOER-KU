// config.js - Supabase Configuration
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// ⚠️ Untuk produksi, gunakan environment variables!
const SUPABASE_URL = 'https://jcimzcyogwxetzhbkhab.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_9gHJhn7VJcL6ZQAGdDHzkg_99jqkYLk'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Helper functions
export const db = {
  // Photos
  async getPhotos() {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },
  
  async addPhoto(photo) {
    const { data, error } = await supabase
      .from('photos')
      .insert([{
        title: photo.title,
        description: photo.description,
        image_url: photo.image_url
      }])
      .select()
    if (error) throw error
    return data[0]
  },
  
  async updatePhoto(id, photo) {
    const { data, error } = await supabase
      .from('photos')
      .update({
        title: photo.title,
        description: photo.description,
        image_url: photo.image_url,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  },
  
  async deletePhoto(id) {
    const { error } = await supabase.from('photos').delete().eq('id', id)
    if (error) throw error
    return true
  },
  
  // Comments
  async getComments() {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },
  
  async addComment(comment) {
    const { data, error } = await supabase
      .from('comments')
      .insert([{
        name: comment.name,
        comment: comment.comment
      }])
      .select()
    if (error) throw error
    return data[0]
  },
  
  // Admin auth (simple password check)
  async verifyAdmin(password) {
    const { data, error } = await supabase
      .from('admins')
      .select('password_hash')
      .eq('username', 'admin')
      .single()
    if (error) throw error
    return data?.password_hash === password
  }
}
