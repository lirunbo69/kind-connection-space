import { useState, useRef, useCallback } from "react";
import { Upload, X, ImageIcon } from "lucide-react";

interface ImageUploadZoneProps {
  label: string;
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
}

const ImageUploadZone = ({ label, images: imagesProp, onChange, maxImages = 10, maxSizeMB = 5 }: ImageUploadZoneProps) => {
  const images = imagesProp || [];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const processFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(f => f.type.startsWith("image/") && f.size <= maxSizeMB * 1024 * 1024);
    const remaining = maxImages - images.length;
    const toProcess = fileArray.slice(0, remaining);

    toProcess.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onChange([...images, result]);
      };
      reader.readAsDataURL(file);
    });
  }, [images, onChange, maxImages, maxSizeMB]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const imageFiles: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const file = items[i].getAsFile();
        if (file) imageFiles.push(file);
      }
    }
    if (imageFiles.length > 0) {
      e.preventDefault();
      processFiles(imageFiles);
    }
  }, [processFiles]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div
      onPaste={handlePaste}
      tabIndex={0}
      className="outline-none"
    >
      <label className="block text-sm font-medium mb-1.5">
        <span className="flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-primary" />
          {label}
          <span className="text-xs text-muted-foreground ml-1">({images.length}/{maxImages})</span>
        </span>
      </label>

      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mb-2">
          {images.map((img, i) => (
            <div key={i} className="relative group">
              <img src={img} alt={`${label} ${i + 1}`} className="w-full aspect-square object-cover rounded-lg border" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length < maxImages && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center gap-1.5 text-muted-foreground cursor-pointer transition-colors ${
            dragOver ? "border-primary bg-primary/5" : "hover:border-primary/40"
          }`}
        >
          <Upload className="w-5 h-5" />
          <span className="text-xs text-center">点击、拖拽或粘贴上传（最大 {maxSizeMB}MB）</span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) processFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
};

export default ImageUploadZone;
