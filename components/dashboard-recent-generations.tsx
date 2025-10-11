import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock } from 'lucide-react'

export async function RecentGenerations() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: recentGenerations } = await supabase
    .from('generations')
    .select('id, created_at')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <Card className="paint-card paint-card-gradient-pink">
      <CardHeader>
        <CardTitle className="paint-text text-lg sm:text-xl md:text-2xl min-w-0 break-words">
          最近の生成
        </CardTitle>
        <CardDescription className="break-words">
          最近生成したシミュレーション
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!recentGenerations || recentGenerations.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            まだ生成履歴がありません
          </p>
        ) : (
          <div className="space-y-2">
            {recentGenerations.map((generation) => (
              <div key={generation.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/50 backdrop-blur-sm">
                <Clock className="h-4 w-4 text-pink-600 flex-shrink-0" />
                <span className="text-sm font-medium break-words">
                  {new Date(generation.created_at).toLocaleDateString('ja-JP')}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}