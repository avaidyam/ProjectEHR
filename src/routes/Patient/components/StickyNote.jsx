import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Paper, Box, FormControl, Select, MenuItem, Tooltip, IconButton, TextareaAutosize } from '@mui/material';
import { usePatient, useDatabase } from 'components/contexts/PatientContext.jsx';
import Draggable from 'react-draggable';
import { Icon } from 'components/ui/Core.jsx';

// Module-level z-index counter so clicked windows come to front
// high z so notes appear above any route/tab content; portal will render to body
let globalTopZ = 1200;

export const StickyNote = () => {
  const [departmentsDB] = useDatabase().departments()
  const { useChart, useEncounter } = usePatient();
  const encounterAccessor = useEncounter();
  
  // Safely access the stickyNotes hook with proper fallback
  let stickyNoteData = {};
  let setStickyNoteData = () => {};
  
  try {
    if (encounterAccessor && typeof encounterAccessor.stickyNotes === 'function') {
      const result = encounterAccessor.stickyNotes({});
      if (Array.isArray(result) && result.length >= 2) {
        stickyNoteData = result[0] ?? {};
        setStickyNoteData = result[1] ?? (() => {});
      }
    }
  } catch (err) {
    console.warn('Failed to access stickyNotes:', err);
  }

  // separate state for private note and department note so both can be open
  const [privateOpen, setPrivateOpen] = useState(false);
  const [privateContent, setPrivateContent] = useState('');

  const [deptOpen, setDeptOpen] = useState(false);
  const [deptContent, setDeptContent] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [currentDept, setCurrentDept] = useState('');
  const saveTimeoutRef = useRef(null);
  const lastOpenedRef = useRef({ popupOpen: false, popupType: null, currentDept: '' });
  const privateContentRef = useRef(privateContent);
  const deptContentRef = useRef(deptContent);
  const currentDeptRef = useRef(currentDept);
  // Refs for Draggable to avoid findDOMNode in StrictMode
  const privateNodeRef = useRef(null);
  const deptNodeRef = useRef(null);

  // z-index state so clicked note sits on top
  const [privateZ, setPrivateZ] = useState(globalTopZ);
  const [deptZ, setDeptZ] = useState(globalTopZ - 1);

  // size state for resizable windows (smaller defaults so content and title are closer)
  const [privateSize, setPrivateSize] = useState({ width: 360, height: 200 });
  const [deptSize, setDeptSize] = useState({ width: 360, height: 200 });

  // position state for windows (so we can center on open and remember after drag)
  const [privatePos, setPrivatePos] = useState({ left: null, top: null });
  const [deptPos, setDeptPos] = useState({ left: null, top: null });

  // resizing refs and flags
  const resizingRef = useRef({ type: null, startX: 0, startY: 0, startW: 0, startH: 0 });

  // Use useEncounter for persistent data.
  // We probe the accessor once and store results in refs so we don't re-evaluate
  // on every render (which would create new objects and trigger effects that
  // overwrite local editing state). This keeps the sticky-note local state
  // stable while still using the encounter-backed accessor when available.
  const stickyNoteDataRef = useRef({});
  const setStickyNoteDataRef = useRef(() => {});

  // Ensure stickyNoteData is always an object
  const safeStickyNoteData = stickyNoteData && typeof stickyNoteData === 'object' ? stickyNoteData : {};

  // Load note content when private or dept windows open or department changes
  useEffect(() => {
    const data = safeStickyNoteData;
    if (privateOpen) {
      const content = data?.private;
      setPrivateContent(content ? String(content) : '');
      privateContentRef.current = content ? String(content) : '';
    } else {
      // clear local when closed
      // (keep persisted content in store)
    }

    if (deptOpen) {
      const depts = data.departments || {};
      const content = (currentDept && depts[currentDept]) || '';
      setDeptContent(content ? String(content) : '');
      deptContentRef.current = content ? String(content) : '';
    }
  }, [privateOpen, deptOpen, currentDept, safeStickyNoteData]);

  // Persist helper - ensures immediate save when closing or switching
  const persistNow = (type, dept, content) => {
    if (!setStickyNoteData) return;
    if (type === 'private') {
      setStickyNoteData(prev => ({ ...(prev || {}), private: content }));
    } else if (type === 'department' && dept) {
      setStickyNoteData(prev => ({
        ...(prev || {}),
        departments: {
          ...((prev && prev.departments) || {}),
          [dept]: content
        }
      }));
    } else if (type === 'selectedDepartment') {
      // persist which department option is selected (not whether dropdown is open)
      setStickyNoteData(prev => ({ ...(prev || {}), selectedDepartment: dept }));
    }
  };

  // Auto-save when privateContent or deptContent changes (debounced)
  useEffect(() => {
    if (!setStickyNoteData) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      if (privateOpen) {
        persistNow('private', '', privateContentRef.current);
      }
      if (deptOpen) {
        persistNow('department', currentDeptRef.current, deptContentRef.current);
      }
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, [privateContent, deptContent, privateOpen, deptOpen, currentDept, setStickyNoteData]);

  const handleOpenPrivate = () => {
    // compute and set default centered position synchronously to avoid teleport
    setPrivatePos(pos => {
      if (pos.left !== null && pos.top !== null) return pos;
      const w = privateSize.width;
      const h = privateSize.height;
      // default private note more to the left
      const left = Math.max(8, Math.round((window.innerWidth - w) / 2) - 140);
      const top = Math.max(8, Math.round((window.innerHeight - h) / 2));
      return { left, top };
    });
    setPrivateOpen(true);
  };

  const handleOpenDept = (dept = '') => {
    // If no explicit dept passed, prefer the previously saved selection
    const persistedDept = (safeStickyNoteData && safeStickyNoteData.selectedDepartment) || dept || '';
    setSelectedDepartment(persistedDept);
    setCurrentDept(persistedDept);
    currentDeptRef.current = persistedDept;
    // compute and set default position synchronously before opening to avoid teleport
    setDeptPos(pos => {
      if (pos.left !== null && pos.top !== null) return pos;
      const w = deptSize.width;
      const h = deptSize.height;
      // default department note further to the right
      const left = Math.max(8, Math.round((window.innerWidth - w) / 2) + 240);
      const top = Math.max(8, Math.round((window.innerHeight - h) / 2) - 30);
      return { left, top };
    });
    setDeptOpen(true);
  };

  const handleClosePrivate = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    persistNow('private', '', privateContentRef.current);
    setPrivateOpen(false);
    setPrivateContent('');
  };

  const handleCloseDept = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    persistNow('department', currentDeptRef.current, deptContentRef.current);
    setDeptOpen(false);
    // Clear local editing buffer but keep the selected department saved so
    // reopening restores the same selected option (we do not persist dropdown open state)
    setDeptContent('');
  };

  const handleDepartmentChange = (newDepartment) => {
    // save current dept content before switching
    if (deptOpen && currentDept) {
      persistNow('department', currentDeptRef.current, deptContentRef.current);
    }
    setCurrentDept(newDepartment);
    setSelectedDepartment(newDepartment);
    currentDeptRef.current = newDepartment;
    // load the content for the newly selected department from persisted data
    const depts = safeStickyNoteData.departments || {};
    const content = depts[newDepartment] || '';
    setDeptContent(content);
    deptContentRef.current = content;
    // persist the selected department option so it remains selected across close/open
    persistNow('selectedDepartment', newDepartment, '');
  };

  const handlePrivateContentChange = (e) => {
    setPrivateContent(e.target.value);
    privateContentRef.current = e.target.value;
  };

  const handleDeptContentChange = (e) => {
    setDeptContent(e.target.value);
    deptContentRef.current = e.target.value;
  };

  // Persist any pending content on unmount (or when component is removed)
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      // persist latest values from refs
      if (privateContentRef.current) {
        persistNow('private', '', privateContentRef.current);
      }
      if (deptContentRef.current && currentDeptRef.current) {
        persistNow('department', currentDeptRef.current, deptContentRef.current);
      }
    };
  }, []);

  // Bring a window to front by bumping its z-index
  const bringToFront = (type) => {
    globalTopZ = Math.min(globalTopZ + 1, 9000); // Cap at 9000
    if (type === 'private') {
      setPrivateZ(globalTopZ);
    } else if (type === 'department') {
      setDeptZ(globalTopZ);
    }
  };

  // Resizing handlers
  const startResizing = (type, e) => {
    e.preventDefault();
    e.stopPropagation();
    const r = resizingRef.current;
    r.type = type;
    r.startX = e.clientX;
    r.startY = e.clientY;
    if (type === 'private') {
      r.startW = privateSize.width;
      r.startH = privateSize.height;
      bringToFront('private');
    } else {
      r.startW = deptSize.width;
      r.startH = deptSize.height;
      bringToFront('department');
    }
    window.addEventListener('mousemove', handleResizing);
    window.addEventListener('mouseup', stopResizing);
  };

  const handleResizing = (ev) => {
    const r = resizingRef.current;
    if (!r.type) return;
    ev.preventDefault();
    const dx = ev.clientX - r.startX;
    const dy = ev.clientY - r.startY;
    const minW = 240;
    const minH = 120;
    if (r.type === 'private') {
      setPrivateSize({ width: Math.max(minW, Math.round(r.startW + dx)), height: Math.max(minH, Math.round(r.startH + dy)) });
    } else if (r.type === 'department') {
      setDeptSize({ width: Math.max(minW, Math.round(r.startW + dx)), height: Math.max(minH, Math.round(r.startH + dy)) });
    }
  };

  const stopResizing = () => {
    resizingRef.current.type = null;
    window.removeEventListener('mousemove', handleResizing);
    window.removeEventListener('mouseup', stopResizing);
  };

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center' }}>
        <Tooltip title="My Sticky Note" arrow>
          <IconButton
            onClick={handleOpenPrivate}
            size="small"
            sx={{
              color: '#fbc02d',
              backgroundColor: '#fff9c4',
              '&:hover': { backgroundColor: '#fff59d' },
            }}
          >
            <Icon>sticky_note_2</Icon>
          </IconButton>
        </Tooltip>

        <Tooltip title="Department Comments" arrow>
          <IconButton
            onClick={() => handleOpenDept()}
            size="small"
            sx={{
              color: '#2196f3',
              backgroundColor: '#e3f2fd',
              '&:hover': { backgroundColor: '#bbdefb' },
            }}
          >
            <Icon>sticky_note_2</Icon>
          </IconButton>
        </Tooltip>
      </Box>

      {/* Private sticky note window */}
      {privateOpen && (
        createPortal(
          <Draggable nodeRef={privateNodeRef} handle=".drag-handle-private" onStart={() => bringToFront('private')}>
            <Paper
              ref={privateNodeRef}
              elevation={8}
              onMouseDown={() => bringToFront('private')}
              sx={{
                position: 'fixed',
                left: privatePos.left !== null ? `${privatePos.left}px` : `calc(50% - ${privateSize.width / 2}px)`,
                top: privatePos.top !== null ? `${privatePos.top}px` : `calc(50% - ${privateSize.height / 2}px)`,
                backgroundColor: '#fff9c4',
                border: `2px solid #fbc02d`,
                borderRadius: 2,
                minHeight: 120,
                minWidth: 300,
                width: privateSize.width,
                height: privateSize.height,
                zIndex: privateZ,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
            <Box
              className="drag-handle-private"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                p: 0,
                pb: 0,
                cursor: 'move',
                userSelect: 'none',
              }}
            >
              <Icon sx={{ color: '#fbc02d', fontSize: '1rem' }}>sticky_note_2</Icon>
              <Box component="span" sx={{ fontWeight: 'bold', color: '#fbc02d', flexGrow: 1, fontSize: '1rem' }}>
                My Sticky Note
              </Box>
              <IconButton
                onClick={handleClosePrivate}
                size="small"
                sx={{ color: '#fbc02d', padding: 0, minWidth: 'auto' }}
              >
                <Icon sx={{ fontSize: '1rem' }}>close</Icon>
              </IconButton>
            </Box>
              <Box sx={{ p: 1, pt: 0.5, flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <TextareaAutosize
                  minRows={2}
                  value={privateContent}
                  onChange={handlePrivateContentChange}
                  placeholder={"Enter your private notes..."}
                  style={{
                    flex: 1,
                    width: '100%',
                    boxSizing: 'border-box',
                    border: '1px solid #fbc02d',
                    borderRadius: 6,
                    padding: 4,
                    backgroundColor: 'transparent',
                    color: 'rgba(0,0,0,0.87)',
                    resize: 'none',
                    height: '100%',
                    fontSize: '1rem',
                    lineHeight: 1.4
                  }}
                />
              </Box>
              {/* Resize handle bottom-right */}
              <Box
                onMouseDown={(e) => startResizing('private', e)}
                sx={{ position: 'absolute', right: 8, bottom: 8, width: 16, height: 16, cursor: 'nwse-resize', zIndex: 2 }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <path d="M0 12 L4 12 L12 4 L12 0" stroke="#fbc02d" strokeWidth="1.5" fill="none" strokeLinecap="square" />
                </svg>
              </Box>
            </Paper>
          </Draggable>,
          document.body
        )
      )}

      {/* Department sticky note window */}
      {deptOpen && (
        createPortal(
          <Draggable nodeRef={deptNodeRef} handle=".drag-handle-dept" onStart={() => bringToFront('department')}>
            <Paper
              ref={deptNodeRef}
              elevation={8}
              onMouseDown={() => bringToFront('department')}
              sx={{
                position: 'fixed',
                left: deptPos.left !== null ? `${deptPos.left}px` : `calc(50% - ${deptSize.width / 2}px + 120px)`,
                top: deptPos.top !== null ? `${deptPos.top}px` : `calc(50% - ${deptSize.height / 2}px - 30px)`,
                backgroundColor: '#e3f2fd',
                border: `2px solid #2196f3`,
                borderRadius: 2,
                minHeight: 120,
                minWidth: 300,
                width: deptSize.width,
                height: deptSize.height,
                zIndex: deptZ,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
            <Box
              className="drag-handle-dept"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                p: 0,
                pb: 0,
                cursor: 'move',
                userSelect: 'none',
              }}
            >
              <Icon sx={{ color: '#2196f3', fontSize: '1rem' }}>sticky_note_2</Icon>
              <Box component="span" sx={{ fontWeight: 'bold', color: '#2196f3', flexGrow: 1, fontSize: '1rem' }}>
                {currentDept || 'Department'} Comments
              </Box>
              <IconButton
                onClick={handleCloseDept}
                size="small"
                sx={{ color: '#2196f3', padding: 0, minWidth: 'auto' }}
              >
                <Icon sx={{ fontSize: '1rem' }}>close</Icon>
              </IconButton>
            </Box>
            <Box sx={{ p: 1, pt: 0.5, flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ mb: 1 }}>
                <FormControl fullWidth size="small">
                  <Select
                    value={currentDept}
                    onChange={(e) => handleDepartmentChange(e.target.value)}
                    displayEmpty
                    MenuProps={{
                      PaperProps: { 
                        style: { zIndex: 10000 }
                      }
                    }}
                    sx={{
                      backgroundColor: 'background.paper',
                      fontSize: '0.95rem',
                      '& .MuiSelect-select': { padding: '6px 8px' },
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2196f3' },
                    }}
                  >
                    <MenuItem sx={{ fontSize: '0.95rem', py: 0.5 }} value="">Select Department</MenuItem>
                    {departmentsDB.map(x => (<MenuItem sx={{ fontSize: '0.95rem', py: 0.5 }} value={x.name}>{x.name}</MenuItem>))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ p: 0, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <TextareaAutosize
                  minRows={2}
                  value={deptContent}
                  onChange={handleDeptContentChange}
                  placeholder={currentDept ? `Enter notes for ${currentDept}...` : "Please select a department first"}
                  disabled={!currentDept}
                  style={{
                    flex: 1,
                    width: '100%',
                    boxSizing: 'border-box',
                    border: `1px solid ${currentDept ? '#2196f3' : 'rgba(0,0,0,0.12)'}`,
                    borderRadius: 6,
                    padding: 4,
                    backgroundColor: 'transparent',
                    color: currentDept ? 'rgba(0,0,0,0.87)' : 'rgba(0,0,0,0.6)',
                    resize: 'none',
                    height: '100%',
                    fontSize: '1rem',
                    lineHeight: 1.4
                  }}
                />
              </Box>
            </Box>
              {/* Resize handle bottom-right for department window */}
              <Box
                onMouseDown={(e) => startResizing('department', e)}
                sx={{ position: 'absolute', right: 8, bottom: 8, width: 16, height: 16, cursor: 'nwse-resize', zIndex: 2 }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <path d="M0 12 L4 12 L12 4 L12 0" stroke="#2196f3" strokeWidth="1.5" fill="none" strokeLinecap="square" />
                </svg>
              </Box>
            </Paper>
          </Draggable>,
          document.body
        )
      )}
    </>
  );
};
