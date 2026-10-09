import React, { useState } from 'react';
import { useCommerce } from '../../context/CommerceContext';
import { X, Upload, FileText, Download, CheckCircle2, AlertCircle, Sparkles, ArrowRight, Eye, Check } from 'lucide-react';
import { parseProductCSV, SAMPLE_PRODUCT_CSV_TEXT, triggerCsvDownload, ParsedCsvResult } from '../../utils/csvExport';
import { Product } from '../../types';

interface ProductCsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProductCsvImportModal: React.FC<ProductCsvImportModalProps> = ({ isOpen, onClose }) => {
  const { bulkAddProducts, showToast } = useCommerce();

  const [csvContent, setCsvContent] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseResult, setParseResult] = useState<ParsedCsvResult | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'rawText'>('upload');
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const handleProcessText = (text: string, name?: string) => {
    setCsvContent(text);
    if (name) setFileName(name);
    const result = parseProductCSV(text);
    setParseResult(result);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      handleProcessText(text, file.name);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      handleProcessText(text, file.name);
    };
    reader.readAsText(file);
  };

  const handleDownloadSampleTemplate = () => {
    triggerCsvDownload(SAMPLE_PRODUCT_CSV_TEXT, 'woocommerce-product-import-sample.csv');
    showToast('Downloaded sample CSV template.');
  };

  const handleLoadSampleDemo = () => {
    handleProcessText(SAMPLE_PRODUCT_CSV_TEXT, 'sample-studio-catalog.csv');
    showToast('Loaded sample studio products.');
  };

  const handleConfirmImport = () => {
    if (!parseResult || parseResult.valid.length === 0) return;
    const count = bulkAddProducts(parseResult.valid);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white text-neutral-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-neutral-200 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50/70">
          <div>
            <h2 className="text-base font-semibold text-neutral-900 flex items-center gap-2">
              <Upload className="w-4 h-4 text-violet-600" />
              <span>Bulk CSV Product Importer</span>
            </h2>
            <p className="text-xs text-neutral-500">
              Rapidly populate Digital Coyotes catalog from external spreadsheet files (.csv)
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Action Helpers */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-neutral-50 rounded-lg border border-neutral-200 text-xs">
            <div className="flex items-center gap-2 text-neutral-600">
              <FileText className="w-4 h-4 text-neutral-500" />
              <span>Need a reference format?</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadSampleTemplate}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 rounded font-medium shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-neutral-500" />
                <span>Download Sample CSV Template</span>
              </button>

              <button
                type="button"
                onClick={handleLoadSampleDemo}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded font-medium shadow-xs transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Load Sample Data (5 Products)</span>
              </button>
            </div>
          </div>

          {/* Upload Method Tabs */}
          <div className="space-y-4">
            <div className="flex items-center gap-4 border-b border-neutral-200 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`pb-2 font-medium border-b-2 transition-colors ${
                  activeTab === 'upload'
                    ? 'border-neutral-900 text-neutral-900 font-semibold'
                    : 'border-transparent text-neutral-500 hover:text-black'
                }`}
              >
                Upload File (.csv)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('rawText')}
                className={`pb-2 font-medium border-b-2 transition-colors ${
                  activeTab === 'rawText'
                    ? 'border-neutral-900 text-neutral-900 font-semibold'
                    : 'border-transparent text-neutral-500 hover:text-black'
                }`}
              >
                Paste CSV Text Directly
              </button>
            </div>

            {activeTab === 'upload' ? (
              /* Drag and drop zone */
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  isDragging
                    ? 'border-neutral-900 bg-neutral-50'
                    : 'border-neutral-300 hover:border-neutral-400 bg-neutral-50/40'
                }`}
              >
                <Upload className="w-8 h-8 mx-auto text-neutral-400 mb-2" />
                <p className="text-sm font-semibold text-neutral-800">
                  {fileName ? `File selected: ${fileName}` : 'Drag & drop your CSV file here'}
                </p>
                <p className="text-xs text-neutral-500 mt-1 mb-4">
                  Standard columns: Title, SKU, Category, Regular Price, Sale Price, Stock, Description, Images
                </p>
                <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-md text-xs font-semibold cursor-pointer shadow-xs transition-colors">
                  <span>Browse File on Computer</span>
                  <input type="file" accept=".csv,text/csv,text/plain" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            ) : (
              /* Paste raw CSV */
              <div className="space-y-2">
                <textarea
                  rows={6}
                  value={csvContent}
                  onChange={(e) => handleProcessText(e.target.value)}
                  placeholder={`Paste raw CSV here, e.g.:\nTitle,SKU,Category,Regular Price,Stock,Description\n"Linen Shirt","APP-01","Apparel",120.00,25,"French linen overshirt"`}
                  className="w-full text-xs font-mono p-3 rounded-lg border border-neutral-300 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                />
              </div>
            )}
          </div>

          {/* Parsed Preview Table */}
          {parseResult && (
            <div className="space-y-3 pt-2 border-t border-neutral-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-neutral-600" />
                  <span>Validation Preview ({parseResult.valid.length} Ready to Import)</span>
                </h3>

                {parseResult.errors.length > 0 && (
                  <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{parseResult.errors.length} skipped / notices</span>
                  </span>
                )}
              </div>

              {parseResult.errors.length > 0 && (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded text-xs text-amber-800 space-y-1 max-h-24 overflow-y-auto">
                  {parseResult.errors.map((err, i) => (
                    <p key={i}>
                      • Row {err.row}: {err.message}
                    </p>
                  ))}
                </div>
              )}

              {parseResult.valid.length === 0 ? (
                <div className="p-6 text-center text-xs text-neutral-500 bg-neutral-50 rounded-lg border border-neutral-200">
                  No valid products parsed yet. Check your CSV header names.
                </div>
              ) : (
                <div className="border border-neutral-200 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold uppercase text-[10px] sticky top-0">
                      <tr>
                        <th className="py-2.5 px-3">Product</th>
                        <th className="py-2.5 px-2">SKU</th>
                        <th className="py-2.5 px-2">Category</th>
                        <th className="py-2.5 px-2 font-mono">Regular Price</th>
                        <th className="py-2.5 px-2 font-mono">Sale Price</th>
                        <th className="py-2.5 px-2 text-center font-mono">Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {parseResult.valid.map((p, idx) => (
                        <tr key={idx} className="hover:bg-neutral-50">
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <img
                                src={p.images[0]}
                                alt={p.name}
                                className="w-7 h-7 rounded object-cover border border-neutral-200 shrink-0"
                              />
                              <div className="truncate max-w-xs">
                                <span className="font-semibold text-neutral-900 block truncate">{p.name}</span>
                                <span className="text-[10px] text-neutral-500 block truncate">{p.shortDescription}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 px-2 font-mono text-neutral-600">{p.sku}</td>
                          <td className="py-2.5 px-2">
                            <span className="bg-neutral-100 px-1.5 py-0.5 rounded text-[10px] text-neutral-700">
                              {p.category}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 font-mono text-neutral-800">${p.regularPrice.toFixed(2)}</td>
                          <td className="py-2.5 px-2 font-mono text-neutral-800">
                            {p.salePrice ? `$${p.salePrice.toFixed(2)}` : '—'}
                          </td>
                          <td className="py-2.5 px-2 text-center font-mono font-medium text-emerald-700">
                            {p.stockQuantity}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200 bg-neutral-50/70">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-200 rounded-md transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!parseResult || parseResult.valid.length === 0}
            onClick={handleConfirmImport}
            className="px-5 py-2 text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white rounded-md transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-40"
          >
            <Check className="w-3.5 h-3.5" />
            <span>
              {parseResult && parseResult.valid.length > 0
                ? `Import ${parseResult.valid.length} Products into Catalog`
                : 'Import Products'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
