import { Star, Quote } from 'lucide-react'

export interface Review {
  id: string
  author: string
  company: string
  rating: number
  comment: string
  date: string
}

interface ReviewsProps {
  reviews: Review[]
}

export function Reviews({ reviews }: ReviewsProps) {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-orange-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            お客様の声
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Paintlyを導入した塗装業者様から高い評価をいただいています
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-shadow relative"
            >
              {/* クオート アイコン */}
              <div className="absolute top-4 right-4 text-orange-200">
                <Quote className="h-12 w-12" />
              </div>

              {/* 評価（星） */}
              <div className="flex items-center mb-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={`h-5 w-5 ${
                      index < review.rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>

              {/* コメント */}
              <p className="text-gray-700 leading-relaxed mb-6 relative z-10">
                {review.comment}
              </p>

              {/* 著者情報 */}
              <div className="border-t border-gray-200 pt-4">
                <p className="font-semibold text-gray-900">{review.author}</p>
                <p className="text-sm text-gray-600">{review.company}</p>
                <p className="text-xs text-gray-400 mt-1">{review.date}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 総合評価 */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-6 py-3 shadow-lg">
            <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
            <span className="text-2xl font-bold text-gray-900">4.9</span>
            <span className="text-gray-600">/</span>
            <span className="text-gray-600">5.0</span>
            <span className="text-sm text-gray-500 ml-2">
              （{reviews.length}件のレビュー）
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
