import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../../firebase";
import { useEffect, useState } from "react";
import GalleryItem from "../components/gallery/galleryItem";
import { AnimatePresence, motion } from "motion/react";
import dayjs from "dayjs";
import { PlusIcon } from "@phosphor-icons/react";

interface GalleryImageType {
  frame_id: number;
  concept_id: number;
  id: string;
  image_url: string;
  created_at: string;
}

const INIT_URLS = [
  "",
  "/initimages/glasses(1).png",
  "/initimages/glasses(2).png",
  "/initimages/glasses(3).png",
  "/initimages/glasses(4).png",
  "/initimages/glasses(5).png",
  "/initimages/glasses(6).png",
  "/initimages/glasses(7).png",
  "/initimages/glasses(8).png",
  "/initimages/glasses(9).png",
  "/initimages/glasses(10).png",
  "/initimages/glasses(12).png",
  "/initimages/glasses(11).png",
];

const CONCEPT_URLS = [
  "",
  "/conceptimages/1.jpeg",
  "",
  "",
  "/conceptimages/kirby.jpeg",
  "/conceptimages/5.jpg",
  "/conceptimages/6.jpeg",
  "/conceptimages/7.jpg",
  "/conceptimages/8.jpg",
  "/conceptimages/9.png",
  "/conceptimages/10.jpg",
  "/conceptimages/11.jpg",
  "/conceptimages/12.png",
  "/conceptimages/13.jpg",
];

export default function GalleryPage() {
  const [galleryImages, setGalleryImages] = useState<GalleryImageType[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GalleryImageType | null>(
    null
  );

  useEffect(() => {
    const fetchGalleryImages = async () => {
      const q = query(collection(db, "gallery"));
      const querySnapshot = await getDocs(q);
      const imageData = querySnapshot.docs.map((doc) => doc.data());
      setGalleryImages(imageData as GalleryImageType[]);
    };

    fetchGalleryImages();
  }, []);

  function handleEmptyClick(e: React.MouseEvent<HTMLDivElement>) {
    e.stopPropagation();
    setModalOpen(false);
    setSelectedImage(null);
  }
  console.log(selectedImage?.concept_id);

  return (
    <div className="absolute top-0 left-0 w-full pt-[6rem] px-[7rem]">
      <div className="w-full h-[5rem] grid grid-cols-8">
        {/* <span className="label_17r col-start-2 flex items-end pb-2">
          GALLERY
        </span> */}
        <span className="label_17r col-start-8 flex items-end pb-2">
          GALLERY
        </span>
      </div>
      <div className="w-full grid grid-cols-8 border-t-1 border-text-black">
        {galleryImages.map((image, index) => (
          <GalleryItem
            setSelectedImage={setSelectedImage}
            setModalOpen={setModalOpen}
            key={index}
            image={image}
            index={index}
          />
        ))}
      </div>
      <AnimatePresence>
        {modalOpen && (
          <div
            onClick={(e: React.MouseEvent<HTMLDivElement>) =>
              handleEmptyClick(e)
            }
            className="fixed inset-0 w-screen h-screen bg-black/80 flex justify-center items-center z-50"
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1, transition: { duration: 0.4 } }}
              exit={{ y: -20, opacity: 0, transition: { duration: 0.4 } }}
              className="[background:var(--gradient-modal)] w-[50%] h-[50%] bg--bg rounded-md flex flex-col justify-center items-center gap-5 p-5 relative"
            >
              {selectedImage && (
                <div className="grid grid-cols-2 items-center gap-5">
                  <img
                    className="w-full border-1 border-border-gray"
                    src={selectedImage.image_url}
                    alt=""
                  />
                  <div className="bg-white/0 backdrop-blur-xl font-inria-sans flex flex-col gap-10 justify-center items-start p-3 w-full h-full">
                    <span className="flex items-center gap-10 justify-center">
                      <p className="text-gray-400 text-[0.8vw] tracking-tighter">
                        | CREATED TIME
                      </p>
                      <p className="tracking-tighter text-gray-200 text-[0.8vw]">
                        {dayjs(selectedImage.created_at).format(
                          "MM월 DD일 HH:mm:ss"
                        )}
                      </p>
                    </span>
                    <span>
                      <p className="text-gray-400 text-[0.8vw] tracking-tighter mb-5">
                        | PARENTS
                      </p>
                      <span className="flex gap-5 items-center">
                        <p>
                          {selectedImage.frame_id ? (
                            <img
                              className="w-[10vw] h-[10vw] bg-white"
                              alt=""
                              src={CONCEPT_URLS[selectedImage.concept_id]}
                            />
                          ) : (
                            <div className="w-[10vw] h-[10vw] skeleton"></div>
                          )}
                        </p>
                        <span>
                          <PlusIcon color="white" size={30} weight="thin" />
                        </span>
                        <p>
                          {selectedImage.frame_id ? (
                            <img
                              className="w-[10vw] h-[10vw] bg-white"
                              alt=""
                              src={INIT_URLS[selectedImage.frame_id]}
                            />
                          ) : (
                            <div className="w-[10vw] h-[10vw] skeleton"></div>
                          )}
                        </p>
                      </span>
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
