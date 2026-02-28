import { mockNeighborhoods } from "@/data/mockNeighborhoods";
import StarRating from "@/components/StarRating";
import LikeButton from "@/components/LikeButton";


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
    <main className="min-h-screen bg-100 text-black p-6">
      <h1 className="text-5xl font-bold">
        {neighborhood.name}
      </h1>

      <p className="text-neutral-800 mt-1">
        {neighborhood.city}
      </p>

      <div className="flex items-center gap-3 mt-3">
        <StarRating rating={average} />
        <span className="text-neutral-600">
          {neighborhood.reviews.length} reviews
        </span>
      </div>

        <h1 className="heading-small">Livability Scores</h1>
      <p className="mt-6 bg-white text-neutral-600">
        {neighborhood.description}
      </p>

      <div className="w-1/2 space-y-6">
        <h1 className="heading-small">Community Reviews</h1>
        {neighborhood.reviews.map((review) => (
          <div
            key={review.id}
            className="bg-white p-4 rounded-lg "
          >
            <div className="flex items-center gap-2">
              <strong>{review.user}</strong>
              <StarRating rating={review.rating} />
            </div>
            <p className="mt-2 text-neutral-600">
              {review.comment}
            </p>
            <div className="flex items-center gap-2">
                <p className="mt-2 text-neutral-600">
                {review.timestamp}
                </p>
                <p className="mt-2 text-neutral-600">
                    <LikeButton initialCount={10} />
                {review.likes}
                </p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}