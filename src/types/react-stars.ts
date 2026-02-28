declare module "react-stars" {
  import * as React from "react";

  interface ReactStarsProps {
    count?: number;
    size?: number;
    color1?: string;
    color2?: string;
    value?: number;
    edit?: boolean;
    half?: boolean;
    onChange?: (newRating: number) => void;
  }

  const ReactStars: React.FC<ReactStarsProps>;
  export default ReactStars;
}