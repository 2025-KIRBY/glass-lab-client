import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../../firebase";
import { useEffect, useState } from "react";
import GalleryItem from "../components/gallery/galleryItem";

interface GalleryImageType {
  frame_id: number;
  id: string;
  image_url: string;
}

export default function GalleryPage() {
  const [galleryImages, setGalleryImages] = useState<GalleryImageType[]>([]);

  useEffect(() => {
    const fetchGalleryImages = async () => {
      const q = query(collection(db, "gallery"));
      const querySnapshot = await getDocs(q);
      const imageData = querySnapshot.docs.map((doc) => doc.data());
      setGalleryImages(imageData as GalleryImageType[]);
    };

    fetchGalleryImages();
  }, []);

  return (
    <div className="absolute top-0 left-0 w-full pt-[6rem] px-[7rem]">
      <div className="w-full h-[5rem] grid grid-cols-8">
        <span className="label_17r col-start-2 flex items-end pb-2">
          GALLERY
        </span>
        <span className="label_17r col-start-8 flex items-end pb-2">
          GALLERY
        </span>
      </div>
      <div className="w-full grid grid-cols-8 border-t-1 border-text-black">
        {galleryImages.map((image, index) => (
          <GalleryItem key={index} image={image} index={index} />
        ))}
      </div>
    </div>
  );
}
