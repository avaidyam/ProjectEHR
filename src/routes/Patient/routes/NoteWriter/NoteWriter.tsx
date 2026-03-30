import * as React from 'react';
import { Box, Button, Tab, TabList, TabPanel, TabView, Autocomplete } from 'components/ui/Core';
import { IconButton, Grid, Checkbox, Typography, Icon, Popover } from '@mui/material';
import { usePatient } from 'components/contexts/PatientContext';
import * as NoteWriterConfig from 'util/data/notewriter_config.json'

// Handle both namespace and default imports for JSON
const rawConfig = (NoteWriterConfig as any).default || (NoteWriterConfig as any);
const systemsTemplate: Record<string, any> = {};

// We specifically look for our expected top-level sections
const KNOWN_SECTIONS = ['Review of Systems', 'Physical Exam'];
KNOWN_SECTIONS.forEach(key => {
    const section = rawConfig[key] || (rawConfig.default && rawConfig.default[key]);
    if (section && typeof section === 'object') {
        systemsTemplate[key] = section;
    }
});

// If nothing was found, attempt to find any object that has 'sub_tabs'
if (Object.keys(systemsTemplate).length === 0) {
    Object.keys(rawConfig).forEach(key => {
        if (key !== 'default' && rawConfig[key] && rawConfig[key].sub_tabs) {
            systemsTemplate[key] = rawConfig[key];
        }
    });
}

const generateHTML = (systemsState: Record<string, any>, sectionToGenerate: string | null = null) => {
  let html = '';
  const sections = sectionToGenerate ? [sectionToGenerate] : Object.keys(systemsState || {});

  sections.forEach((section: string) => {
    const sectionData = systemsState?.[section];
    const sectionConfig = systemsTemplate?.[section];
    if (!sectionData || !sectionConfig) return;

    let sectionHtml = "";
    
    // We traverse the config to build the summary based on state
    const processItems = (items: any[], subTitle: string, state: any) => {
      const positives: string[] = [];
      const negatives: string[] = [];
      const findings: string[] = [];

      items.forEach(item => {
        const val = state?.[item.label];
        const info = state?.[`${item.label}_info`];
        const displayLabel = info ? `${item.label} (${info})` : item.label;

        if (val === true) {
          if (item.type === 'checkbox' || item.type === 'selectable') findings.push(displayLabel);
          else positives.push(displayLabel);
        } else if (val === false) {
          negatives.push(displayLabel);
        }
      });

      if (positives.length || negatives.length || findings.length || state?.custom || state?.negative) {
        let res = `<strong>${subTitle}:</strong> `;
        const parts: string[] = [];
        
        if (state?.negative) {
          parts.push("Negative");
        } else {
          if (positives.length) parts.push(`Positive for ${positives.join(", ")}`);
          if (negatives.length) parts.push(`Negative for ${negatives.join(", ")}`);
          if (findings.length) parts.push(`Findings: ${findings.join(", ")}`);
        }

        if (state?.custom) parts.push(state.custom);
        res += parts.join(". ");
        return res;
      }
      return null;
    };

    const processSubTab = (subTab: any, state: any) => {
      const subParts: string[] = [];
      
      // Handle groups
      if (subTab.groups) {
        subTab.groups.forEach((group: any) => {
          const res = processItems(group.items || [], group.name, state?.[group.name.toLowerCase()]);
          if (res) subParts.push(`<li>${res}</li>`);
        });
      }

      // Handle items directly in subTab
      if (subTab.items) {
        const res = processItems(subTab.items, "General", state);
        if (res) subParts.push(`<li>${res}</li>`);
      }

      // Handle sub_sub_tabs
      if (subTab.sub_sub_tabs) {
        subTab.sub_sub_tabs.forEach((sst: any) => {
          const sstRes = processSubTab(sst, state?.[sst.name.toLowerCase()]);
          if (sstRes) subParts.push(`<li><strong>${sst.name}:</strong><ul>${sstRes}</ul></li>`);
        });
      }

      return subParts.join("");
    };

    const subTabs = (sectionConfig.sub_tabs || []);
    subTabs.forEach((subTab: any) => {
      const subState = sectionData[subTab.name.toLowerCase()];
      if (!subState) return;

      const res = processSubTab(subTab, subState);
      if (res) {
        if (sectionHtml === '') sectionHtml += `<h3>${section}:</h3><ul>`;
        if (subTabs.length === 1) {
          sectionHtml += res;
        } else {
          sectionHtml += `<li><strong>${subTab.name}:</strong><ul>${res}</ul></li>`;
        }
      }
    });

    if (sectionHtml) {
      sectionHtml += "</ul>";
      html += sectionHtml;
    }
  });

  return html;
};

const RenderItems = ({ items, state, onUpdate }: { items: any[], state: any, onUpdate: (key: string, val: any) => void }) => {
  const [anchorEl, setAnchorEl] = React.useState<{ el: HTMLElement; label: string } | null>(null);
  const [commentValue, setCommentValue] = React.useState('');

  const handleDoubleClick = (event: React.MouseEvent<HTMLElement>, label: string) => {
    event.preventDefault();
    setCommentValue(state?.[`${label}_info`] || '');
    setAnchorEl({ el: event.currentTarget, label });
  };

  const handleCommentClose = () => {
    if (anchorEl) {
      onUpdate(`${anchorEl.label}_info`, commentValue);
    }
    setAnchorEl(null);
  };

  return (
    <Grid container spacing={1}>
      {items.map((item: any) => {
        const val = state?.[item.label];
        const info = state?.[`${item.label}_info`];
        const isCheckbox = item.type === 'checkbox' || item.type === 'selectable';

        if (isCheckbox) {
          return (
            <Grid key={item.label} size={6}>
              <Box
                onClick={(e) => { if (e.detail === 1) onUpdate(item.label, !val); }}
                onDoubleClick={(e) => handleDoubleClick(e, item.label)}
                sx={{
                  display: 'flex', alignItems: 'center', p: 0.25, borderRadius: 1,
                  cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' }
                }}>
                <Checkbox size="small" checked={!!val} sx={{ p: 0.25, mr: 0.25 }} />
                <Typography variant="caption" sx={{ lineHeight: 1.2, flexGrow: 1 }}>{item.label}</Typography>
                {info && <Icon sx={{ fontSize: 12, color: 'primary.main', ml: 0.5 }}>chat_bubble</Icon>}
              </Box>
            </Grid>
          );
        }

        return (
          <Grid key={item.label} size={6}>
            <Box
              onClick={(e) => { if (e.detail === 1) onUpdate(item.label, val === true ? null : true); }}
              onDoubleClick={(e) => handleDoubleClick(e, item.label)}
              sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                p: 0.5, px: 0.5, borderRadius: 1,
                bgcolor: val === true ? 'error.light' : val === false ? 'success.light' : 'action.selected',
                color: val != null ? 'white' : 'text.primary',
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative'
              }}>
              <Icon
                onClick={(e) => { e.stopPropagation(); onUpdate(item.label, val === true ? null : true); }}
                sx={{ fontSize: 16, opacity: val === true ? 1 : 0.5, '&:hover': { opacity: 1 }, mr: 1 }}>add</Icon>
              <Typography variant="caption" sx={{ fontWeight: val != null ? 'bold' : 'normal', flex: 1, display: 'flex', alignItems: 'center', textAlign: 'left', px: 0.5 }}>
                {item.label}
                {info && <Icon sx={{ fontSize: 12, ml: 0.5, color: val != null ? 'inherit' : 'primary.main', opacity: 0.8 }}>notes</Icon>}
              </Typography>
              <Icon
                onClick={(e) => { e.stopPropagation(); onUpdate(item.label, val === false ? null : false); }}
                sx={{ fontSize: 16, opacity: val === false ? 1 : 0.5, '&:hover': { opacity: 1 }, ml: 1 }}>remove</Icon>
            </Box>
          </Grid>
        );
      })}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl?.el}
        onClose={handleCommentClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 1, width: 220 }}>
          <Autocomplete
            freeSolo autoFocus fullWidth
            options={[]}
            value={commentValue}
            onInputChange={(_e, newValue) => setCommentValue(newValue)}
            TextFieldProps={{
              multiline: true, minRows: 2, maxRows: 4,
              placeholder: `Notes for ${anchorEl?.label}...`,
              variant: "outlined", size: "small"
            }}
          />
        </Box>
      </Popover>
    </Grid>
  );
};

const GenericBodySystemComponent = React.memo(({ title, config, state, onUpdate }: { title: string; config: any; state: any; onUpdate: (path: string[], val: any) => void }) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [tempNote, setTempNote] = React.useState('');

  const handleCustomNoteClick = (event: React.MouseEvent<HTMLElement>) => {
    setTempNote(state?.custom || '');
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    onUpdate(['custom'], tempNote);
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? `simple-popover-${title}` : undefined;

  return (
    <Box sx={{ border: '1px solid #ddd', padding: 1, width: '100%', borderRadius: 1, bgcolor: 'background.paper' }}>
      <Grid container spacing={0.5} alignItems="center" justifyContent="space-between" sx={{ borderBottom: '1px solid #eee', pb: 0.5, mb: 1 }}>
        <Grid>
          <IconButton aria-describedby={id} onClick={handleCustomNoteClick} size="small">
            <Icon sx={{ color: state?.custom ? 'primary.main' : 'action.active', fontSize: 20 }}>description</Icon>
          </IconButton>
        </Grid>
        <Grid size="grow">
          <Typography variant="subtitle2" sx={{ marginLeft: 1, fontWeight: 'bold' }}>{title}</Typography>
        </Grid>
        <Grid>
          <Box
            onClick={() => onUpdate(['negative'], !state?.negative)}
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' }, borderRadius: 1, px: 0.5 }}
          >
            <Checkbox
              size="small"
              checked={!!state?.negative}
              sx={{ p: 0 }}
            />
            <Typography variant="caption" sx={{ fontWeight: 'bold', mr: 0.25, fontSize: '0.65rem' }}>neg</Typography>
          </Box>
        </Grid>
      </Grid>
      
      <RecursiveSystemRenderer config={config} state={state} onUpdate={onUpdate} />

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <Box sx={{ p: 2, width: 300 }}>
          <Autocomplete
            freeSolo autoFocus fullWidth
            options={[]}
            value={tempNote}
            onInputChange={(_e, newValue) => setTempNote(newValue)}
            TextFieldProps={{
              multiline: true, minRows: 3, maxRows: 6,
              placeholder: `Add note for ${title}...`,
              variant: "outlined", size: "small"
            }}
          />
        </Box>
      </Popover>
    </Box>
  );
});

function RecursiveSystemRenderer({ config, state, onUpdate }: { config: any, state: any, onUpdate: (path: string[], val: any) => void }) {
  return (
    <Box sx={{ mb: 1 }}>
      {config.groups && (
        <Grid container spacing={1}>
          {config.groups.map((group: any) => (
            <Grid key={group.name} size={{ xs: 12, md: 6, lg: 4 }}>
              <GenericBodySystemComponent
                title={group.name}
                config={group}
                state={state?.[group.name.toLowerCase()] || {}}
                onUpdate={(path, val) => onUpdate([group.name.toLowerCase(), ...path], val)}
              />
            </Grid>
          ))}
        </Grid>
      )}
      
      {config.items && (
        <Box sx={{ mt: 1 }}>
          <RenderItems 
            items={config.items} 
            state={state} 
            onUpdate={(key, val) => onUpdate([key], val)} 
          />
        </Box>
      )}

      {config.sub_sub_tabs?.map((sst: any) => (
        <Box key={sst.name} sx={{ mt: 1, borderTop: '1px dashed #eee', pt: 1 }}>
          <Typography variant="subtitle2" sx={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'primary.main', mb: 0.5 }}>
            {sst.name}
          </Typography>
          <RecursiveSystemRenderer 
            config={sst} 
            state={state?.[sst.name.toLowerCase()]} 
            onUpdate={(path, val) => onUpdate([sst.name.toLowerCase(), ...path], val)} 
          />
        </Box>
      ))}

      {config.sides && (
        <Grid container spacing={2}>
          {Object.entries(config.sides).map(([side, sideItems]: [string, any]) => (
             <Grid key={side} size={6}>
                <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>{side}</Typography>
                <RenderItems 
                  items={Array.isArray(sideItems) ? sideItems : []} 
                  state={state?.[side.toLowerCase()] || {}} 
                  onUpdate={(key, val) => onUpdate([side.toLowerCase(), key], val)} 
                />
             </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

const GenericNoteWriterTab = ({ subTabs, state, updateState }: { subTabs: any[]; state: any; updateState: (fn: (prev: any) => any) => void }) => {
  const [activeSubTab, setActiveSubTab] = React.useState(subTabs[0]?.name || '');

  React.useEffect(() => {
    if (subTabs.length > 0 && !subTabs.find(t => t.name === activeSubTab)) {
      setActiveSubTab(subTabs[0].name);
    }
  }, [subTabs, activeSubTab]);

  const onUpdateHandler = (subTab: any) => (path: string[], val: any) => {
    updateState((prev: any) => {
      const sysKey = subTab.name.toLowerCase();
      const newSectionState = { ...prev };
      let currentLevel = newSectionState[sysKey] ? { ...newSectionState[sysKey] } : {};
      newSectionState[sysKey] = currentLevel;

      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        currentLevel[key] = currentLevel[key] ? { ...currentLevel[key] } : {};
        currentLevel = currentLevel[key];
      }

      const lastKey = path[path.length - 1];
      currentLevel[lastKey] = val;

      return newSectionState;
    });
  };

  return (
    <TabView value={activeSubTab}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        {subTabs.length > 1 && (
          <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'action.hover', minHeight: 40 }}>
            <TabList
              onChange={(_e: any, v: any) => setActiveSubTab(v)}
              variant="scrollable"
              scrollButtons="auto"
            >
              {subTabs.map((subTab: any) => (
                <Tab key={subTab.name} label={subTab.name} value={subTab.name} />
              ))}
            </TabList>
          </Box>
        )}
        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2, bgcolor: 'background.default' }}>
          {subTabs.map((subTab: any) => (
            <TabPanel key={subTab.name} value={subTab.name} sx={{ p: 0 }}>
              <RecursiveSystemRenderer
                config={subTab}
                state={state[subTab.name.toLowerCase()] || {}}
                onUpdate={onUpdateHandler(subTab)}
              />
            </TabPanel>
          ))}
        </Box>
      </Box>
    </TabView>
  );
};

export const NoteWriter = () => {
  const { useEncounter } = usePatient()
  const [] = useEncounter().smartData({} as any)
  const [activeSystems, setActiveSystems] = useEncounter().smartData.activeSystems({})
  const [selectedTabLabel, setSelectedTabLabel] = React.useState(Object.keys(systemsTemplate)[0] ?? '')

  // Ensure we switch to a valid tab if the initial one was empty or becomes invalid
  React.useEffect(() => {
    const keys = Object.keys(systemsTemplate);
    if (keys.length > 0 && (!selectedTabLabel || !keys.includes(selectedTabLabel))) {
      setSelectedTabLabel(keys[0]);
    }
  }, [selectedTabLabel]);

  const setSystemState = (sectionName: string, newStateOrFn: any) => {
    setActiveSystems((prev: any) => {
      const currentSectionState = (prev || {})[sectionName] || {};
      const newValue = typeof newStateOrFn === 'function' ? newStateOrFn(currentSectionState) : newStateOrFn;

      return {
        ...(prev || {}),
        [sectionName]: newValue
      };
    });
  };

  const TABS_CONFIG = Object.keys(systemsTemplate).map(key => ({
    id: key,
    label: key,
    config: systemsTemplate[key],
    state: activeSystems[key] || {},
    setter: (val: any) => setSystemState(key, val)
  }));

  const handleCopy = async () => {
    const html = generateHTML(activeSystems);
    if (!html) return;

    try {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html.replace(/<\/li>/g, '\n').replace(/<br\s*\/?>/g, '\n').replace(/<\/p>/g, '\n\n');
      const plainText = tempDiv.textContent || tempDiv.innerText || "";

      const blobHtml = new Blob([html], { type: 'text/html' });
      const blobText = new Blob([plainText], { type: 'text/plain' });

      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': blobHtml,
          'text/plain': blobText,
        })
      ]);
    } catch (err) {
      console.error('Failed to copy rich text:', err);
      navigator.clipboard.writeText(html);
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {TABS_CONFIG.length === 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', p: 4 }}>
          <Typography variant="h6" color="text.secondary">No configuration tabs found.</Typography>
          <Typography variant="caption" color="text.disabled" sx={{ mt: 2, maxWidth: 600, wordBreak: 'break-all' }}>
            Found keys: {Object.keys(rawConfig).join(', ') || 'none'}
          </Typography>
        </Box>
      ) : (
        <TabView value={selectedTabLabel}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}>
            <TabList onChange={(event: any, newTab: any) => setSelectedTabLabel(newTab)}>
              {TABS_CONFIG.map((tab) => (
                <Tab key={tab.id} label={tab.label} value={tab.id} />
              ))}
            </TabList>
            <Button size="small" variant="outlined" onClick={handleCopy}>Copy Text</Button>
          </Box>
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {TABS_CONFIG.map(tab => (
              <TabPanel key={tab.id} value={tab.id} sx={{ p: 0, height: '100%' }}>
                <GenericNoteWriterTab
                  subTabs={tab.config.sub_tabs || []}
                  state={tab.state}
                  updateState={tab.setter}
                />
              </TabPanel>
            ))}
          </Box>
        </TabView>
      )}
    </div>
  );
};

