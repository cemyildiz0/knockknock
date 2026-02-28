"use client";
import ReactStars from "react-stars";


interface Props {
  rating: number;
  editable?: boolean;
  onChange?: (value: number) => void;
}

export default function StarRating({
  rating,
  editable = false,
  onChange,
}: Props) {
  return (
    <ReactStars
      count={5}
      size={20}
      value={rating}
      edit={editable}
      color2="#FFB563"
      onChange={onChange}
    />
  );
}