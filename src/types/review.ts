import React, { useState } from "react";

export interface Review {
  id: string;
  user: string;
  rating: number; 
  comment: string;
  timestamp?: string; 
  likes?: number;
}

