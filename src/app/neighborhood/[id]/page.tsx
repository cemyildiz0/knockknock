import { mockNeighborhoods } from "@/data/mockNeighborhoods";
import StarRating from "@/components/StarRating";

interface Props {
  params: { id: string };
}

export default function NeighborhoodPage({ params }: Props) {
  const neighborhood = mockNeighborhoods.find(
    (n) => n.id === params.id
  );

  if (!neighborhood) {
    return <div>Neighborhood not found</div>;
  }

  const average =
    neighborhood.reviews.reduce((acc, r) => acc + r.rating, 0) /
    neighborhood.reviews.length;

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <h1 className="text-3xl font-bold">
        {neighborhood.name}
      </h1>

      <p className="text-neutral-400 mt-1">
        {neighborhood.city}
      </p>

      <div className="flex items-center gap-3 mt-3">
        <StarRating rating={average} />
        <span className="text-neutral-400">
          {neighborhood.reviews.length} reviews
        </span>
      </div>

      <p className="mt-6 text-neutral-300">
        {neighborhood.description}
      </p>

      <div className="mt-10 space-y-6">
        {neighborhood.reviews.map((review) => (
          <div
            key={review.id}
            className="bg-neutral-800 p-4 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <strong>{review.user}</strong>
              <StarRating rating={review.rating} />
            </div>
            <p className="mt-2 text-neutral-300">
              {review.comment}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}