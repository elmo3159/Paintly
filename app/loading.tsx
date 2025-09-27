import { Palette, Paintbrush, Droplet } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-primary/10">
      <div className="text-center space-y-6">
        <div className="flex justify-center mb-4">
          <img 
            src="/logo.png" 
            alt="Paintly" 
            className="h-32 w-auto object-contain animate-pulse"
          />
        </div>
        
        <div className="space-y-4">
          <p className="text-lg text-muted-foreground font-medium animate-pulse">
            読み込み中...
          </p>
          
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}