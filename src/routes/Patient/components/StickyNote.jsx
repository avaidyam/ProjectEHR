import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Paper, Box, FormControl, Select, MenuItem, Tooltip, IconButton, TextareaAutosize } from '@mui/material';
import { usePatient, useDatabase } from 'components/contexts/PatientContext';
import Draggable from 'react-draggable';
import { Icon } from 'components/ui/Core';

// Module-level z-index counter so clicked windows come to front
// high z so notes appear above any route/tab content; portal will render to body
let globalTopZ = 1200;

export const StickyNote = () => {
  const [departmentsDB] = useDatabase().departments()
  const { useChart } = usePatient();
  const [stickyNotes, setStickyNotes] = useChart().smartData.stickyNotes({});
  // Our data is located @ patient.smartData.stickyNotes.["__PRIVATE__"]
  // NOT patient.currentEncounter.* - this is very important to note!

  // Generic state management for both window types
  const privateWindow = useStickyWindow('private', stickyNotes?.["__PRIVATE__"], 360, 200, -140, 0);
  const deptWindow = useStickyWindow('department', (stickyNotes?.selectedDepartment && stickyNotes?.[stickyNotes.selectedDepartment]), 360, 200, 240, -30);

  // Department specific state
  const [selectedDepartment, setSelectedDepartment] = useState(stickyNotes?.selectedDepartment || '');

  const persistNow = (type, dept, content) => {
    if (type === 'private') {
      setStickyNotes(prev => ({ ...(prev || {}), ["__PRIVATE__"]: content }));
    } else if (type === 'department' && dept) {
      setStickyNotes(prev => ({ ...(prev || {}), [dept]: content }));
    } else if (type === 'selectedDepartment') {
      setStickyNotes(prev => ({ ...(prev || {}), selectedDepartment: dept }));
    }
  };

  // Sync content when stickyNotes or selectedDepartment update
  useEffect(() => {
    if (privateWindow.isOpen) {
      const dbContent = stickyNotes?.["__PRIVATE__"] || '';
      privateWindow.syncContent(dbContent);
    }
    if (deptWindow.isOpen) {
      const dbContent = (selectedDepartment && stickyNotes?.[selectedDepartment]) || '';
      deptWindow.syncContent(dbContent);
    }
  }, [stickyNotes, selectedDepartment, privateWindow.isOpen, deptWindow.isOpen]);

  // Persist on close or timeout
  useEffect(() => {
    // Debounced save
    const timeout = setTimeout(() => {
      if (privateWindow.isOpen) persistNow('private', '', privateWindow.content);
      if (deptWindow.isOpen) persistNow('department', selectedDepartment, deptWindow.content);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [privateWindow.content, deptWindow.content, privateWindow.isOpen, deptWindow.isOpen, selectedDepartment]);

  const handleOpenDept = () => {
    const dept = stickyNotes?.selectedDepartment || '';
    setSelectedDepartment(dept);
    deptWindow.open();
  };

  const handleDeptClose = () => {
    persistNow('department', selectedDepartment, deptWindow.content);
    deptWindow.close();
  };

  const handlePrivateClose = () => {
    persistNow('private', '', privateWindow.content);
    privateWindow.close();
  };

  const handleDepartmentChange = (newDept) => {
    if (deptWindow.isOpen && selectedDepartment) {
      persistNow('department', selectedDepartment, deptWindow.content);
    }
    setSelectedDepartment(newDept);
    // Load new content immediately
    const newContent = stickyNotes?.[newDept] || '';
    deptWindow.setContent(newContent);
    persistNow('selectedDepartment', newDept, '');
  };

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center' }}>
        <Tooltip title="My Sticky Note" arrow>
          <IconButton
            onClick={privateWindow.open}
            size="small"
            sx={{ color: '#fbc02d', backgroundColor: '#fff9c4', '&:hover': { backgroundColor: '#fff59d' } }}
          >
            <Icon>sticky_note_2</Icon>
          </IconButton>
        </Tooltip>

        <Tooltip title="Department Comments" arrow>
          <IconButton
            onClick={handleOpenDept}
            size="small"
            sx={{ color: '#2196f3', backgroundColor: '#e3f2fd', '&:hover': { backgroundColor: '#bbdefb' } }}
          >
            <Icon>sticky_note_2</Icon>
          </IconButton>
        </Tooltip>
      </Box>

      <StickyNoteWindow
        windowState={privateWindow}
        title="My Sticky Note"
        color="#fbc02d"
        bgColor="#fff9c4"
        onClose={handlePrivateClose}
      >
        <TextareaAutosize
          minRows={2}
          value={privateWindow.content}
          onChange={(e) => privateWindow.setContent(e.target.value)}
          placeholder="Enter your private notes..."
          style={{
            flex: 1, width: '100%', boxSizing: 'border-box', border: '1px solid #fbc02d',
            borderRadius: 6, padding: 4, backgroundColor: 'transparent', color: 'rgba(0,0,0,0.87)',
            resize: 'none', height: '100%', fontSize: '1rem', lineHeight: 1.4
          }}
        />
      </StickyNoteWindow>

      <StickyNoteWindow
        windowState={deptWindow}
        title={(selectedDepartment ? (departmentsDB.find(d => d.id === selectedDepartment)?.name || 'Department') : 'Department') + ' Comments'}
        color="#2196f3"
        bgColor="#e3f2fd"
        onClose={handleDeptClose}
      >
        <Box sx={{ mb: 1 }}>
          <FormControl fullWidth size="small">
            <Select
              value={selectedDepartment}
              onChange={(e) => handleDepartmentChange(e.target.value)}
              displayEmpty
              MenuProps={{ PaperProps: { style: { zIndex: 10000 } } }}
              sx={{ backgroundColor: 'background.paper', fontSize: '0.95rem', '& .MuiSelect-select': { padding: '6px 8px' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2196f3' } }}
            >
              <MenuItem sx={{ fontSize: '0.95rem', py: 0.5 }} value="">Select Department</MenuItem>
              {departmentsDB.map(x => (<MenuItem key={x.id} sx={{ fontSize: '0.95rem', py: 0.5 }} value={x.id}>{x.name}</MenuItem>))}
            </Select>
          </FormControl>
        </Box>
        <TextareaAutosize
          minRows={2}
          value={deptWindow.content}
          onChange={(e) => deptWindow.setContent(e.target.value)}
          placeholder={selectedDepartment ? `Enter notes for ${departmentsDB.find(d => d.id === selectedDepartment)?.name || 'Department'}...` : "Please select a department first"}
          disabled={!selectedDepartment}
          style={{
            flex: 1, width: '100%', boxSizing: 'border-box', border: `1px solid ${selectedDepartment ? '#2196f3' : 'rgba(0,0,0,0.12)'}`,
            borderRadius: 6, padding: 4, backgroundColor: 'transparent', color: selectedDepartment ? 'rgba(0,0,0,0.87)' : 'rgba(0,0,0,0.6)',
            resize: 'none', height: '100%', fontSize: '1rem', lineHeight: 1.4
          }}
        />
      </StickyNoteWindow>
    </>
  );
};

// Custom hook for managing window state
const useStickyWindow = (type, initialContent, defaultW, defaultH, offsetX, offsetY) => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState(initialContent || '');
  const [pos, setPos] = useState({ left: null, top: null });
  const [size, setSize] = useState({ width: defaultW, height: defaultH });
  const [zIndex, setZIndex] = useState(globalTopZ);
  const nodeRef = useRef(null);
  const resizingRef = useRef({ type: null, startX: 0, startY: 0, startW: 0, startH: 0 });

  const open = () => {
    // Set position if not set
    setPos(prev => {
      if (prev.left !== null && prev.top !== null) return prev;
      const left = Math.max(8, Math.round((window.innerWidth - defaultW) / 2) + offsetX);
      const top = Math.max(8, Math.round((window.innerHeight - defaultH) / 2) + offsetY);
      return { left, top };
    });
    setIsOpen(true);
    bringToFront();
  };

  const close = () => {
    setIsOpen(false);
    setContent(''); // Clear local content buffer
  };

  const syncContent = (newContent) => {
    setContent(newContent ? String(newContent) : '');
  };

  const bringToFront = () => {
    globalTopZ = Math.min(globalTopZ + 1, 9000);
    setZIndex(globalTopZ);
  };

  const startResizing = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const r = resizingRef.current;
    r.startX = e.clientX;
    r.startY = e.clientY;
    r.startW = size.width;
    r.startH = size.height;
    bringToFront();
    window.addEventListener('mousemove', handleResizing);
    window.addEventListener('mouseup', stopResizing);
  };

  const handleResizing = (ev) => {
    ev.preventDefault();
    const dx = ev.clientX - resizingRef.current.startX;
    const dy = ev.clientY - resizingRef.current.startY;
    const minW = 240, minH = 120;
    setSize({
      width: Math.max(minW, Math.round(resizingRef.current.startW + dx)),
      height: Math.max(minH, Math.round(resizingRef.current.startH + dy))
    });
  };

  const stopResizing = () => {
    window.removeEventListener('mousemove', handleResizing);
    window.removeEventListener('mouseup', stopResizing);
  };

  return {
    isOpen, open, close, content, setContent, syncContent,
    pos, size, zIndex, nodeRef, bringToFront, startResizing
  };
};

const StickyNoteWindow = ({ windowState, title, color, bgColor, onClose, children }) => {
  if (!windowState.isOpen) return null;

  return createPortal(
    <Draggable nodeRef={windowState.nodeRef} handle=".drag-handle" onStart={windowState.bringToFront}>
      <Paper
        ref={windowState.nodeRef}
        elevation={8}
        onMouseDown={windowState.bringToFront}
        sx={{
          position: 'fixed',
          left: windowState.pos.left !== null ? `${windowState.pos.left}px` : `calc(50% - ${windowState.size.width / 2}px)`,
          top: windowState.pos.top !== null ? `${windowState.pos.top}px` : `calc(50% - ${windowState.size.height / 2}px)`,
          backgroundColor: bgColor,
          border: `2px solid ${color}`,
          borderRadius: 2,
          minHeight: 120,
          minWidth: 300,
          width: windowState.size.width,
          height: windowState.size.height,
          zIndex: windowState.zIndex,
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
      >
        <Box
          className="drag-handle"
          sx={{ display: 'flex', alignItems: 'center', gap: 0.75, p: 0, pb: 0, cursor: 'move', userSelect: 'none' }}
        >
          <Icon sx={{ color: color, fontSize: '1rem' }}>sticky_note_2</Icon>
          <Box component="span" sx={{ fontWeight: 'bold', color: color, flexGrow: 1, fontSize: '1rem' }}>
            {title}
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: color, padding: 0, minWidth: 'auto' }}>
            <Icon sx={{ fontSize: '1rem' }}>close</Icon>
          </IconButton>
        </Box>
        <Box sx={{ p: 1, pt: 0.5, flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {children}
        </Box>
        <Box
          onMouseDown={windowState.startResizing}
          sx={{ position: 'absolute', right: 8, bottom: 8, width: 16, height: 16, cursor: 'nwse-resize', zIndex: 2 }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16">
            <path d="M0 12 L4 12 L12 4 L12 0" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="square" />
          </svg>
        </Box>
      </Paper>
    </Draggable>,
    document.body
  );
};
