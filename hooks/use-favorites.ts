/**
 * お気に入り機能のカスタムフック
 */

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useFavorites(generationIds: string[]) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // お気に入り状態を読み込み
  useEffect(() => {
    if (generationIds.length === 0) {
      setLoading(false)
      return
    }

    loadFavorites()
  }, [generationIds.join(',')])

  const loadFavorites = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        console.error('Auth error in loadFavorites:', authError)
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('favorites')
        .select('generation_id')
        .eq('user_id', user.id)
        .in('generation_id', generationIds)

      if (error) {
        console.error('Error loading favorites:', error)
        setLoading(false)
        return
      }

      const favoriteSet = new Set(data?.map(f => f.generation_id) || [])
      setFavorites(favoriteSet)
      setLoading(false)
    } catch (error) {
      console.error('Unexpected error in loadFavorites:', error)
      setLoading(false)
    }
  }

  const toggleFavorite = async (generationId: string) => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        console.error('Auth error in toggleFavorite:', authError)
        return false
      }

      const isFavorite = favorites.has(generationId)

      if (isFavorite) {
        // お気に入りから削除
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('generation_id', generationId)

        if (error) {
          console.error('Error removing favorite:', error)
          return false
        }

        setFavorites(prev => {
          const newSet = new Set(prev)
          newSet.delete(generationId)
          return newSet
        })
      } else {
        // お気に入りに追加
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            generation_id: generationId
          })

        if (error) {
          console.error('Error adding favorite:', error)
          return false
        }

        setFavorites(prev => new Set([...prev, generationId]))
      }

      return true
    } catch (error) {
      console.error('Unexpected error in toggleFavorite:', error)
      return false
    }
  }

  const isFavorite = (generationId: string) => {
    return favorites.has(generationId)
  }

  return {
    favorites,
    loading,
    toggleFavorite,
    isFavorite
  }
}
