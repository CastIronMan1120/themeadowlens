import React from 'react';
import { VenueGridManager } from './VenueGridManager';

export function BulkCategorizer() {
  return <VenueGridManager initialMode="warehouse" />;
}
export function AllPhotosGrid() {
  return <VenueGridManager initialMode="all" />;
}
export function VenuePhotoGridPane(props) {
  const docId = props?.documentId || props?.document?.displayed?._id || '';
  return <VenueGridManager documentId={docId} initialMode="venue" />;
}
