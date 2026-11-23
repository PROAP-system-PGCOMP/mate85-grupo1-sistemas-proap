import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  Paper,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Delete, Edit, Add } from '@mui/icons-material';
import { CountryGroup } from '../../types';
import { normalizeText } from '../../helpers/dailyRate';

interface CountryGroupFieldProps {
  groups: CountryGroup[];
  onChange: (groups: CountryGroup[]) => void;
}

export default function CountryGroupField({
  groups,
  onChange,
}: CountryGroupFieldProps) {
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [currentGroup, setCurrentGroup] = useState<CountryGroup>({
    groupName: '',
    valueUSD: 0,
    countries: [],
  });
  const [newCountry, setNewCountry] = useState('');
  const [countryError, setCountryError] = useState('');

  // Grupo (diferente do que está sendo editado) que já contém o país, se houver
  const findOtherGroupWithCountry = (country: string): string | undefined => {
    const key = normalizeText(country);
    return groups.find(
      (group, index) =>
        index !== editIndex &&
        group.countries.some((c) => normalizeText(c) === key),
    )?.groupName;
  };

  const handleOpen = (index?: number) => {
    if (index !== undefined) {
      setEditIndex(index);
      setCurrentGroup({ ...groups[index] });
    } else {
      setEditIndex(null);
      setCurrentGroup({
        groupName: '',
        valueUSD: 0,
        countries: [],
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setNewCountry('');
    setCountryError('');
  };

  const handleAddGroup = () => {
    if (editIndex !== null) {
      const newGroups = [...groups];
      newGroups[editIndex] = currentGroup;
      onChange(newGroups);
    } else {
      onChange([...groups, currentGroup]);
    }
    handleClose();
  };

  const handleRemoveGroup = (index: number) => {
    const newGroups = [...groups];
    newGroups.splice(index, 1);
    onChange(newGroups);
  };

  const handleAddCountry = () => {
    const country = newCountry.trim();
    const otherGroup = country ? findOtherGroupWithCountry(country) : undefined;
    if (otherGroup !== undefined) {
      setCountryError(
        `"${country}" já pertence ao Grupo ${otherGroup}. Cada país deve estar em um único grupo.`,
      );
      return;
    }
    setCountryError('');
    if (
      newCountry.trim() !== '' &&
      !currentGroup.countries.some(
        (c) => normalizeText(c) === normalizeText(country),
      )
    ) {
      setCurrentGroup({
        ...currentGroup,
        countries: [...currentGroup.countries, newCountry.trim()],
      });
      setNewCountry('');
    }
  };

  const handleRemoveCountry = (country: string) => {
    setCurrentGroup({
      ...currentGroup,
      countries: currentGroup.countries.filter((c) => c !== country),
    });
  };

  return (
    <Box sx={{ my: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">
          Grupos de Países e Valores de Diárias (USD)
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
        >
          Adicionar Grupo
        </Button>
      </Box>

      <Paper elevation={1}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Grupo</TableCell>
              <TableCell>Valor Diária (USD)</TableCell>
              <TableCell>Países</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {groups.map((group, index) => (
              <TableRow key={group.id || index}>
                <TableCell>{group.groupName}</TableCell>
                <TableCell>${group.valueUSD}</TableCell>
                <TableCell>
                  {group.countries.length > 3
                    ? `${group.countries.slice(0, 3).join(', ')} e mais ${group.countries.length - 3}`
                    : group.countries.join(', ')}
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpen(index)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleRemoveGroup(index)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editIndex !== null
            ? 'Editar Grupo de Países'
            : 'Adicionar Grupo de Países'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Nome do Grupo"
                value={currentGroup.groupName}
                onChange={(e) =>
                  setCurrentGroup({
                    ...currentGroup,
                    groupName: e.target.value,
                  })
                }
                fullWidth
              />
              <TextField
                label="Valor da Diária (USD)"
                type="number"
                value={currentGroup.valueUSD}
                onChange={(e) =>
                  setCurrentGroup({
                    ...currentGroup,
                    valueUSD: parseFloat(e.target.value),
                  })
                }
                InputProps={{ inputProps: { min: 0, step: 10 } }}
                sx={{ width: 250 }}
              />
            </Box>

            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              Países
            </Typography>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                label="Adicionar país"
                value={newCountry}
                onChange={(e) => {
                  setNewCountry(e.target.value);
                  if (countryError) setCountryError('');
                }}
                error={Boolean(countryError)}
                helperText={countryError || undefined}
                fullWidth
              />
              <Button
                variant="contained"
                onClick={handleAddCountry}
                disabled={!newCountry.trim()}
              >
                Adicionar
              </Button>
            </Box>

            <Paper
              variant="outlined"
              sx={{ p: 2, minHeight: 100, maxHeight: 250, overflow: 'auto' }}
            >
              {currentGroup.countries.length === 0 ? (
                <Typography color="text.secondary">
                  Nenhum país adicionado
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {currentGroup.countries.map((country) => (
                    <Chip
                      key={country}
                      label={country}
                      onDelete={() => handleRemoveCountry(country)}
                    />
                  ))}
                </Box>
              )}
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button
            onClick={handleAddGroup}
            variant="contained"
            disabled={
              !currentGroup.groupName ||
              currentGroup.valueUSD <= 0 ||
              currentGroup.countries.length === 0
            }
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
