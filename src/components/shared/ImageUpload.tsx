import { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}

const ImageUpload = ({ value, onChange, label = 'Upload Image' }: Props) => {
  const ref = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(value || null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // In production this would upload to your Cloudinary endpoint
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreview(result);
      onChange(result); // Replace with actual Cloudinary URL from your API
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {preview ? (
        <div className="relative rounded-lg overflow-hidden border border-border">
          <img src={preview} alt="Upload" className="w-full h-48 object-cover" />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-7 w-7"
            onClick={() => { setPreview(null); onChange(''); }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className={cn(
            'w-full h-32 border-2 border-dashed border-border rounded-lg',
            'flex flex-col items-center justify-center gap-2',
            'text-muted-foreground hover:border-primary hover:text-primary transition-colors'
          )}
        >
          <Upload className="h-6 w-6" />
          <span className="text-sm">{label}</span>
        </button>
      )}
    </div>
  );
};

export default ImageUpload;
