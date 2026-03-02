import * as React from 'react';
import { Window, Button, Icon, IconButton, Box, Label, Divider, Autocomplete } from 'components/ui/Core';
import { Avatar, colors } from '@mui/material';
import { usePatient, useDatabase, Database } from 'components/contexts/PatientContext';

const CareTeamDialog = ({ open, onClose, careTeam, setCareTeam, allProviders }: {
  open: boolean;
  onClose: () => void;
  careTeam: Database.CareTeam[];
  setCareTeam: (careTeam: Database.CareTeam[]) => void;
  allProviders: Database.Provider[];
}) => {
  const [localCareTeam, setLocalCareTeam] = React.useState(careTeam || []);
  const [newProviderId, setNewProviderId] = React.useState<Database.Provider.ID | null>(null);
  const [newProviderRole, setNewProviderRole] = React.useState<Database.CareTeam["role"]>('');

  React.useEffect(() => {
    setLocalCareTeam(careTeam || []);
  }, [careTeam]);

  const handleSave = () => {
    setCareTeam(localCareTeam);
    onClose();
  };

  const handleAddMember = () => {
    if (newProviderId && newProviderRole) {
      if (localCareTeam.some((m) => m.provider === newProviderId)) {
        alert("Provider already in care team!");
        return;
      }
      setLocalCareTeam([...localCareTeam, { provider: newProviderId, role: newProviderRole }]);
      setNewProviderId(null);
      setNewProviderRole('');
    }
  };

  const handleRemoveMember = (providerId: string) => {
    setLocalCareTeam(localCareTeam.filter((m) => m.provider !== providerId));
  };

  const handleRoleChange = (providerId: string, newRole: string) => {
    setLocalCareTeam(localCareTeam.map((m) =>
      m.provider === providerId ? { ...m, role: newRole } : m
    ));
  };

  const availableProviders = allProviders.filter((p) => !localCareTeam.some((m) => m.provider === p.id));

  return (
    <Window
      open={open}
      onClose={onClose}
      title="Manage Care Team"
      maxWidth="md"
      fullWidth
      footer={
        <Button variant="contained" onClick={handleSave}>Save Changes</Button>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {localCareTeam.map((member) => {
          const provider = allProviders.find((p) => p.id === member.provider);
          return (
            <Box key={member.provider} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1, border: '1px solid #eee', borderRadius: 1 }}>
              <Avatar
                src={undefined}
                sx={{ bgcolor: colors.blue[500], height: 40, width: 40 }}
              >
                {provider?.name.split(" ").map((x) => x?.charAt(0) ?? '').join("")}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Label variant="subtitle1">{provider?.name}</Label>
                <Label variant="caption" color="textSecondary">{provider?.specialty}</Label>
              </Box>
              <Autocomplete
                freeSolo
                label="Role"
                size="small"
                options={['Attending', 'Resident', 'Fellow', 'Nurse', 'Medical Student', 'Social Worker', 'Consultant']}
                value={member.role}
                onInputChange={(_e, newInputValue) => handleRoleChange(member.provider, newInputValue)}
                sx={{ width: 170 }}
              />
              <IconButton onClick={() => handleRemoveMember(member.provider)} color="error">
                <Icon>delete</Icon>
              </IconButton>
            </Box>
          );
        })}

        {localCareTeam.length === 0 && <Label sx={{ fontStyle: 'italic', color: 'text.secondary' }}>No care team members assigned.</Label>}

        <Divider sx={{ my: 1 }}>Add New Member</Divider>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <Autocomplete
            label="Provider"
            options={availableProviders}
            value={availableProviders.find(p => p.id === newProviderId) || null}
            onChange={(_e, newValue: any) => setNewProviderId(newValue?.id || null)}
            getOptionLabel={(option: any) => option.name ? `${option.name} - ${option.specialty}` : ''}
            sx={{ flex: 1 }}
          />
          <Autocomplete
            freeSolo
            label="Role"
            size="small"
            options={['Attending', 'Resident', 'Fellow', 'Nurse', 'Medical Student', 'Social Worker', 'Consultant']}
            value={newProviderRole}
            onInputChange={(_e, newInputValue) => setNewProviderRole(newInputValue)}
            sx={{ flex: 1 }}
          />
          <Button variant="contained" onClick={handleAddMember} disabled={!newProviderId || !newProviderRole}>
            Add
          </Button>
        </Box>
      </Box>
    </Window>
  );
};

export const SidebarCareTeam = () => {
  const { useChart } = usePatient();
  const [careTeam, setCareTeam] = useChart().careTeam();
  const [providers] = useDatabase().providers();
  const [insurance] = useChart().insurance();
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <div
        style={{ display: 'flex', flexDirection: "column", marginBottom: '1em', cursor: 'pointer' }}
        onClick={() => setOpen(true)}
      >
        <Label variant="h6" color="inherit" style={{ fontSize: '1.25em', marginBottom: '0.5em' }}>
          Care Team <Icon sx={{ fontSize: '0.8em', verticalAlign: 'middle', opacity: 0.5 }}>edit</Icon>
        </Label>
        {(careTeam || []).map((member: any) => {
          const provider = providers.find((p: any) => p.id === member.provider);
          return (
            <div key={member.provider} style={{ display: 'flex', marginBottom: '0.5em' }}>
              <Avatar
                src={undefined}
                sx={{ bgcolor: colors.blue[500], height: 50, width: 50, margin: 'auto 1em auto 0' }}
              >
                {provider?.name.split(" ").map((x) => x?.charAt(0) ?? '').join("")}
              </Avatar>
              <div style={{ display: 'flex', flexDirection: "column", margin: 'auto 0 auto 0' }}>
                <span>{provider?.name}</span>
                <strong>{member.role}</strong>
              </div>
            </div>
          )
        })}
        {(!careTeam || careTeam.length === 0) && <i>Click to add care team</i>}
      </div>
      <span>Coverage: <span style={{ textTransform: 'uppercase' }}>{insurance?.carrierName}</span></span>

      <CareTeamDialog
        open={open}
        onClose={() => setOpen(false)}
        careTeam={careTeam!}
        setCareTeam={setCareTeam}
        allProviders={providers}
      />
    </>
  )
}
