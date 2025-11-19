import { PORTFOLIO_CATEGORIES } from '../../types/database'

interface CategoryFilterProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
  className?: string
}

export function CategoryFilter({ 
  selectedCategory, 
  onCategoryChange, 
  className = "" 
}: CategoryFilterProps) {
  const categories = [
    { value: '', label: '全部分类' },
    ...PORTFOLIO_CATEGORIES
  ]

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {categories.map((category) => (
        <button
          key={category.value}
          onClick={() => onCategoryChange(category.value)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === category.value
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {category.label}
        </button>
      ))}
    </div>
  )
}