import React, { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import { 
  Music, Video, Image as ImageIcon, FileText, 
  Trash2, GripVertical, Plus, Settings, 
  Square, Presentation, Upload, File, Type
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';

const SchedulePanel = ({ 
  setIsSongLibraryOpen,
  setIsMediaLibraryOpen
}) => {
  const { 
    schedule, 
    setSchedule,
    selectedItemIndex, 
    setSelectedItemIndex, 
    removeFromSchedule,
    addToSchedule,
    language 
  } = useProject();

  const [isImportingPowerPoint, setIsImportingPowerPoint] = useState(false);

  const [isCustomSlideOpen, setIsCustomSlideOpen] = useState(false);
  const [customSlideContent, setCustomSlideContent] = useState('');
  const [customSlideTitle, setCustomSlideTitle] = useState('');

  const t = {
    id: { title: "SUSUNAN IBADAH", empty: "Belum ada item", addSong: "Lagu", addMedia: "Media", addBlank: "Blank", addPowerPoint: "PowerPoint", addCustom: "Custom", importing: "Mengimpor..." },
    en: { title: "SCHEDULE", empty: "No items", addSong: "Song", addMedia: "Media", addBlank: "Blank", addPowerPoint: "PowerPoint", addCustom: "Custom", importing: "Importing..." }
  }[language] || t.id;

  const getItemColor = (type) => {
    switch (type) {
      case 'song': return 'text-[#800000]';
      case 'media': return 'text-[#2563EB]';
      case 'image': return 'text-[#059669]';
      case 'blank': return 'text-[#6B7280]';
      case 'powerpoint': return 'text-[#DC2626]';
      case 'custom': return 'text-[#7C3AED]';
      default: return 'text-[#6B7280]';
    }
  };

  const getItemIcon = (type) => {
    switch (type) {
      case 'song': return <Music size={16} />;
      case 'media': return <Video size={16} />;
      case 'image': return <ImageIcon size={16} />;
      case 'blank': return <Square size={16} />;
      case 'powerpoint': return <Presentation size={16} />;
      case 'custom': return <Type size={16} />;
      default: return <FileText size={16} />;
    }
  };

  const handleAddBlank = () => {
    const blankItem = {
      id: `blank-${Date.now()}`,
      title: 'Blank Screen',
      type: 'blank',
      slides: [{ id: 's1', content: '', label: 'Blank' }]
    };
    addToSchedule(blankItem);
  };

  // MODUL 15: PowerPoint Import
  const handlePowerPointImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pptx,.ppt';
    input.multiple = false;
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        setIsImportingPowerPoint(true);
        try {
          const formData = new FormData();
          formData.append('file', file);
          
          const response = await fetch('http://localhost:5000/api/import/powerpoint', {
            method: 'POST',
            body: formData
          });
          
          if (response.ok) {
            const result = await response.json();
            
            // Convert PowerPoint slides to schedule item
            const powerPointItem = {
              id: `ppt-${Date.now()}`,
              title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
              type: 'powerpoint',
              slides: result.slides.map((slide, index) => ({
                id: `slide-${index + 1}`,
                content: slide.content,
                label: slide.title || `Slide ${index + 1}`,
                backgroundImage: slide.backgroundImage || null,
                notes: slide.notes || ''
              })),
              metadata: {
                fileName: file.name,
                fileSize: file.size,
                slideCount: result.slideCount,
                importedAt: new Date().toISOString()
              }
            };
            
            addToSchedule(powerPointItem);
            
            // Show success notification
            const { notify } = useProject();
            notify(`PowerPoint imported: ${result.slideCount} slides`, 'success');
          } else {
            const error = await response.json();
            const { notify } = useProject();
            notify(`Import failed: ${error.message}`, 'error');
          }
        } catch (error) {
          console.error('PowerPoint import error:', error);
          const { notify } = useProject();
          notify('PowerPoint import failed', 'error');
        } finally {
          setIsImportingPowerPoint(false);
        }
      }
    };
    input.click();
  };

  // MODUL 17: Custom Slides
  const handleAddCustomSlide = () => {
    setCustomSlideTitle('');
    setCustomSlideContent('');
    setIsCustomSlideOpen(true);
  };

  const handleSaveCustomSlide = () => {
    if (!customSlideTitle.trim() && !customSlideContent.trim()) {
      const { notify } = useProject();
      notify('Please enter a title or content for the custom slide', 'error');
      return;
    }

    const customSlideItem = {
      id: `custom-${Date.now()}`,
      title: customSlideTitle.trim() || 'Custom Slide',
      type: 'custom',
      slides: [{
        id: 'custom-slide-1',
        content: customSlideContent.trim(),
        label: customSlideTitle.trim() || 'Custom Slide'
      }],
      metadata: {
        createdAt: new Date().toISOString(),
        isCustom: true
      }
    };

    addToSchedule(customSlideItem);
    setIsCustomSlideOpen(false);
    setCustomSlideTitle('');
    setCustomSlideContent('');
    
    const { notify } = useProject();
    notify('Custom slide added to schedule', 'success');
  };

  return (
    <div className="w-[320px] flex flex-col bg-[#F1F1F3] border-r border-[#E2E2E6] overflow-hidden">
      {/* Header Panel */}
      <div className="h-[56px] px-5 flex items-center justify-between bg-white border-b border-[#E2E2E6] shrink-0">
        <h3 className="text-[11px] font-black tracking-[0.2em] text-[#8E8E93] uppercase">{t.title}</h3>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setIsSongLibraryOpen(true)}
            className="p-2 text-[#800000] hover:bg-[#80000008] rounded-lg transition-all"
            title={t.addSong}
          >
            <Plus size={16} />
          </button>
          
          <button 
            onClick={() => setIsMediaLibraryOpen(true)}
            className="p-2 text-[#800000] hover:bg-[#80000008] rounded-lg transition-all"
            title={t.addMedia}
          >
            <ImageIcon size={16} />
          </button>
          
          <button 
            onClick={handlePowerPointImport}
            disabled={isImportingPowerPoint}
            className="p-2 text-[#800000] hover:bg-[#80000008] rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title={t.addPowerPoint}
          >
            {isImportingPowerPoint ? (
              <div className="animate-spin">
                <Upload size={16} />
              </div>
            ) : (
              <File size={16} />
            )}
          </button>
          
          <button 
            onClick={handleAddCustomSlide}
            className="p-2 text-[#800000] hover:bg-[#80000008] rounded-lg transition-all"
            title={t.addCustom}
          >
            <Type size={16} />
          </button>
          
          <button 
            onClick={handleAddBlank}
            className="p-2 text-[#800000] hover:bg-[#80000008] rounded-lg transition-all"
            title={t.addBlank}
          >
            <Square size={16} />
          </button>
        </div>
      </div>

      {/* List Susunan Ibadah dengan DRAG & DROP */}
      <Reorder.Group 
        axis="y" 
        values={schedule} 
        onReorder={setSchedule}
        className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar"
      >
        {schedule.length > 0 ? (
          schedule.map((item, idx) => {
            const isActive = selectedItemIndex === idx;
            const Icon = item.type === 'video' ? Video : item.type === 'image' ? ImageIcon : item.type === 'bible' ? FileText : Music;

            return (
              <Reorder.Item 
                key={item.instanceId || item.id}
                value={item}
                onClick={() => setSelectedItemIndex(idx)}
                className={`group flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                  isActive 
                  ? 'bg-white border-[#800000] shadow-lg shadow-[#80000010] z-10' 
                  : 'bg-white/60 border-transparent hover:border-[#80000040] hover:bg-white'
                }`}
              >
                <div className="shrink-0 text-[#AEAEB2] group-hover:text-[#800000] transition-colors cursor-grab active:cursor-grabbing">
                  <GripVertical size={16} />
                </div>
                
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  isActive ? 'bg-[#800000] text-white' : 'bg-[#F1F1F3] text-[#AEAEB2]'
                }`}>
                  <Icon size={18} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-[12px] font-black truncate leading-tight ${isActive ? 'text-[#1D1D1F]' : 'text-[#424245]'}`}>
                    {item.title}
                  </p>
                  <p className="text-[10px] font-bold text-[#AEAEB2] truncate uppercase tracking-tighter mt-0.5">
                    {item.type} • {item.slides?.length || 0} SLIDE
                  </p>
                </div>

                <button 
                  onClick={(e) => { e.stopPropagation(); removeFromSchedule(idx); }}
                  className="opacity-0 group-hover:opacity-100 p-2 text-[#AEAEB2] hover:text-red-500 transition-all rounded-lg"
                >
                  <Trash2 size={16} />
                </button>
              </Reorder.Item>
            );
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-20">
            <Presentation size={48} className="mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest">{t.empty}</p>
          </div>
        )}
      </Reorder.Group>

      {/* Footer Add Buttons */}
      <div className="p-4 bg-white border-t border-[#E2E2E6] grid grid-cols-2 gap-2">
        <button 
          onClick={() => setIsSongLibraryOpen(true)}
          className="flex items-center justify-center gap-2 py-2 bg-[#80000005] text-[#800000] border border-[#80000010] rounded-lg text-[10px] font-black hover:bg-[#800000] hover:text-white transition-all"
        >
          <Music size={14} /> LAGU
        </button>
        <button 
          onClick={() => setIsMediaLibraryOpen(true)}
          className="flex items-center justify-center gap-2 py-2 bg-[#80000005] text-[#800000] border border-[#80000010] rounded-lg text-[10px] font-black hover:bg-[#800000] hover:text-white transition-all"
        >
          <Video size={14} /> MEDIA
        </button>
        <button 
          onClick={handleAddBlank}
          className="flex items-center justify-center gap-2 py-2 bg-[#80000005] text-[#800000] border border-[#80000010] rounded-lg text-[10px] font-black hover:bg-[#800000] hover:text-white transition-all"
        >
          <Square size={14} /> KOSONG
        </button>
        <button 
          onClick={() => alert('PowerPoint import coming soon')}
          className="flex items-center justify-center gap-2 py-2 bg-[#80000005] text-[#800000] border border-[#80000010] rounded-lg text-[10px] font-black hover:bg-[#800000] hover:text-white transition-all"
        >
          <FileText size={14} /> POWERPOINT
        </button>
      </div>
    </div>
  );

  // MODUL 17: Custom Slide Modal
  if (isCustomSlideOpen) {
    return (
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md z-[200] flex items-center justify-center p-4 font-manrope">
        <div className="bg-white w-[500px] rounded-2xl border border-white shadow-3xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
          {/* Header */}
          <div className="px-8 py-6 flex items-center justify-between border-b border-[#F1F1F3] bg-white">
            <h2 className="text-[18px] font-black text-[#2D2D2E] tracking-tight">Custom Slide</h2>
            <button 
              onClick={() => setIsCustomSlideOpen(false)}
              className="w-8 h-8 bg-[#F8F9FA] border border-[#E2E2E6] rounded-full flex items-center justify-center text-[#AEAEB2] hover:text-[#800000] hover:border-[#800000] transition-all"
            >
              <Trash2 size={16} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
            <div>
              <label className="block text-[12px] font-black text-[#8E8E93] uppercase tracking-[0.2em] mb-2">Title (Optional)</label>
              <input
                type="text"
                value={customSlideTitle}
                onChange={(e) => setCustomSlideTitle(e.target.value)}
                placeholder="Enter slide title..."
                className="w-full px-4 py-3 border border-[#E2E2E6] rounded-xl text-[14px] focus:outline-none focus:border-[#800000] transition-all"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-[12px] font-black text-[#8E8E93] uppercase tracking-[0.2em] mb-2">Content</label>
              <textarea
                value={customSlideContent}
                onChange={(e) => setCustomSlideContent(e.target.value)}
                placeholder="Enter slide content...\n\nThis can be used for announcements, welcome messages, or any custom text content."
                className="w-full px-4 py-3 border border-[#E2E2E6] rounded-xl text-[14px] focus:outline-none focus:border-[#800000] transition-all resize-none"
                rows={8}
              />
            </div>

            <div className="bg-[#F8F9FA] rounded-xl p-4 border border-[#E2E2E6]">
              <p className="text-[11px] text-[#8E8E93] font-medium leading-relaxed">
                <strong>💡 Tips:</strong> Custom slides are perfect for announcements, welcome messages, prayer requests, or any text content that doesn't fit into songs or Bible verses.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-[#F1F1F3] flex justify-between bg-white">
            <button 
              onClick={() => setIsCustomSlideOpen(false)}
              className="px-6 py-3 bg-[#F8F9FA] text-[#6B7280] border border-[#E2E2E6] rounded-xl text-[12px] font-black hover:bg-white transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleSaveCustomSlide}
              className="px-8 py-3 bg-[#800000] text-white rounded-xl text-[12px] font-black shadow-lg shadow-[#80000020] hover:bg-[#5C0000] transition-all"
            >
              Add to Schedule
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[320px] flex flex-col bg-[#F1F1F3] border-r border-[#E2E2E6] overflow-hidden">
      {/* Header Panel */}
      <div className="h-[56px] px-5 flex items-center justify-between bg-white border-b border-[#E2E2E6] shrink-0">
        <h3 className="text-[11px] font-black tracking-[0.2em] text-[#8E8E93] uppercase">{t.title}</h3>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setIsSongLibraryOpen(true)}
            className="p-2 text-[#800000] hover:bg-[#80000008] rounded-lg transition-all"
            title={t.addSong}
          >
            <Plus size={16} />
          </button>
          
          <button 
            onClick={() => setIsMediaLibraryOpen(true)}
            className="p-2 text-[#800000] hover:bg-[#80000008] rounded-lg transition-all"
            title={t.addMedia}
          >
            <ImageIcon size={16} />
          </button>
          
          <button 
            onClick={handlePowerPointImport}
            disabled={isImportingPowerPoint}
            className="p-2 text-[#800000] hover:bg-[#80000008] rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title={t.addPowerPoint}
          >
            {isImportingPowerPoint ? (
              <div className="animate-spin">
                <Upload size={16} />
              </div>
            ) : (
              <File size={16} />
            )}
          </button>
          
          <button 
            onClick={handleAddCustomSlide}
            className="p-2 text-[#800000] hover:bg-[#80000008] rounded-lg transition-all"
            title={t.addCustom}
          >
            <Type size={16} />
          </button>
          
          <button 
            onClick={handleAddBlank}
            className="p-2 text-[#800000] hover:bg-[#80000008] rounded-lg transition-all"
            title={t.addBlank}
          >
            <Square size={16} />
          </button>
        </div>
      </div>

      {/* List Susunan Ibadah dengan DRAG & DROP */}
      <Reorder.Group 
        axis="y" 
        values={schedule} 
        onReorder={setSchedule}
        className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar"
      >
        {schedule.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
            <FileText size={48} className="text-[#C7C7CC] mb-4" />
            <span className="text-[12px] font-black uppercase tracking-wider text-[#C7C7CC]">{t.empty}</span>
          </div>
        ) : (
          schedule.map((item, index) => (
            <Reorder.Item 
              key={item.id} 
              value={item} 
              id={item.id}
              className="bg-white rounded-xl p-4 border border-[#E2E2E6] cursor-move hover:border-[#80000040] transition-all"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <GripVertical size={14} className="text-[#C7C7CC] flex-shrink-0" />
                  <div className={`flex items-center gap-2 ${getItemColor(item.type)}`}>
                    {getItemIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-[#2D2D2E] truncate">{item.title}</p>
                    {item.slides && (
                      <p className="text-[10px] text-[#8E8E93] mt-0.5">
                        {item.slides.length} slide{item.slides.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeFromSchedule(index)}
                  className="p-1.5 text-[#C7C7CC] hover:text-[#FF3B30] hover:bg-[#FF3B30]/10 rounded-lg transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </Reorder.Item>
          ))
        )}
      </Reorder.Group>
    </div>
  );
};

export default SchedulePanel;
