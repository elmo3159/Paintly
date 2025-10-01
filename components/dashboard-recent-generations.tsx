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
    <Card className="paint-card">
      <CardHeader>
        <CardTitle className="paint-text text-lg sm:text-xl md:text-2xl whitespace-nowrap min-w-0">
          最近の生成
        </CardTitle>
        <CardDescription>
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
              <div key={generation.id} className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-accent" />
                <span className="text-sm">
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