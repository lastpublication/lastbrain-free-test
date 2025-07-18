import { addToast, Button, Image } from "@heroui/react";
import { ArrowUpCircle, ImageOff, RefreshCcw } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

export const Avatar = ({
  src,
  upload,
  format = ["image/png", "image/jpeg", "image/jpg"],
}: {
  src: string;
  upload: (url: string) => void;
  format?: string[];
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();
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

    if (!file || !user?.id) return;

    setIsUploading(true);
    let cleanName = file.name.replace(/\s+/g, "_");

    // Utilise l'id utilisateur comme nom de fichier, conserve l'extension d'origine
    const ext = file.name.split(".").pop();

    cleanName = ext ? `${user.id}.${ext}` : user.id;

    const filePath = `avatars/customers/${cleanName}`;

    const formData = new FormData();
    formData.append("file", file, cleanName);
    formData.append("path", filePath);
    formData.append("userId", user.id);
    formData.append("type", "customer");
    formData.append("format", format.join(","));
    try {
      const response = await axios.put("/api/upload", formData);

      if (response.data.url) {
        upload(response.data.url);
        addToast({
          title: "Succès",
          description: "Avatar mis à jour avec succès.",
          color: "success",
          timeout: 3000,
          shouldShowTimeoutProgress: true,
        });
      } else {
        throw new Error("URL de l'avatar non reçue");
      }
    } catch (error) {
      console.error("Erreur lors de l'upload de l'avatar:", error);
      addToast({
        title: "Erreur",
        description: "Échec de la mise à jour de l'avatar.",
        color: "danger",
        timeout: 3000,
        shouldShowTimeoutProgress: true,
      });
    } finally {
      setIsUploading(false);
    }
  };
  return (
    <div className="flex items-center justify-center mb-8 group relative">
      {src ? (
        <Image
          src={src}
          alt="Avatar"
          className="w-16 h-16 border rounded-full"
        />
      ) : (
        <div className="w-24 h-24 border rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500">
            <ImageOff size={32} />
          </span>
        </div>
      )}
      <label className="absolute z-10 top-1/2 bg-black/90 background left-1/2 border p-2 rounded-full cursor-pointer  opacity-0 group-hover:opacity-100 transition-opacity">
        <input
          accept="image/*"
          className="hidden"
          type="file"
          onChange={handleUpload}
        />
        <RefreshCcw size={24} className="" />
      </label>
    </div>
  );
};
