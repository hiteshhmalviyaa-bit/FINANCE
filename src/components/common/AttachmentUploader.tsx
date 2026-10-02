import React, { useState } from 'react';
import { Paperclip, FileText, Trash2, Eye, Download } from 'lucide-react';

interface AttachmentUploaderProps {
  value?: string;
  onChange: (fileName?: string) => void;
  readOnly?: boolean;
}

export const AttachmentUploader: React.FC<AttachmentUploaderProps> = ({
  value,
  onChange,
  readOnly = false,
}) => {
  const [isHovering, setIsHovering] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In web app, store file name and format
      onChange(`${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
  };

  if (value) {
    return (
      <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-slate-50/80 text-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="truncate">
            <span className="font-medium text-slate-800 text-xs block truncate">{value}</span>
            <span className="text-[11px] text-slate-500">Verified document</span>
          </div>
        </div>
        {!readOnly && (
          <button
            type="button"
            onClick={handleRemove}
            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
            title="Remove attachment"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  if (readOnly) {
    return (
      <div className="text-xs text-slate-400 italic py-1">
        No attachment uploaded
      </div>
    );
  }

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setIsHovering(true);
      }}
      onDragLeave={() => setIsHovering(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsHovering(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
          onChange(`${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
        }
      }}
      className={`border border-dashed rounded-lg p-3 flex items-center justify-center gap-2 cursor-pointer transition-colors ${
        isHovering
          ? 'border-indigo-500 bg-indigo-50/40 text-indigo-700'
          : 'border-slate-300 hover:border-slate-400 text-slate-600 bg-slate-50/50'
      }`}
    >
      <Paperclip className="w-4 h-4 text-slate-400" />
      <span className="text-xs font-medium">Attach Receipt, Bill or PDF</span>
      <input
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls"
        className="hidden"
        onChange={handleFileChange}
      />
    </label>
  );
};
