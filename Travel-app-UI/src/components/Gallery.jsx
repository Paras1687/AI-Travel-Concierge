export default function Gallery({ images }) {
  if (!images || images.length === 0) return null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      {images.map((src, i) => (
        <div key={i} className="aspect-square rounded-xl overflow-hidden group border border-sand-200">
          <img
            src={src}
            alt={`Trip highlight ${i + 1}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  )
}
