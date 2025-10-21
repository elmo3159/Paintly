$VERCEL_TOKEN = "JQmd56rPfQAMp7Wu05Wyrnqt"
$PROJECT_ID = "prj_XhTQeKrQRGfE6W3qiQdOmcdxJxEH"
$TEAM_ID = "team_F7tXYzW3zZ9XLLwWAHjlqEVq"
$ENV_KEY = "STRIPE_WEBHOOK_SECRET"
$ENV_VALUE = "whsec_dPz9BbOirfT7uUegYNlpXQfyYGuSmHd9"

Write-Host "🔧 Vercel環境変数を追加中..." -ForegroundColor Cyan
Write-Host "   Project ID: $PROJECT_ID"
Write-Host "   Team ID: $TEAM_ID"
Write-Host "   Key: $ENV_KEY`n"

$headers = @{
    "Authorization" = "Bearer $VERCEL_TOKEN"
    "Content-Type" = "application/json"
}

$body = @{
    key = $ENV_KEY
    value = $ENV_VALUE
    type = "encrypted"
    target = @("production", "preview", "development")
} | ConvertTo-Json

$uri = "https://api.vercel.com/v10/projects/$PROJECT_ID/env?teamId=$TEAM_ID"

try {
    $response = Invoke-RestMethod -Uri $uri -Method Post -Headers $headers -Body $body

    Write-Host "`n✅ Vercel環境変数の追加に成功しました！" -ForegroundColor Green
    Write-Host "`n📋 追加された環境変数:"
    Write-Host "  Key: $ENV_KEY"
    Write-Host "  Value: $($ENV_VALUE.Substring(0, 20))..."
    Write-Host "  Target: production, preview, development"
    Write-Host "`n📝 次のステップ:"
    Write-Host "  1. Vercel が自動的に再デプロイを開始します"
    Write-Host "  2. デプロイ完了後、Stripe Webhook が正常に動作します 🚀"

} catch {
    Write-Host "`n❌ エラーが発生しました:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    Write-Host "`nResponse:" $_.ErrorDetails.Message
    exit 1
}
