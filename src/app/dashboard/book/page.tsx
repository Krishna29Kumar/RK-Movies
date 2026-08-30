import { Suspense } from "react";
import BookPageContent from "./BookPageContent";

export default function BookPage() {
  return (
    <Suspense fallback={null}>
      <BookPageContent />
    </Suspense>
  );
}
