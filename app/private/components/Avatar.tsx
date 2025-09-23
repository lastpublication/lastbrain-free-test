import { addToast, Image, Spinner } from "@heroui/react";
import { ImageOff, RefreshCcw } from "lucide-react";
import React, { useState } from "react";
import axios from "axios";

export const Avatar = ({
  src,
  upload,
  format = ["image/png", "image/jpeg", "image/jpg"],
}: {
  src?: string | null;
  upload: (url: string) => void;
  format?: string[];
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(src || null);
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (format.length && (!file || !format.includes(file.type))) {
      setIsUploading(false);
      addToast({
        title: "Erreur",
        description: `Le format de fichier n'est pas valide. Formats acceptés : ${format.join(
          ", "
        )}`,
        color: "danger",
        timeout: 3000,
        shouldShowTimeoutProgress: true,
      });

      return;
    }

    if (!file) return;

    setIsUploading(true);

    const formData = new FormData();

    formData.append("file", file);

    axios
      .post("/api/upload", formData)
      .then((response) => {
        setImageUrl(response.data.data.avatar);
        upload(response.data.data.avatar);
      })
      .catch((error) => {
        console.error("Upload error:", error);
        addToast({
          title: "Erreur",
          description: "Échec de l'upload du fichier.",
          color: "danger",
          timeout: 3000,
          shouldShowTimeoutProgress: true,
        });
      })
      .finally(() => {
        setIsUploading(false);
      });
  };

  return (
    <>
      <div className="flex items-center justify-center mb-8 group relative">
        {isUploading ? (
          <div className="h-[128px] w-[128px] mx-auto  inset-0 bg-black/10 rounded-full flex items-center justify-center z-20">
            <Spinner aria-label="Loading" className="text-white" size="lg" />
          </div>
        ) : (
          <>
            {imageUrl ? (
              <Image
                alt="Avatar"
                radius="full"
                className="w-[128px] h-[128px] border rounded-full object-cover"
                src={`${imageUrl}?t=${Date.now()}`} // Cache busting
              />
            ) : (
              <div className="w-[128px] h-[128px] border rounded-full bg-foreground flex items-center justify-center">
                <span className="text-gray-500">
                  <ImageOff size={32} />
                </span>
              </div>
            )}
          </>
        )}

        <label className="absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white  bg-black/90 border p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
          <input
            accept="image/*"
            className="hidden"
            type="file"
            onChange={handleUpload}
          />
          <RefreshCcw className="" size={24} />
        </label>
      </div>
    </>
  );
};
