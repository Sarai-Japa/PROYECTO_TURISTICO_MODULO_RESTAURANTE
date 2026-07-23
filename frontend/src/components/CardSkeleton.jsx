// Indicador visual de carga — replica la forma de RestaurantCard
export default function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md dark:shadow-gray-900/50 animate-pulse">
      <div className="h-48 bg-gray-200 dark:bg-gray-700" />
      <div className="p-4">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-1/3" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-1/2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
      </div>
      <div className="px-4 pb-4">
        <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );
}
