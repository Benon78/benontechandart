import { useState, useRef, useCallback } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';

const DragDropUpload = ({
  onUpload,
  isUploading,
  multiple = true,
  accept = 'image/*',
  uploadedUrls = [],
  onRemoveUrl
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files).filter(file =>
        file.type.startsWith('image/')
      );
      if (files.length > 0) {
        onUpload(multiple ? files : [files[0]]);
      }
    },
    [onUpload, multiple]
  );

  const handleFileChange = (e) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      onUpload(files);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
          ${isDragging
            ? 'border-primary bg-primary/10'
            : 'border-primary/30 hover:border-primary/60 hover:bg-card/50'}
          ${isUploading ? 'pointer-events-none opacity-60' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={40} className="animate-spin text-primary" />
            <p className="text-muted-foreground">Uploading images...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 rounded-full bg-primary/10">
              <Upload size={32} className="text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                {isDragging ? 'Drop images here' : 'Drag & drop images here'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to browse {multiple && '(multiple files supported)'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Preview uploaded images */}
      {uploadedUrls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {uploadedUrls.map((url, index) => (
            <div key={index} className="relative group aspect-square">
              <img
                src={url}
                alt={`Uploaded ${index + 1}`}
                className="w-full h-full object-cover rounded-lg border border-primary/20"
              />
              {onRemoveUrl && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveUrl(url);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DragDropUpload;
